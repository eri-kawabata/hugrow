import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image, Calendar, BookOpen, Users, Activity, Clock, BookOpenCheck, TrendingUp, Settings, Bell, Star, AlertCircle, CheckCircle2, BarChart3, ChevronDown } from 'lucide-react';
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
  birthday?: string | null;
  child_number?: number;
  status?: string;
  last_active_at?: string;
  age?: number | null;
};

// 最適化のためのサブコンポーネント
const StatCard = React.memo(({ 
  icon, 
  title, 
  value, 
  bgColor, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  bgColor: string;
  delay: string;
}) => (
  <div className={`${bgColor} backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 relative overflow-hidden`}>
    <div className="absolute inset-0 bg-bubbles opacity-30"></div>
    <div className="relative z-10 p-2 bg-white/30 rounded-full animate-float" style={{ animationDelay: delay }}>
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-xs font-medium text-indigo-100">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
));

// 活動カードコンポーネント
const ActivityCard = React.memo(({ 
  activity, 
  selectedChildId, 
  getActivityIcon 
}: { 
  activity: ActivityItem; 
  selectedChildId: string;
  getActivityIcon: (type: string) => React.ReactNode;
}) => (
  <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg hover:shadow-sm transition-all ${
    activity.type === '作品' ? 'bg-indigo-50 hover:bg-indigo-100' : 
    activity.type === '感情記録' ? 'bg-pink-50 hover:bg-pink-100' : 
    'bg-blue-50 hover:bg-blue-100'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${
        activity.type === '作品' ? 'bg-white text-indigo-600' : 
        activity.type === '感情記録' ? 'bg-white text-pink-600' : 
        'bg-white text-blue-600'
      }`}>
        {getActivityIcon(activity.type)}
      </div>
      <div>
        <p className={`font-medium text-sm ${
          activity.type === '作品' ? 'text-indigo-900' : 
          activity.type === '感情記録' ? 'text-pink-900' : 
          'text-blue-900'
        }`}>
          {activity.type === '作品' && (activity.title || '無題の作品')}
          {activity.type === '感情記録' && `感情: ${activity.emotion || '記録なし'}`}
          {activity.type === '学習' && `科目: ${activity.subject || '一般'}`}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activity.type === '作品' ? 'bg-indigo-100 text-indigo-800' : 
            activity.type === '感情記録' ? 'bg-pink-100 text-pink-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {activity.type}
          </span>
          <span className="text-xs text-gray-500">{activity.date}</span>
        </div>
      </div>
    </div>
    <Link to={
      activity.type === '作品' ? `/parent/works/${activity.id}?child=${selectedChildId}` : 
      activity.type === '感情記録' ? `/parent/analytics/sel?child=${selectedChildId}` : 
      `/parent/analytics?child=${selectedChildId}`
    } className={`p-1.5 rounded-full ${
      activity.type === '作品' ? 'text-indigo-600 hover:bg-indigo-100' : 
      activity.type === '感情記録' ? 'text-pink-600 hover:bg-pink-100' : 
      'text-blue-600 hover:bg-blue-100'
    }`}>
      <ChevronDown className="h-4 w-4 transform -rotate-90" />
    </Link>
  </div>
));

// 子供選択ボタンコンポーネント
const ChildSelectButton = React.memo(({ 
  child, 
  selectedChildId, 
  onSelect, 
  formatDate 
}: { 
  child: ChildProfile; 
  selectedChildId: string;
  onSelect: (id: string) => void;
  formatDate: (date: string) => string;
}) => (
  <button
    key={child.id}
    onClick={() => onSelect(child.id)}
    className={`flex items-center p-3 rounded-xl transition-all w-full ${
      selectedChildId === child.id 
        ? 'bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 shadow-md ring-1 ring-indigo-300' 
        : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
    }`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${
      selectedChildId === child.id ? 'ring-2 ring-indigo-300 shadow-sm' : 'ring-1 ring-gray-200'
    }`}>
      {child.avatar_url ? (
        <img 
          src={child.avatar_url} 
          alt={child.username} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
          <Users className="h-6 w-6 text-indigo-500" />
        </div>
      )}
    </div>
    <div className="ml-3 flex-1">
      <p className="font-medium text-base">{child.username}</p>
      <p className="text-xs text-gray-500">
        {child.birthday ? `${new Date(child.birthday).getFullYear()}年生まれ・${child.age}歳` : '年齢不明'}
      </p>
      
      {/* アクティビティインジケーター */}
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="作品活動"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-pink-400" title="感情記録"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="学習活動"></div>
        {child.last_active_at && (
          <span className="text-xs text-gray-400 ml-1">
            最終活動: {formatDate(child.last_active_at).split(' ')[0]}
          </span>
        )}
      </div>
    </div>
    
    {selectedChildId === child.id && (
      <div className="ml-auto">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-xs shadow-sm">
          <CheckCircle2 className="h-3 w-3" />
        </span>
      </div>
    )}
  </button>
));

