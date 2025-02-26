import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { Sparkles, Palette, Brain, Beaker, Calculator, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Work } from '../lib/types';

export function Home() {
  const [recentWorks, setRecentWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  const allRecommendedLearning = [
    {
      title: '色の組み合わせを学ぼう',
      description: '今日は補色について学びます。オレンジと青を使って絵を描いてみましょう。',
      icon: Palette,
      color: 'bg-pink-100',
      textColor: 'text-pink-600',
      borderColor: 'hover:border-pink-200',
      path: '/learning/arts',
      progress: 65,
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    },
    {
      title: '科学実験に挑戦！',
      description: '水の性質について実験します。氷を溶かして状態変化を観察しよう。',
      icon: Beaker,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'hover:border-blue-200',
      path: '/learning/science',
      progress: 45,
      image: 'https://images.unsplash.com/photo-1532634993-15f421e42ec0?auto=format&fit=crop&q=80&w=400',
    },
    {
      title: '数字のパターンを見つけよう',
      description: '身の回りにある数字のパターンを探して、規則性を見つけましょう。',
      icon: Calculator,
      color: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'hover:border-green-200',
      path: '/learning/mathematics',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
    }
  ];

  // 今日の日付をシードとして使用して、毎日同じ学習を表示
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const recommendedLearning = allRecommendedLearning[seed % allRecommendedLearning.length];

  useEffect(() => {
    fetchRecentWorks();
  }, []);

  const fetchRecentWorks = async () => {
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      setRecentWorks(data || []);
    } catch (error) {
      console.error('Error fetching recent works:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-3">おかえりなさい！</h2>
          <p className="text-lg opacity-90">今日も一緒に楽しく学びましょう</p>
        </div>

        {/* Recommended Learning */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold">今日のおすすめ</h2>
            </div>
            <Link
              to="/learning"
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              もっと見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Link
            to={recommendedLearning.path}
            className="block group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={recommendedLearning.image}
                alt={recommendedLearning.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
              <div className={`absolute top-4 left-4 ${recommendedLearning.color} p-3 rounded-xl`}>
                <recommendedLearning.icon className={`h-8 w-8 ${recommendedLearning.textColor}`} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                {recommendedLearning.title}
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                {recommendedLearning.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">進捗</span>
                  <span className={recommendedLearning.textColor}>{recommendedLearning.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${recommendedLearning.color} rounded-full transition-all duration-300`}
                    style={{ width: `${recommendedLearning.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Recent Works */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-6 w-6 text-indigo-600" />
              最近の作品
            </h2>
            <Link
              to="/works"
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              すべて見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">作品を読み込んでいます...</p>
              </div>
            ) : recentWorks.length > 0 ? (
              recentWorks.map((work) => (
                <div
                  key={work.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {work.media_url && work.media_type === 'image' && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={work.media_url}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {work.media_url && work.media_type === 'video' && (
                    <div className="relative h-48 overflow-hidden">
                      <video
                        src={work.media_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                      {work.title}
                    </h3>
                    {work.description && (
                      <p className="text-gray-600 text-sm mb-2">{work.description}</p>
                    )}
                    <div className="text-sm text-gray-600">
                      <span>{formatDate(work.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">まだ作品がありません</p>
                <Link
                  to="/works/new"
                  className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                >
                  <span>作品を投稿する</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}