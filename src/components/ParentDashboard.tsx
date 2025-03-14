import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image, Calendar, BookOpen, Users, Activity, Clock, Loader2, BookOpenCheck, TrendingUp, Settings, Bell, Star, AlertCircle, CheckCircle2, BarChart3, ChevronDown, UserPlus } from 'lucide-react';
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

// 子供データの型定義
type ChildProfile = {
  id: string;
  username: string;
  avatar_url?: string;
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
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isChildrenDropdownOpen, setIsChildrenDropdownOpen] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchRecentActivities(selectedChildId);
      fetchChildName(selectedChildId);
      fetchStats(selectedChildId);
    }
  }, [selectedChildId]);

  // エラーハンドリング用のヘルパー関数
  const handleSupabaseError = (error: any, message: string) => {
    console.error(`${message}:`, error);
    
    // エラーの種類に応じたメッセージ
    if (error.code === 'PGRST116') {
      // テーブルが存在しない場合
      console.log('テーブルが存在しないか、アクセス権限がありません');
      return;
    }
    
    if (error.code === '404') {
      // リソースが見つからない場合
      console.log('リソースが見つかりません');
      return;
    }
    
    // その他のエラー
    toast.error(message);
  };

  // 子供一覧を取得する関数
  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ユーザーが認証されていません');
        return;
      }
      
      // 子供のプロフィールを取得
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('parent_id', user.id)
        .eq('role', 'child');
        
      if (error) {
        handleSupabaseError(error, '子供情報の取得に失敗しました');
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('子供データを取得しました:', data.length, '件');
        setChildren(data);
        setSelectedChildId(data[0].id); // 最初の子供を選択
      } else {
        // 子供データがない場合、ダミーデータを設定（開発用）
        console.log('子供データが見つかりません。ダミーデータを使用します。');
        const dummyChild = {
          id: user.id, // 親自身のIDを使用
          username: 'お子様',
          avatar_url: undefined
        };
        setChildren([dummyChild]);
        setSelectedChildId(dummyChild.id);
      }
    } catch (error) {
      console.error('子供一覧の取得エラー:', error);
      
      // エラー時もダミーデータを設定
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const dummyChild = {
            id: user.id,
            username: 'お子様',
            avatar_url: undefined
          };
          setChildren([dummyChild]);
          setSelectedChildId(dummyChild.id);
        }
      } catch (authError) {
        console.error('認証情報の取得に失敗しました:', authError);
        toast.error('ログイン情報の取得に失敗しました。再ログインしてください。');
      }
    }
  };

  // 子供の名前を取得する関数
  const fetchChildName = async (childId: string) => {
    try {
      const selectedChild = children.find(child => child.id === childId);
      if (selectedChild) {
        setChildName(selectedChild.username);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', childId)
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
  const fetchStats = async (childId: string) => {
    try {
      let worksCount = 0;
      let emotionsCount = 0;
      let learningCount = 0;

      // 作品の総数を取得
      try {
        const { count, error } = await supabase
          .from('works')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', childId);

        if (error) {
          handleSupabaseError(error, '作品統計の取得に失敗しました');
        } else if (count !== null) {
          worksCount = count;
        }
      } catch (worksError) {
        console.error('作品統計の取得中にエラーが発生しました:', worksError);
      }

      // 感情記録の総数を取得
      try {
        const { count, error } = await supabase
          .from('sel_responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', childId);

        if (error) {
          handleSupabaseError(error, '感情記録統計の取得に失敗しました');
        } else if (count !== null) {
          emotionsCount = count;
        }
      } catch (emotionsError) {
        console.error('感情記録統計の取得中にエラーが発生しました:', emotionsError);
      }

      // 学習活動の総数を取得
      try {
        const { count, error } = await supabase
          .from('learning_activities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', childId);
        
        if (error) {
          handleSupabaseError(error, '学習統計の取得に失敗しました');
        } else if (count !== null) {
          learningCount = count;
        }
      } catch (learningError) {
        console.error('学習統計の取得中にエラーが発生しました:', learningError);
      }

      setStats({
        totalWorks: worksCount,
        totalEmotions: emotionsCount,
        totalLearning: learningCount
      });
    } catch (error) {
      console.error('統計データの取得中にエラーが発生しました:', error);
      // エラー時はデフォルト値を設定
      setStats({
        totalWorks: 0,
        totalEmotions: 0,
        totalLearning: 0
      });
    }
  };

  // 最近の活動データを取得する関数
  const fetchRecentActivities = async (childId: string) => {
    if (!supabase) return;

    try {
      setLoading(true);
      
      // 作品データの取得
      let worksData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('works')
          .select('*')
          .eq('user_id', childId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          handleSupabaseError(error, '作品データの取得に失敗しました');
        } else if (data) {
          worksData = data;
        }
      } catch (worksError) {
        console.error('作品データの取得中にエラーが発生しました:', worksError);
      }

      // 感情記録データの取得
      let emotionData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('sel_responses')
          .select(`
            id,
            emotion,
            created_at,
            note
          `)
          .eq('user_id', childId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          handleSupabaseError(error, '感情記録データの取得に失敗しました');
        } else if (data) {
          emotionData = data;
        }
      } catch (emotionError) {
        console.error('感情記録データの取得中にエラーが発生しました:', emotionError);
      }

      // 学習活動データの取得
      let learningData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('learning_activities')
          .select('*')
          .eq('user_id', childId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          handleSupabaseError(error, '学習データの取得に失敗しました');
        } else if (data) {
          learningData = data;
        }
      } catch (learningError) {
        console.error('学習データの取得中にエラーが発生しました:', learningError);
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
      setRecentActivities(recentActivities);
      
    } catch (error) {
      console.error('最近の活動データの取得中にエラーが発生しました:', error);
      // エラー時は空の配列を設定
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // 子供を切り替える関数
  const handleChildChange = (childId: string) => {
    setSelectedChildId(childId);
    setIsChildrenDropdownOpen(false);
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
        <div className="absolute inset-0 bg-bubbles-lg opacity-30"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="block text-indigo-100 text-lg md:text-xl font-normal">ようこそ</span>
                <div className="flex items-center">
                  {childName}の保護者ダッシュボード
                  {children.length > 1 && (
                    <div className="relative ml-2">
                      <button 
                        onClick={() => setIsChildrenDropdownOpen(!isChildrenDropdownOpen)}
                        className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 text-sm hover:bg-white/30 transition-colors"
                      >
                        <span>切替</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {isChildrenDropdownOpen && (
                        <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg py-2 min-w-48 z-50">
                          {children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => handleChildChange(child.id)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${selectedChildId === child.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                            >
                              {child.username}
                            </button>
                          ))}
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <Link 
                              to="/parent/profile/add-child" 
                              className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span>子供を追加</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-bubbles opacity-30"></div>
              <div className="relative z-10 p-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0s' }}>
                <Image className="h-6 w-6 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-indigo-100">作品数</p>
                <p className="text-xl font-bold">{stats.totalWorks}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-bubbles opacity-30"></div>
              <div className="relative z-10 p-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.2s' }}>
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-indigo-100">感情記録</p>
                <p className="text-xl font-bold">{stats.totalEmotions}</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-bubbles opacity-30"></div>
              <div className="relative z-10 p-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: '0.4s' }}>
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-indigo-100">学習活動</p>
                <p className="text-xl font-bold">{stats.totalLearning}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 複数の子供がいる場合、子供一覧を表示 */}
      {children.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow mb-6 animate-fadeIn">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            子供一覧
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => handleChildChange(child.id)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedChildId === child.id 
                    ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
                    : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    selectedChildId === child.id ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    {child.avatar_url ? (
                      <img 
                        src={child.avatar_url} 
                        alt={child.username} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <Users className={`h-6 w-6 ${
                        selectedChildId === child.id ? 'text-indigo-600' : 'text-gray-500'
                      }`} />
                    )}
                  </div>
                  <p className={`font-medium ${
                    selectedChildId === child.id ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    {child.username}
                  </p>
                  {selectedChildId === child.id && (
                    <span className="text-xs text-indigo-600 mt-1">選択中</span>
                  )}
                </div>
              </button>
            ))}
            <Link
              to="/parent/profile/add-child"
              className="p-4 rounded-xl border border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <UserPlus className="h-6 w-6 text-gray-500" />
              </div>
              <p className="font-medium text-gray-700">子供を追加</p>
            </Link>
          </div>
        </div>
      )}

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
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-indigo-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <Heart className="h-6 w-6 text-pink-500 relative z-10" />
                  </div>
                  <h3 className="font-medium text-gray-900">感情分析</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/analytics"
                className="group p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-blue-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <BarChart3 className="h-6 w-6 text-blue-500 relative z-10" />
                  </div>
                  <h3 className="font-medium text-gray-900">学習分析</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/works"
                className="group p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-purple-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <Image className="h-6 w-6 text-purple-500 relative z-10" />
                  </div>
                  <h3 className="font-medium text-gray-900">作品一覧</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/profile"
                className="group p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-green-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <Settings className="h-6 w-6 text-green-500 relative z-10" />
                  </div>
                  <h3 className="font-medium text-gray-900">設定</h3>
                </div>
              </Link>
              
              <Link
                to="/parent/profile/child"
                className="group p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-amber-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <Users className="h-6 w-6 text-amber-500 relative z-10" />
                  </div>
                  <h3 className="font-medium text-gray-900">子供情報</h3>
                </div>
              </Link>
              
              <Link
                to="/child/sel-quest"
                className="group p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-full mb-2 shadow-sm group-hover:shadow group-hover:bg-teal-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-bubbles opacity-10 group-hover:opacity-30 transition-opacity"></div>
                    <BookOpenCheck className="h-6 w-6 text-teal-500 relative z-10" />
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-bubbles opacity-20 transform rotate-45"></div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 relative z-10">
              <div className="p-2 bg-indigo-100 rounded-full animate-float" style={{ animationDelay: '0.3s' }}>
                <Bell className="h-5 w-5 text-indigo-600" />
              </div>
              お知らせ
            </h2>
            <div className="space-y-3 relative z-10">
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow animate-fadeIn relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-bubbles opacity-20 transform -rotate-45"></div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 relative z-10">
              <div className="p-2 bg-indigo-100 rounded-full animate-float" style={{ animationDelay: '0.5s' }}>
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              {childName}の成長
            </h2>
            <div className="space-y-4 relative z-10">
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
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-6 border border-indigo-100 animate-fadeIn relative overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-bubbles opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-100 rounded-full animate-float" style={{ animationDelay: '0.6s' }}>
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
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
    </div>
  );
}; 