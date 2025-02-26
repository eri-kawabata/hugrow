import type { Streak, Achievement, UserAchievement } from './types';
import { supabase } from './supabase';
import toast from 'react-hot-toast';
import * as confetti from 'canvas-confetti';

export const achievements: Achievement[] = [
  {
    id: 'streak-3',
    title: '3日連続チャレンジ',
    description: '3日連続で学習を続けました！',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=streak3',
    category: 'streak',
    required_value: 3,
    reward_points: 100
  },
  {
    id: 'streak-7',
    title: '週間マスター',
    description: '7日連続で学習を続けました！',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=streak7',
    category: 'streak',
    required_value: 7,
    reward_points: 300
  },
  {
    id: 'streak-30',
    title: '月間チャンピオン',
    description: '30日連続で学習を続けました！',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=streak30',
    category: 'streak',
    required_value: 30,
    reward_points: 1000
  },
  {
    id: 'challenge-5',
    title: 'チャレンジャー',
    description: '5つのチャレンジを完了しました！',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=challenge5',
    category: 'challenge',
    required_value: 5,
    reward_points: 200
  },
  {
    id: 'skill-80',
    title: 'スキルマスター',
    description: 'いずれかのスキルが80%に到達しました！',
    icon_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=skill80',
    category: 'skill',
    required_value: 80,
    reward_points: 500
  }
];

export async function updateStreak(): Promise<Streak | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 現在のストリーク情報を取得
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }

    const lastActivity = streakData?.last_activity_date
      ? new Date(streakData.last_activity_date)
      : null;
    lastActivity?.setHours(0, 0, 0, 0);

    let currentStreak = streakData?.current_streak || 0;
    let longestStreak = streakData?.longest_streak || 0;

    // 昨日の日付を取得
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastActivity || lastActivity < yesterday) {
      // ストリークが切れた場合
      currentStreak = 1;
    } else if (lastActivity.getTime() === yesterday.getTime()) {
      // ストリークを継続
      currentStreak += 1;
    } else if (lastActivity.getTime() === today.getTime()) {
      // 今日すでに更新済み
      return streakData;
    }

    // 最長ストリークを更新
    longestStreak = Math.max(currentStreak, longestStreak);

    // ストリーク情報を更新
    const { data: updatedStreak, error: updateError } = await supabase
      .from('streaks')
      .upsert({
        user_id: user.id,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today.toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (updateError) throw updateError;

    // ストリーク達成に応じた実績を確認
    const streakAchievements = achievements.filter(a => 
      a.category === 'streak' && 
      a.required_value === currentStreak
    );

    for (const achievement of streakAchievements) {
      await checkAndAwardAchievement(achievement.id);
    }

    return updatedStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
}

export async function checkAndAwardAchievement(achievementId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // すでに獲得済みかチェック
    const { data: existingAchievement } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (existingAchievement) return false;

    // 新しい実績を追加
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        earned_at: new Date().toISOString()
      });

    if (error) throw error;

    // 実績獲得の演出
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(
        <div className="flex flex-col items-center gap-2">
          <img src={achievement.icon_url} alt="" className="w-12 h-12" />
          <div>
            <div className="font-bold">{achievement.title}を獲得！</div>
            <div className="text-sm">{achievement.description}</div>
          </div>
        </div>,
        { duration: 5000 }
      );
    }

    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
}

export async function getUserAchievements(): Promise<UserAchievement[]> {
  if (!supabase) return [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        user_id,
        achievement_id,
        earned_at,
        achievement:achievements (*)
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}