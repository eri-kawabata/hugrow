import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  BarChart, Brain, Sparkles, TrendingUp, Award, Target,
  Clock, Star, Calendar, Beaker, Cpu, Wrench, Palette, Calculator
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LearningProgress, UserAchievement, Streak } from '../lib/types';
import toast from 'react-hot-toast';

type SubjectProgress = {
  subject: string;
  progress: number;
  color: string;
  icon: React.ReactNode;
};

export function Report() {
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('ログインが必要です');
        return;
      }

      // 学習進捗を取得
      const { data: progressData, error: progressError } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // 実績を取得
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          achievement_id,
          earned_at,
          achievements (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) throw achievementsError;

      // ストリーク情報を取得
      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      // ストリークデータが存在しない場合は新規作成
      if (!streakData) {
        const { data: newStreak, error: insertError } = await supabase
          .from('streaks')
          .insert({
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setStreak(newStreak);
      } else {
        setStreak(streakData);
      }

      setLearningProgress(progressData || []);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const subjects: SubjectProgress[] = [
    {
      subject: 'Science',
      progress: 85,
      color: 'bg-blue-600',
      icon: <Beaker className="h-5 w-5 text-blue-600" />
    },
    {
      subject: 'Technology',
      progress: 70,
      color: 'bg-purple-600',
      icon: <Cpu className="h-5 w-5 text-purple-600" />
    },
    {
      subject: 'Engineering',
      progress: 60,
      color: 'bg-orange-600',
      icon: <Wrench className="h-5 w-5 text-orange-600" />
    },
    {
      subject: 'Arts',
      progress: 75,
      color: 'bg-pink-600',
      icon: <Palette className="h-5 w-5 text-pink-600" />
    },
    {
      subject: 'Mathematics',
      progress: 90,
      color: 'bg-green-600',
      icon: <Calculator className="h-5 w-5 text-green-600" />
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart className="h-6 w-6 text-indigo-600" />
            学習レポート
          </h1>
          <p className="text-gray-600 mt-2">お子様の学習進捗と成長の記録</p>
        </div>

        {/* 学習の概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">学習継続日数</h3>
            </div>
            <div className="text-3xl font-bold text-indigo-600">
              {streak?.current_streak || 0}
              <span className="text-base font-normal text-gray-600 ml-1">日</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              最長: {streak?.longest_streak || 0}日
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">獲得ポイント</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              850
              <span className="text-base font-normal text-gray-600 ml-1">pt</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              今月の目標まで: 150pt
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">学習時間</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              12.5
              <span className="text-base font-normal text-gray-600 ml-1">時間</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              先週比: +2.5時間
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">獲得バッジ</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {achievements.length}
              <span className="text-base font-normal text-gray-600 ml-1">個</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              次のバッジまで: 2チャレンジ
            </p>
          </div>
        </div>

        {/* 学習進捗グラフ */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">学習の進み具合</h2>
          </div>
          <div className="space-y-6">
            {subjects.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {subject.icon}
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <span className="text-gray-600">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`${subject.color} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近の実績 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">最近の実績</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-xl border-2 border-gray-100 flex items-center gap-3"
              >
                <img
                  src={achievement.achievements?.icon_url}
                  alt=""
                  className="w-12 h-12"
                />
                <div>
                  <div className="font-medium">{achievement.achievements?.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(achievement.earned_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今後の目標 */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">今後の目標</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium">チャレンジ達成</h3>
              </div>
              <p className="text-sm text-gray-600">
                週に3つのチャレンジに挑戦して、新しいスキルを身につけましょう
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h3 className="font-medium">学習時間の増加</h3>
              </div>
              <p className="text-sm text-gray-600">
                毎日30分以上の学習時間を確保して、着実に成長を積み重ねましょう
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}