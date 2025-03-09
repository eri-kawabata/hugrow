import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image, Calendar, BookOpen, Users, Activity, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// 活動データの型定義
type ActivityItem = {
  id: string;
  type: '作品' | '感情記録' | '学習';
  title?: string;
  emotion?: string;
  subject?: string;
  date: string;
  created_at: string;
};

export const ParentDashboard: React.FC = () => {
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  // 最近の活動データを取得する関数
  const fetchRecentActivities = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      
      // 作品データの取得
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (worksError) {
        console.error('Error fetching works:', worksError);
        throw worksError;
      }

      // 感情記録データの取得
      const { data: emotionData, error: emotionError } = await supabase
        .from('sel_responses')
        .select(`
          id,
          emotion,
          created_at,
          note
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (emotionError) {
        console.error('Error fetching emotions:', emotionError);
        throw emotionError;
      }

      // 学習活動データの取得（テーブルが存在する場合）
      let learningData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('learning_activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!error && data) {
          learningData = data;
        }
      } catch (learningError) {
        console.error('学習データの取得エラー（テーブルが存在しない可能性があります）:', learningError);
        // 学習データの取得に失敗しても処理を続行
      }

      console.log('取得したデータ:', { worksData, emotionData, learningData });

      // すべてのデータを結合して日付順にソート
      const allActivities: ActivityItem[] = [
        // 作品データを活動リストに変換
        ...(worksData || []).map(work => ({
          id: work.id,
          type: '作品' as const,
          title: work.title || '無題',
          date: formatDate(work.created_at),
          created_at: work.created_at
        })),
        
        // 感情記録データを活動リストに変換
        ...(emotionData || []).map(emotion => ({
          id: emotion.id,
          type: '感情記録' as const,
          emotion: emotion.emotion,
          title: emotion.note || undefined,
          date: formatDate(emotion.created_at),
          created_at: emotion.created_at
        })),
        
        // 学習データを活動リストに変換
        ...(learningData || []).map(learning => ({
          id: learning.id,
          type: '学習' as const,
          subject: learning.subject || '学習',
          title: learning.title || undefined,
          date: formatDate(learning.created_at),
          created_at: learning.created_at
        }))
      ];

      // 日付の新しい順にソート
      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 最大10件に制限
      const recentActivities = allActivities.slice(0, 10);

      if (recentActivities.length > 0) {
        setRecentActivities(recentActivities);
      } else {
        // データがない場合は空の配列を設定
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      toast.error('最近の活動データの取得に失敗しました');
      // エラー時は空の配列を設定
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '日付なし';
    
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('日付のフォーマットエラー:', e);
      return '日付エラー';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ヘッダーセクション */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">保護者ダッシュボード</h1>
        <p className="text-indigo-100">お子様の成長を見守りましょう</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">今日の日付</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString('ja-JP')}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
            <Activity className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">最近の活動</p>
              <p className="text-lg font-semibold">{recentActivities.length}件</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインナビゲーションカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/parent/analytics/sel"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Heart className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">感情分析</h2>
              <p className="text-sm text-gray-500">お子様の感情の変化を確認</p>
            </div>
          </div>
        </Link>

        <Link
          to="/parent/analytics/arts"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <BarChart2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">学習分析</h2>
              <p className="text-sm text-gray-500">学習の進捗を確認</p>
            </div>
          </div>
        </Link>

        <Link
          to="/parent/works"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">作品一覧</h2>
              <p className="text-sm text-gray-500">お子様の作品を確認</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 追加のナビゲーションカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/parent/profile"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">プロフィール</h2>
              <p className="text-sm text-gray-500">アカウント設定を管理</p>
            </div>
          </div>
        </Link>

        <Link
          to="/parent/profile/child"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">子供プロフィール</h2>
              <p className="text-sm text-gray-500">お子様の情報を管理</p>
            </div>
          </div>
        </Link>

        <Link
          to="/child/sel-quest"
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] border border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">きもちクエスト</h2>
              <p className="text-sm text-gray-500">感情学習ツールを確認</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 最近の活動セクション */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            最近の活動
          </h2>
          <Link to="/parent/works" className="text-sm text-indigo-600 hover:text-indigo-700">
            すべて見る →
          </Link>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="ml-2 text-gray-600">データを読み込み中...</span>
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  {activity.type === '作品' && <Image className="h-5 w-5 text-indigo-600" />}
                  {activity.type === '感情記録' && <Heart className="h-5 w-5 text-pink-500" />}
                  {activity.type === '学習' && <BookOpen className="h-5 w-5 text-blue-500" />}
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.type === '作品' && activity.title}
                      {activity.type === '感情記録' && `感情: ${activity.emotion}`}
                      {activity.type === '学習' && `科目: ${activity.subject}`}
                    </p>
                    <p className="text-xs text-gray-500">{activity.type}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              最近の活動はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 