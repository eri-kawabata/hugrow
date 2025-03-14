import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image, Calendar, BookOpen, Users, Activity, Clock, Loader2, BookOpenCheck, TrendingUp, Settings, Bell, Star, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
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
  const [childName, setChildName] = useState<string>('お子様');
  const [stats, setStats] = useState({
    totalWorks: 0,
    totalEmotions: 0,
    totalLearning: 0
  });

  useEffect(() => {
    fetchRecentActivities();
    fetchChildName();
    fetchStats();
  }, []);

  // 子供の名前を取得する関数
  const fetchChildName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('parent_id', user.id)
        .eq('role', 'child')
        .maybeSingle();
        
      if (error) throw error;
      if (data && data.username) {
        setChildName(data.username);
      }
    } catch (error) {
      console.error('子供の名前取得エラー:', error);
    }
  };

  // 統計データを取得する関数
  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 作品の総数を取得
      const { count: worksCount, error: worksError } = await supabase
        .from('works')
        .select('*', { count: 'exact', head: true });

      // 感情記録の総数を取得
      const { count: emotionsCount, error: emotionsError } = await supabase
        .from('sel_responses')
        .select('*', { count: 'exact', head: true });

      // 学習活動の総数を取得
      let learningCount = 0;
      try {
        const { count, error } = await supabase
          .from('learning_activities')
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          learningCount = count;
        }
      } catch (error) {
        console.error('学習データの取得エラー:', error);
      }

      setStats({
        totalWorks: worksCount || 0,
        totalEmotions: emotionsCount || 0,
        totalLearning: learningCount
      });
    } catch (error) {
      console.error('統計データの取得エラー:', error);
    }
  };

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

  // 活動タイプに応じたアイコンを返す関数
  const getActivityIcon = (type: string) => {
    switch (type) {
      case '作品':
        return <Image className="h-5 w-5 text-indigo-600" />;
      case '感情記録':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case '学習':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* ヘッダーセクション - 改良版 */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-500 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden animate-fadeIn">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="block text-indigo-100 text-lg md:text-xl font-normal">ようこそ</span>
                {childName}の保護者ダッシュボード
              </h1>
              <p className="text-indigo-100 mb-4">お子様の成長を見守り、サポートしましょう</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-xs font-medium">今日の日付</p>
                  <p className="text-sm font-semibold">{new Date().toLocaleDateString('ja-JP')}</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <div>
                  <p className="text-xs font-medium">最近の活動</p>
                  <p className="text-sm font-semibold">{recentActivities.length}件</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 animate-slideUp">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 bg-white/30 rounded-full">
                <Image className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-100">作品数</p>
                <p className="text-xl font-bold">{stats.totalWorks}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 bg-white/30 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-100">感情記録</p>
                <p className="text-xl font-bold">{stats.totalEmotions}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
              <div className="p-2 bg-white/30 rounded-full">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-100">学習活動</p>
                <p className="text-xl font-bold">{stats.totalLearning}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側のメインコンテンツエリア */}
        <div className="lg:col-span-2 space-y-6">
          {/* クイックアクセスカード */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              クイックアクセス
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link
                to="/parent/analytics/sel"
                className="group p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-indigo-50">
                    <Heart className="h-6 w-6 text-pink-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">感情分析</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/analytics"
                className="group p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-blue-50">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">学習分析</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/works"
                className="group p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-purple-50">
                    <Image className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">作品一覧</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/profile"
                className="group p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-green-50">
                    <Settings className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">設定</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/profile/child"
                className="group p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-amber-50">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">子供情報</h3>
                </div>
              </Link>
              
              <Link
                to="/child/sel-quest"
                className="group p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-teal-50">
                    <BookOpenCheck className="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 className="font-medium text-gray-900">きもちクエスト</h3>
                </div>
              </Link>
            </div>
          </div>

          {/* 最近の活動セクション */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                最近の活動
              </h2>
              <Link to="/parent/works" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center hover:underline">
                すべて見る <span className="ml-1">→</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600">データを読み込み中...</span>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.type === '作品' && activity.title}
                          {activity.type === '感情記録' && `感情: ${activity.emotion}`}
                          {activity.type === '学習' && `科目: ${activity.subject}`}
                        </p>
                        <p className="text-xs text-gray-500">{activity.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
                  最近の活動はありません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側のサイドバーエリア */}
        <div className="space-y-6">
          {/* お知らせカード */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-indigo-600" />
              お知らせ
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">新機能のお知らせ</p>
                    <p className="text-xs text-blue-600 mt-1">感情分析機能が追加されました。お子様の感情の変化を確認できます。</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-green-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">学習進捗</p>
                    <p className="text-xs text-green-600 mt-1">お子様が新しい学習コンテンツを完了しました。</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">イベント情報</p>
                    <p className="text-xs text-amber-600 mt-1">次回のオンラインイベントは3月15日です。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/parent/notifications" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center hover:underline">
                すべてのお知らせを見る <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          {/* 子供の成長カード */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              {childName}の成長
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">感情理解</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-pink-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-2">70%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">学習進捗</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: '45%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-2">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">創造性</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-2">85%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/parent/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center hover:underline">
                詳細を見る <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
          
          {/* 今日のヒントカード */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-6 border border-indigo-100 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-amber-500" />
              今日のヒント
            </h2>
            <p className="text-sm text-indigo-800">
              お子様の感情表現を促すために、「今日はどんな気持ちだった？」と具体的に質問してみましょう。感情を言葉で表現する練習になります。
            </p>
            <div className="mt-3 flex justify-end">
              <Link to="/parent/tips" className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">
                もっと見る →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 