// メインコンポーネント
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
  const [childrenStats, setChildrenStats] = useState<{[key: string]: {totalWorks: number, totalEmotions: number, totalLearning: number}}>({});
  const [growthStats, setGrowthStats] = useState({
    emotionalUnderstanding: 0,
    learningProgress: 0,
    creativity: 0
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchRecentActivities(selectedChildId);
      fetchChildName(selectedChildId);
      fetchStats(selectedChildId);
      calculateGrowthStats(selectedChildId);
    }
  }, [selectedChildId, childrenStats]);
  
  useEffect(() => {
    if (children.length > 0) {
      fetchAllChildrenStats();
    }
  }, [children]);

  // エラーハンドリング用のヘルパー関数
  const handleSupabaseError = useCallback((error: any, message: string) => {
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
  }, []);

  // 子供一覧を取得する関数
  const fetchChildren = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('ユーザーが認証されていません');
        return;
      }
      
      console.log('認証ユーザー情報:', user.id);
      
      // 親IDを直接指定（テスト用）
      const parentId = '91513243-7e5b-4ec6-885b-c64d06a84da1'; // データベースから確認した親ID
      
      // 子供のプロフィールを取得（より詳細な情報を含む）
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, birthday, child_number, status, last_active_at')
        .eq('parent_id', parentId) // 直接指定したparentIdを使用
        .eq('role', 'child')
        .order('child_number', { ascending: true });
        
      console.log('子供データクエリ結果:', data, error);
        
      if (error) {
        handleSupabaseError(error, '子供情報の取得に失敗しました');
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('子供データを取得しました:', data.length, '件');
        console.log('取得した子供データ:', JSON.stringify(data));
        
        // 子供データに年齢情報を追加
        const childrenWithAge = data.map(child => {
          let age = null;
          if (child.birthday) {
            const birthDate = new Date(child.birthday);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            // 誕生日がまだ来ていない場合は1歳引く
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          return {
            ...child,
            age
          };
        });
        
        console.log('年齢情報を追加した子供データ:', JSON.stringify(childrenWithAge));
        setChildren(childrenWithAge);
        setSelectedChildId(childrenWithAge[0].id); // 最初の子供を選択
      } else {
        // 子供データがない場合、ダミーデータを設定（開発用）
        console.log('子供データが見つかりません。ダミーデータを使用します。');
        const dummyChild = {
          id: user.id, // 親自身のIDを使用
          username: 'お子様',
          avatar_url: undefined,
          age: null,
          birthday: null,
          child_number: 1,
          status: 'active',
          last_active_at: new Date().toISOString()
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
            avatar_url: undefined,
            age: null,
            birthday: null,
            child_number: 1,
            status: 'active',
            last_active_at: new Date().toISOString()
          };
          setChildren([dummyChild]);
          setSelectedChildId(dummyChild.id);
        }
      } catch (authError) {
        console.error('認証情報の取得に失敗しました:', authError);
        toast.error('ログイン情報の取得に失敗しました。再ログインしてください。');
      }
    }
  }, [handleSupabaseError]);

  // 子供の名前を取得する関数
  const fetchChildName = useCallback(async (childId: string) => {
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
  }, [children]);

  // 統計データを取得する関数
  const fetchAllChildrenStats = async () => {
    if (!children.length) return;
    
    const stats: {[key: string]: {totalWorks: number, totalEmotions: number, totalLearning: number}} = {};
    
    try {
      // 各子供のprofile_idを配列に格納
      const profileIds = children.map(child => child.id);
      
      // 全ての子供のデータを一度に取得（IN句を使用）
      const [worksResult, emotionsResult, learningResult] = await Promise.all([
        supabase
          .from('works')
          .select('profile_id', { count: 'exact' })
          .in('profile_id', profileIds),
        supabase
          .from('sel_responses')
          .select('profile_id', { count: 'exact' })
          .in('profile_id', profileIds),
        supabase
          .from('learning_activities')
          .select('profile_id', { count: 'exact' })
          .in('profile_id', profileIds)
      ]);

      // 各子供の統計を初期化
      children.forEach(child => {
        stats[child.id] = {
          totalWorks: 0,
          totalEmotions: 0,
          totalLearning: 0
        };
      });

      // データの集計
      if (worksResult.data) {
        worksResult.data.forEach(work => {
          if (work.profile_id && stats[work.profile_id]) {
            stats[work.profile_id].totalWorks++;
          }
        });
      }

      if (emotionsResult.data) {
        emotionsResult.data.forEach(emotion => {
          if (emotion.profile_id && stats[emotion.profile_id]) {
            stats[emotion.profile_id].totalEmotions++;
          }
        });
      }

      if (learningResult.data) {
        learningResult.data.forEach(learning => {
          if (learning.profile_id && stats[learning.profile_id]) {
            stats[learning.profile_id].totalLearning++;
          }
        });
      }

      console.log('全ての子供の統計データ:', stats);
      setChildrenStats(stats);

    } catch (error) {
      console.error('統計データの取得中にエラーが発生しました:', error);
      toast.error('統計データの取得に失敗しました');
      
      // エラー時は全ての子供の統計を0に設定
      children.forEach(child => {
        stats[child.id] = {
          totalWorks: 0,
          totalEmotions: 0,
          totalLearning: 0
        };
      });
      setChildrenStats(stats);
    }
  };

  const fetchStats = async (childId: string) => {
    if (!childId) return;
    
    try {
      const [worksResult, emotionsResult, learningResult] = await Promise.all([
        supabase
          .from('works')
          .select('*', { count: 'exact' })
          .eq('profile_id', childId),
        supabase
          .from('sel_responses')
          .select('*', { count: 'exact' })
          .eq('profile_id', childId),
        supabase
          .from('learning_activities')
          .select('*', { count: 'exact' })
          .eq('profile_id', childId)
      ]);

      const stats = {
        totalWorks: worksResult.count || 0,
        totalEmotions: emotionsResult.count || 0,
        totalLearning: learningResult.count || 0
      };

      console.log('個別の統計データ:', stats);
      setStats(stats);

    } catch (error) {
      console.error('統計の取得中にエラーが発生しました:', error);
      toast.error('統計データの取得に失敗しました');
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
          .eq('profile_id', childId)
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
          .eq('profile_id', childId)
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
          .eq('profile_id', childId)
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
  const handleChildChange = useCallback((childId: string) => {
    setSelectedChildId(childId);
    // 選択した子供のIDをlocalStorageに保存
    localStorage.setItem('selectedChildId', childId);
    // 子供の名前もlocalStorageに保存
    const selectedChild = children.find(child => child.id === childId);
    if (selectedChild && selectedChild.username) {
      localStorage.setItem('childName', selectedChild.username);
    }
    setIsChildrenDropdownOpen(false);
  }, [children]);

  // 日付フォーマット関数
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '日付なし';
    
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('日付のフォーマットエラー:', e);
      return '日付エラー';
    }
  }, []);

  // 活動タイプに応じたアイコンを返す関数
  const getActivityIcon = useCallback((type: string) => {
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
  }, []);

  // メモ化された値
  const filteredRecentActivities = useMemo(() => {
    return recentActivities.slice(0, 10);
  }, [recentActivities]);

  const workActivities = useMemo(() => {
    return recentActivities.filter(a => a.type === '作品');
  }, [recentActivities]);

  const emotionActivities = useMemo(() => {
    return recentActivities.filter(a => a.type === '感情記録');
  }, [recentActivities]);

  const learningActivities = useMemo(() => {
    return recentActivities.filter(a => a.type === '学習');
  }, [recentActivities]);

  // 成長統計を計算する関数
  const calculateGrowthStats = (childId: string) => {
    // 子供の統計データを取得
    const childStats = childrenStats[childId];
    
    if (!childStats) {
      setGrowthStats({
        emotionalUnderstanding: 0,
        learningProgress: 0,
        creativity: 0
      });
      return;
    }
    
    // 感情理解: 感情記録の数に基づいて計算（最大100件で100%）
    const emotionalScore = Math.min(childStats.totalEmotions, 100);
    
    // 学習進捗: 学習活動の数に基づいて計算（最大100件で100%）
    const learningScore = Math.min(childStats.totalLearning, 100);
    
    // 創造性: 作品数に基づいて計算（最大100件で100%）
    const creativityScore = Math.min(childStats.totalWorks, 100);
    
    setGrowthStats({
      emotionalUnderstanding: emotionalScore,
      learningProgress: learningScore,
      creativity: creativityScore
    });
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
                        className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-sm hover:bg-white/30 transition-colors"
                      >
                        <span>子供を切替</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {isChildrenDropdownOpen && (
                        <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg py-2 min-w-48 z-50">
                          {children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => handleChildChange(child.id)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 ${selectedChildId === child.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                {child.avatar_url ? (
                                  <img 
                                    src={child.avatar_url} 
                                    alt={child.username} 
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-3 w-3 text-indigo-600" />
                                )}
                              </div>
                              {child.username}
                              {selectedChildId === child.id && (
                                <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">選択中</span>
                              )}
                            </button>
                          ))}
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
            <StatCard 
              icon={<Image className="h-6 w-6 text-white" />}
              title="作品数"
              value={stats.totalWorks}
              bgColor="bg-white/20"
              delay="0s"
            />
            <StatCard 
              icon={<Heart className="h-6 w-6 text-white" />}
              title="感情記録"
              value={stats.totalEmotions}
              bgColor="bg-white/20"
              delay="0.2s"
            />
            <StatCard 
              icon={<BookOpen className="h-6 w-6 text-white" />}
              title="学習活動"
              value={stats.totalLearning}
              bgColor="bg-white/20"
              delay="0.4s"
            />
          </div>
        </div>
      </div>

      {/* 子供切り替えタブ - バランス調整版 */}
      {children.length >= 1 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            お子様を選択
          </h2>
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
              {children.map(child => (
                <ChildSelectButton
                  key={child.id}
                  child={child}
                  selectedChildId={selectedChildId}
                  onSelect={handleChildChange}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
          
          {/* 選択中の子供の活動サマリー - バランス調整版 */}
          {selectedChildId && (
            <div className="mt-4 bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Activity className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{childName}の活動サマリー</h3>
                    <p className="text-xs text-gray-500">
                      {children.find(c => c.id === selectedChildId)?.birthday 
                        ? `${new Date(children.find(c => c.id === selectedChildId)?.birthday || '').getFullYear()}年生まれ・${children.find(c => c.id === selectedChildId)?.age}歳` 
                        : '年齢不明'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-indigo-50 px-2.5 py-1 rounded-full text-xs text-indigo-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recentActivities.length > 0 
                    ? `最終: ${recentActivities[0].date.split(' ')[0]}` 
                    : children.find(c => c.id === selectedChildId)?.last_active_at 
                      ? `最終: ${formatDate(children.find(c => c.id === selectedChildId)?.last_active_at || '').split(' ')[0]}`
                      : '活動なし'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-indigo-700">作品活動</span>
                    <div className="p-1.5 bg-indigo-100 rounded-full">
                      <Image className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900">{stats.totalWorks}<span className="text-sm font-normal text-indigo-700 ml-1">件</span></p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-indigo-600">最近: {recentActivities.filter(a => a.type === '作品').length}件</p>
                    <Link to={recentActivities.length > 0 && recentActivities.filter(a => a.type === '作品').length > 0
                      ? `/parent/works/${recentActivities.filter(a => a.type === '作品')[0]?.id}?child=${selectedChildId}`
                      : `/parent/works?child=${selectedChildId}`} 
                      className="text-xs text-indigo-700 flex items-center hover:underline">
                      詳細 <span className="ml-0.5">→</span>
                    </Link>
                  </div>
                </div>
                
                <div className="bg-pink-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-pink-700">感情記録</span>
                    <div className="p-1.5 bg-pink-100 rounded-full">
                      <Heart className="h-4 w-4 text-pink-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-pink-900">{stats.totalEmotions}<span className="text-sm font-normal text-pink-700 ml-1">件</span></p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-pink-600">最近: {recentActivities.filter(a => a.type === '感情記録').length}件</p>
                    <Link to={`/parent/analytics/sel?child=${selectedChildId}`} className="text-xs text-pink-700 flex items-center hover:underline">
                      分析 <span className="ml-0.5">→</span>
                    </Link>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-700">学習活動</span>
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalLearning}<span className="text-sm font-normal text-blue-700 ml-1">件</span></p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-blue-600">最近: {recentActivities.filter(a => a.type === '学習').length}件</p>
                    <Link to={`/parent/analytics?child=${selectedChildId}`} className="text-xs text-blue-700 flex items-center hover:underline">
                      分析 <span className="ml-0.5">→</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {recentActivities.slice(0, 3).map((activity, index) => (
                      <div key={index} className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        activity.type === '作品' ? 'bg-indigo-100' : 
                        activity.type === '感情記録' ? 'bg-pink-100' : 'bg-blue-100'
                      } border-2 border-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    ))}
                    {recentActivities.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                        +{recentActivities.length - 3}
                      </div>
                    )}
                    {recentActivities.length === 0 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <AlertCircle className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {recentActivities.length > 0 
                      ? `最近の活動: ${recentActivities.length}件` 
                      : '最近の活動はありません'}
                  </p>
                </div>
                <Link to={`/parent/analytics?child=${selectedChildId}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center hover:underline">
                  詳細分析を見る <span className="ml-0.5">→</span>
                </Link>
              </div>
            </div>
          )}

          {/* 子供の活動比較 - 新規追加 */}
          {children.length > 1 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">お子様の活動比較</h3>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">お子様</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">年齢</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-indigo-500 uppercase tracking-wider">作品</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-pink-500 uppercase tracking-wider">感情記録</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-500 uppercase tracking-wider">学習</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">最終活動</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children.map(child => (
                      <tr 
                        key={child.id} 
                        className={`hover:bg-gray-50 transition-colors ${selectedChildId === child.id ? 'bg-indigo-50' : ''}`}
                        onClick={() => handleChildChange(child.id)}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                              {child.avatar_url ? (
                                <img src={child.avatar_url} alt={child.username} className="h-8 w-8 object-cover" />
                              ) : (
                                <Users className="h-4 w-4 text-indigo-500" />
                              )}
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{child.username}</div>
                              {selectedChildId === child.id && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  選択中
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                          {child.age ? `${child.age}歳` : '-'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {childrenStats[child.id]?.totalWorks || 0}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                            {childrenStats[child.id]?.totalEmotions || 0}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {childrenStats[child.id]?.totalLearning || 0}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                          {child.last_active_at ? formatDate(child.last_active_at).split(' ')[0] : '-'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChildChange(child.id);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          >
                            <span className="sr-only">{child.username}の詳細</span>
                            詳細
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                to={`/parent/analytics/sel?child=${selectedChildId}`}
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
                to={`/parent/analytics?child=${selectedChildId}`}
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
                to={`/parent/works?child=${selectedChildId}`}
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

          {/* 最近の活動セクション - バランス調整版 */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{childName}の最近の活動</h2>
              </div>
              <Link to={`/parent/works?child=${selectedChildId}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center hover:underline">
                すべて見る <span className="ml-0.5">→</span>
              </Link>
            </div>
            
            {/* フィルターボタン */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded-full">
                すべて
              </button>
              <button className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50">
                作品
              </button>
              <button className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50">
                感情
              </button>
              <button className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200 hover:bg-gray-50">
                学習
              </button>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">データを読み込み中...</span>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    selectedChildId={selectedChildId}
                    getActivityIcon={getActivityIcon}
                  />
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col items-center">
                    <div className="p-2 bg-gray-100 rounded-full mb-2">
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{childName}の最近の活動はありません</p>
                    <p className="text-xs text-gray-500 max-w-md">お子様がアプリを使用すると、ここに活動が表示されます。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側のサイドバーエリア */}
        <div className="space-y-6">
          {/* お知らせカード - バランス調整版 */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-sm transition-shadow animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Bell className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">お知らせ</h2>
            </div>
            <div className="space-y-2">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-800">新機能のお知らせ</p>
                    <p className="text-xs text-blue-600 mt-0.5">感情分析機能が追加されました。</p>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-green-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800">学習進捗</p>
                    <p className="text-xs text-green-600 mt-0.5">お子様が新しい学習コンテンツを完了しました。</p>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-800">イベント情報</p>
                    <p className="text-xs text-amber-600 mt-0.5">次回のオンラインイベントは3月15日です。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <Link to="/parent/notifications" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center justify-center hover:underline">
                すべてのお知らせを見る <span className="ml-0.5">→</span>
              </Link>
            </div>
          </div>

          {/* 子供の成長カード - バランス調整版 */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-sm transition-shadow animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{childName}の成長</h2>
              </div>
              {children.length > 1 && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                  {children.findIndex(child => child.id === selectedChildId) + 1}/{children.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">感情理解</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-pink-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${growthStats.emotionalUnderstanding}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-1">{growthStats.emotionalUnderstanding}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">学習進捗</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${growthStats.learningProgress}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-1">{growthStats.learningProgress}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">創造性</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${growthStats.creativity}%` }}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-1">{growthStats.creativity}%</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {stats.totalWorks + stats.totalEmotions + stats.totalLearning > 0 
                    ? `総活動数: ${stats.totalWorks + stats.totalEmotions + stats.totalLearning}件` 
                    : '活動記録がありません'}
                </p>
                <Link to={`/parent/analytics?child=${selectedChildId}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center hover:underline">
                  詳細を見る <span className="ml-0.5">→</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* 今日のヒントカード - バランス調整版 */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm p-5 border border-indigo-100 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-amber-100 rounded-full">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-indigo-900">今日のヒント</h2>
            </div>
            <p className="text-xs text-indigo-800 mb-3">
              お子様の感情表現を促すために、「今日はどんな気持ちだった？」と具体的に質問してみましょう。感情を言葉で表現する練習になります。
            </p>
            <div className="flex justify-end">
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