import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Link, useNavigate } from 'react-router-dom';
import { Beaker, Cpu, Wrench, Palette, Calculator, Sparkles, Trophy, ArrowRight, Star, Brain } from 'lucide-react';
import { getTodaysChallenge } from '../lib/challenges';
import { supabase } from '../lib/supabase';

type ProgressStats = {
  weeklyTime: number;
  monthlyTime: number;
  totalChallenges: number;
  completedChallenges: number;
};

export function Learning() {
  const navigate = useNavigate();
  const dailyChallenge = getTodaysChallenge();
  const [stats, setStats] = useState<ProgressStats>({
    weeklyTime: 0,
    monthlyTime: 0,
    totalChallenges: 0,
    completedChallenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isParentMode, setIsParentMode] = useState(false);

  useEffect(() => {
    checkParentMode();
    if (isParentMode) {
      fetchStats();
    }
  }, [isParentMode]);

  const checkParentMode = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsParentMode(profile?.role === 'parent');
    } catch (error) {
      console.error('Error checking parent mode:', error);
    }
  };

  const fetchStats = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 実際のデータ取得処理をここに実装
      // このサンプルではダミーデータを使用
      setStats({
        weeklyTime: 12.5,
        monthlyTime: 45.2,
        totalChallenges: 24,
        completedChallenges: 18,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const steamModules = [
    {
      title: 'Science',
      description: '身近な科学実験に挑戦しよう',
      icon: Beaker,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/learning/science',
      progress: 85,
      challenges: [
        '水の状態変化を観察しよう',
        '植物の成長日記をつけよう',
        '光の性質を調べよう'
      ]
    },
    {
      title: 'Technology',
      description: 'デジタルツールを使って創造しよう',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: '/learning/technology',
      progress: 70,
      challenges: [
        'お絵描きソフトで絵を描こう',
        '簡単なアニメーションを作ろう',
        'プログラミングで図形を描こう'
      ]
    },
    {
      title: 'Engineering',
      description: '身の回りの問題を解決しよう',
      icon: Wrench,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      path: '/learning/engineering',
      progress: 60,
      challenges: [
        '橋を作って強度を試そう',
        'リサイクル材で作品を作ろう',
        '風で動く装置を作ろう'
      ]
    },
    {
      title: 'Arts',
      description: '感性を活かして表現しよう',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-100',
      path: '/learning/arts',
      progress: 75,
      challenges: [
        '色の組み合わせで感情を表現',
        '自然物でコラージュを作ろう',
        '音楽を絵で表現してみよう'
      ]
    },
    {
      title: 'Mathematics',
      description: '数や図形の面白さを発見しよう',
      icon: Calculator,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/learning/mathematics',
      progress: 90,
      challenges: [
        'パターンを見つけて続きを考えよう',
        '折り紙で図形を作ろう',
        '数字で絵を描いてみよう'
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Daily Challenge */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8" />
              <h2 className="text-2xl font-bold">今日のスペシャルチャレンジ</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <dailyChallenge.icon className="h-6 w-6" />
              <h3 className="text-xl font-semibold">{dailyChallenge.title}</h3>
            </div>
            <p className="text-lg mb-6">{dailyChallenge.description}</p>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>{dailyChallenge.points} ポイント</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>ボーナス {dailyChallenge.bonus} ポイント</span>
                </div>
                <div className="text-sm opacity-75">今日の23:59まで</div>
              </div>
              <button
                onClick={() => navigate('/challenge')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-lg"
              >
                チャレンジする
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview - Only visible in parent mode */}
        {isParentMode && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-600" />
              学習の進捗状況
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="text-sm text-indigo-600 mb-1">今週の学習時間</div>
                <div className="text-2xl font-bold text-indigo-700">{stats.weeklyTime}時間</div>
                <div className="text-sm text-indigo-600">目標: 15時間</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-green-600 mb-1">今月の学習時間</div>
                <div className="text-2xl font-bold text-green-700">{stats.monthlyTime}時間</div>
                <div className="text-sm text-green-600">目標: 50時間</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="text-sm text-orange-600 mb-1">チャレンジ達成率</div>
                <div className="text-2xl font-bold text-orange-700">
                  {Math.round((stats.completedChallenges / stats.totalChallenges) * 100)}%
                </div>
                <div className="text-sm text-orange-600">{stats.completedChallenges}/{stats.totalChallenges}完了</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-purple-600 mb-1">今月の獲得ポイント</div>
                <div className="text-2xl font-bold text-purple-700">850</div>
                <div className="text-sm text-purple-600">目標: 1000ポイント</div>
              </div>
            </div>
          </div>
        )}

        {/* STEAM Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steamModules.map((module, index) => (
            <Link
              key={index}
              to={module.path}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`${module.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <module.icon className={`h-6 w-6 ${module.textColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  {isParentMode && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">進捗</span>
                        <span className={module.textColor}>{module.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${module.color} rounded-full transition-all duration-300`}
                          style={{ width: `${module.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {module.challenges.map((challenge, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <span>{challenge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}