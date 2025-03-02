import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Reward, Achievement } from '@/types/database';

export function useRewards(userId: string) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        setError(null);

        // 報酬を取得
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (rewardsError) throw rewardsError;

        // 実績を取得
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (achievementsError) throw achievementsError;

        setRewards(rewardsData);
        setAchievements(achievementsData);
        setTotalPoints(rewardsData.reduce((sum, reward) => sum + reward.points, 0));
      } catch (err) {
        console.error('Error fetching rewards:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [userId]);

  const addReward = async (
    type: Reward['type'],
    points: number,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert({
          user_id: userId,
          type,
          points,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      setRewards(prev => [data, ...prev]);
      setTotalPoints(prev => prev + points);

      return data;
    } catch (err) {
      console.error('Error adding reward:', err);
      throw err;
    }
  };

  const checkAchievements = async () => {
    try {
      const { data: achievementsData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null);

      if (error) throw error;

      // 各実績の進捗を更新
      const updates = achievementsData.map(async (achievement) => {
        const progress = await calculateProgress(achievement);
        if (progress >= 100) {
          // 実績達成時の報酬を付与
          await addReward('achievement', achievement.requirements.points || 0, {
            achievement_id: achievement.id,
            title: achievement.title,
          });

          // 実績を完了状態に更新
          const { data, error: updateError } = await supabase
            .from('achievements')
            .update({
              progress: 100,
              completed_at: new Date().toISOString(),
            })
            .eq('id', achievement.id)
            .select()
            .single();

          if (updateError) throw updateError;
          return data;
        } else {
          // 進捗のみ更新
          const { data, error: updateError } = await supabase
            .from('achievements')
            .update({ progress })
            .eq('id', achievement.id)
            .select()
            .single();

          if (updateError) throw updateError;
          return data;
        }
      });

      const updatedAchievements = await Promise.all(updates);
      setAchievements(prev => 
        prev.map(achievement => 
          updatedAchievements.find(updated => updated.id === achievement.id) || achievement
        )
      );
    } catch (err) {
      console.error('Error checking achievements:', err);
      throw err;
    }
  };

  const calculateProgress = async (achievement: Achievement): Promise<number> => {
    const { type, requirements } = achievement;

    switch (type) {
      case 'lesson_complete': {
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'completed');

        if (error) throw error;
        return Math.min(100, (data.length / requirements.count) * 100);
      }

      case 'quiz_perfect': {
        const { data, error } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('user_id', userId)
          .eq('is_correct', true);

        if (error) throw error;
        return Math.min(100, (data.length / requirements.count) * 100);
      }

      case 'streak': {
        // ストリーク（連続学習日数）の計算
        const { data, error } = await supabase
          .from('learning_progress')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(requirements.days);

        if (error) throw error;

        let streak = 0;
        let lastDate = new Date();
        
        for (const progress of data) {
          const currentDate = new Date(progress.created_at);
          const diffDays = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            streak++;
            lastDate = currentDate;
          } else {
            break;
          }
        }

        return Math.min(100, (streak / requirements.days) * 100);
      }

      default:
        return 0;
    }
  };

  return {
    rewards,
    achievements,
    totalPoints,
    loading,
    error,
    addReward,
    checkAchievements,
  };
} 