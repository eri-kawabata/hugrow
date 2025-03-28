import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Heart, Image, Calendar, BookOpen, Users, Activity, Clock, BookOpenCheck, TrendingUp, Settings, Bell, Star, AlertCircle, CheckCircle2, BarChart3, ChevronDown, PieChart, Smile, Frown, Meh } from 'lucide-react';
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
  full_name: string;
  avatar_url?: string;
  birthday?: string | null;
  child_number?: number;
  status?: string;
  last_active_at?: string;
  age?: number | null;
};

// 学習進捗の型定義を追加
type LearningProgress = {
  lesson_id: string;
  completed: boolean;
  score: number;
  completed_at: string;
  status: string;
  progress_data: {
    total_points: number;
    level: number;
  };
};

// 感情データの型定義
type EmotionData = {
  id: string;
  profile_id: string;
  emotion: string;
  intensity: number;
  note: string;
  created_at: string;
};

// 感情統計の型定義
type EmotionStats = {
  mostFrequent: string | null;
  averageIntensity: number;
  totalCount: number;
  latestEmotion: string | null;
  latestDate: string | null;
  recentEmotions: {
    emotion: string;
    count: number;
    percentage: number;
  }[];
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
          alt={child.full_name} 
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
      <p className="font-medium text-base">{child.full_name}</p>
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
  const [learningStats, setLearningStats] = useState({
    totalPoints: 0,
    level: 1,
    completedLessons: 0,
    totalLessons: 25, // 5科目 × 5レッスン
    averageScore: 0
  });
  // 感情データ関連の状態を追加
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [emotionStats, setEmotionStats] = useState<EmotionStats>({
    mostFrequent: null,
    averageIntensity: 0,
    totalCount: 0,
    latestEmotion: null,
    latestDate: null,
    recentEmotions: []
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      // 選択した子供のプロフィール名を設定
      const selectedChild = children.find(child => child.id === selectedChildId);
      if (selectedChild) {
        setChildName(selectedChild.full_name);
      }
      
      // データを一度クリアしてからロード
      setStats({
        totalWorks: 0,
        totalEmotions: 0,
        totalLearning: 0
      });
      setEmotions([]);
      setEmotionStats({
        mostFrequent: null,
        averageIntensity: 0,
        totalCount: 0,
        latestEmotion: null,
        latestDate: null,
        recentEmotions: []
      });
      setRecentActivities([]);
      
      // データを取得
      fetchRecentActivities(selectedChildId);
      fetchChildName(selectedChildId);
      fetchStats(selectedChildId);
      calculateGrowthStats(selectedChildId);
    }
  }, [selectedChildId]);
  
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
      setLoading(true);
      
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('ユーザー情報が取得できませんでした');
        // ダミーデータを表示（デモ用）
        const dummyChild: ChildProfile = {
          id: 'dummy-id',
          username: 'お子様',
          full_name: 'お子様',
          avatar_url: undefined,
          birthday: null,
          child_number: 1,
          status: 'active',
          last_active_at: new Date().toISOString(),
        };
        setChildren([dummyChild]);
        setSelectedChildId(dummyChild.id);
        setChildName(dummyChild.full_name);
        return;
      }
      
      // 親のプロファイルIDを取得
      const { data: parentProfile, error: parentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .single();
      
      if (parentError) {
        console.error('親のプロファイル取得エラー:', parentError);
        // ダミーデータを表示（デモ用）
        const dummyChild: ChildProfile = {
          id: 'dummy-id',
          username: 'お子様',
          full_name: 'お子様',
          avatar_url: undefined,
          birthday: null,
          child_number: 1,
          status: 'active',
          last_active_at: new Date().toISOString(),
        };
        setChildren([dummyChild]);
        setSelectedChildId(dummyChild.id);
        setChildName(dummyChild.full_name);
        return;
      }
      
      // 親に関連付けられた子供を取得
      const { data: childProfiles, error: childrenError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, birthday, child_number, status, last_active_at')
        .eq('parent_id', parentProfile.id)
        .eq('role', 'child');
      
      if (childrenError) {
        console.error('子供のプロファイル取得エラー:', childrenError);
        toast.error('子供の情報を取得できませんでした');
        return;
      }
      
      // 子供の年齢を計算して追加
      const childrenWithAge = (childProfiles || []).map(child => {
        let age = null;
        if (child.birthday) {
          const birthDate = new Date(child.birthday);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          // 誕生日がまだ来ていない場合は1歳引く
          if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
        }
        return { ...child, age };
      });
      
      console.log('取得した子供プロファイル:', childrenWithAge);
      
      if (childrenWithAge.length > 0) {
        setChildren(childrenWithAge);
        
        // localStorageから選択されていた子供のIDを取得
        const savedChildId = localStorage.getItem('selectedChildId');
        const savedChild = savedChildId ? childrenWithAge.find(child => child.id === savedChildId) : null;
        
        if (savedChild) {
          // 保存されていた子供を選択
          setSelectedChildId(savedChild.id);
          setChildName(savedChild.full_name);
        } else {
          // 最初の子供を選択
          setSelectedChildId(childrenWithAge[0].id);
          setChildName(childrenWithAge[0].full_name);
        }
        
        // 全ての子供の統計データを取得は別のuseEffectに任せる
      }
    } catch (error) {
      console.error('子供データの取得エラー:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // 子供の名前を取得する関数
  const fetchChildName = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', childId)
        .single();
        
      if (error) throw error;
      if (data && data.full_name) {
        console.log(`子供名を取得: ${data.full_name}`);
        setChildName(data.full_name);
      }
    } catch (error) {
      console.error('子供名の取得エラー:', error);
    }
  };

  // 子供のプロファイルとその統計データを取得
  const fetchAllChildrenStats = async () => {
    try {
      const stats: {[key: string]: {totalWorks: number, totalEmotions: number, totalLearning: number}} = {};
      
      // 全ての子供プロファイルに対して統計を取得
      for (const child of children) {
        try {
          // 作品数を取得
          const { count: worksCount, error: worksError } = await supabase
            .from('works')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', child.id);
            
          if (worksError) throw worksError;
          
          // 感情記録数を取得
          const { count: emotionsCount, error: emotionsError } = await supabase
            .from('sel_responses')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', child.id);
            
          if (emotionsError) throw emotionsError;
          
          // 学習進捗数を取得
          const { count: learningCount, error: learningError } = await supabase
            .from('learning_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', child.id)
            .eq('status', 'completed');
            
          if (learningError) throw learningError;
          
          // 統計情報を格納
          stats[child.id] = {
            totalWorks: worksCount || 0,
            totalEmotions: emotionsCount || 0,
            totalLearning: learningCount || 0
          };
          
          console.log(`子供 ${child.username} の統計:`, stats[child.id]);
        } catch (error) {
          console.error(`子供 ${child.username} の統計取得エラー:`, error);
          // エラー時は0を設定
          stats[child.id] = {
            totalWorks: 0,
            totalEmotions: 0,
            totalLearning: 0
          };
        }
      }
      
      setChildrenStats(stats);
    } catch (error) {
      console.error('子供の統計情報取得エラー:', error);
      
      // エラー時は全ての子供の統計を0に設定
      const stats: {[key: string]: {totalWorks: number, totalEmotions: number, totalLearning: number}} = {};
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

  // 統計情報を取得する関数
  const fetchStats = async (childId: string) => {
    try {
      // 正確なカウントを取得するため、head: true オプションを追加
      const [worksCount, emotionsCount] = await Promise.all([
        supabase
          .from('works')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', childId),
        supabase
          .from('sel_responses')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', childId)
      ]);

      if (worksCount.error) throw worksCount.error;
      if (emotionsCount.error) throw emotionsCount.error;

      console.log(`${childId} の統計情報:`, {
        works: worksCount.count,
        emotions: emotionsCount.count
      });

      // 感情データを取得
      await fetchEmotionData(childId);
      
      // 学習統計を取得
      await fetchLearningStats(childId);

      setStats(prev => ({
        ...prev,
        totalWorks: worksCount.count || 0,
        totalEmotions: emotionsCount.count || 0
      }));
    } catch (error) {
      handleSupabaseError(error, '統計情報の取得に失敗しました');
    }
  };

  // 学習統計を取得する関数
  const fetchLearningStats = async (childId: string) => {
    try {
      const { data: progressData, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', childId)
        .eq('status', 'completed');

      if (error) throw error;

      if (progressData) {
        console.log('取得した学習データ:', progressData); // デバッグ用ログ
        const totalPoints = progressData.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
        const level = Math.floor(totalPoints / 1000) + 1;
        const completedLessons = progressData.length;
        const averageScore = completedLessons > 0 
          ? Math.round(totalPoints / completedLessons) 
          : 0;

        setLearningStats({
          totalPoints,
          level,
          completedLessons,
          totalLessons: 25,
          averageScore
        });

        // 全体の統計情報も更新
        setStats(prev => ({
          ...prev,
          totalLearning: completedLessons
        }));
      }
    } catch (error) {
      handleSupabaseError(error, '学習データの取得に失敗しました');
    }
  };

  // 感情データを取得する関数
  const fetchEmotionData = async (childId: string) => {
    try {
      // 感情データを取得
      const { data, error } = await supabase
        .from('sel_responses')
        .select('id, profile_id, emotion, intensity, note, created_at')
        .eq('profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEmotions(data || []);
      
      if (data && data.length > 0) {
        // 感情の出現回数をカウント
        const emotionCounts: Record<string, number> = {};
        let totalIntensity = 0;
        
        data.forEach(item => {
          emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
          totalIntensity += item.intensity || 0;
        });
        
        // 最も頻度の高い感情を特定
        let mostFrequentEmotion = null;
        let maxCount = 0;
        
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
          if (count > maxCount) {
            mostFrequentEmotion = emotion;
            maxCount = count;
          }
        });
        
        // 最新の感情
        const latestEmotion = data[0]?.emotion || null;
        const latestDate = data[0]?.created_at ? new Date(data[0].created_at).toLocaleDateString('ja-JP') : null;
        
        // 最近の感情統計（パーセンテージ計算）
        const recentEmotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
          emotion,
          count,
          percentage: Math.round((count / data.length) * 100)
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        
        // 統計情報を更新
        setEmotionStats({
          mostFrequent: mostFrequentEmotion,
          averageIntensity: data.length > 0 ? Math.round((totalIntensity / data.length) * 10) / 10 : 0,
          totalCount: data.length,
          latestEmotion,
          latestDate,
          recentEmotions
        });
      } else {
        // データがない場合はリセット
        setEmotionStats({
          mostFrequent: null,
          averageIntensity: 0,
          totalCount: 0,
          latestEmotion: null,
          latestDate: null,
          recentEmotions: []
        });
      }
    } catch (error) {
      handleSupabaseError(error, '感情データの取得に失敗しました');
    }
  };

  // 最近の活動データを取得する関数
  const fetchRecentActivities = async (childId: string) => {
    try {
      setLoading(true);

      // 作品データを取得
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('id, title, created_at, profile_id')
        .eq('profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (worksError) throw worksError;

      // 感情データを取得
      const { data: emotionsData, error: emotionsError } = await supabase
        .from('sel_responses')
        .select('id, emotion, created_at, profile_id')
        .eq('profile_id', childId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (emotionsError) throw emotionsError;

      console.log('取得した作品データ:', worksData);
      console.log('取得した感情データ:', emotionsData);

      // 作品データをActivityItem形式に変換
      const worksActivities: ActivityItem[] = (worksData || []).map(item => ({
        id: item.id,
        type: '作品',
        title: item.title || '無題の作品',
        date: new Date(item.created_at).toLocaleDateString('ja-JP'),
        created_at: item.created_at
      }));

      // 感情データをActivityItem形式に変換
      const emotionActivities: ActivityItem[] = (emotionsData || []).map(item => ({
        id: item.id,
        type: '感情記録',
        emotion: item.emotion,
        date: new Date(item.created_at).toLocaleDateString('ja-JP'),
        created_at: item.created_at
      }));

      // 学習活動を取得
      const { data: learningData, error: learningError } = await supabase
        .from('learning_progress')
        .select('id, lesson_id, completed_at, status')
        .eq('user_id', childId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (learningError) throw learningError;

      console.log('取得した学習データ:', learningData);

      // 学習活動をActivityItem形式に変換
      const learningActivities: ActivityItem[] = (learningData || []).map(item => ({
        id: item.id,
        type: '学習',
        subject: item.lesson_id.split('-')[0], // 'science-1' -> 'science'
        date: item.completed_at ? new Date(item.completed_at).toLocaleDateString('ja-JP') : '日付なし',
        created_at: item.completed_at || ''
      }));

      // すべてのアクティビティを結合して日付順にソート
      const allActivities = [...worksActivities, ...emotionActivities, ...learningActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentActivities(allActivities);
    } catch (error) {
      handleSupabaseError(error, '最近の活動の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 子供を切り替える関数
  const handleChildChange = useCallback((childId: string) => {
    setSelectedChildId(childId);
    // 選択した子供のIDをlocalStorageに保存
    localStorage.setItem('selectedChildId', childId);
    // 子供の名前もlocalStorageに保存（full_nameを使用）
    const selectedChild = children.find(child => child.id === childId);
    if (selectedChild && selectedChild.full_name) {
      localStorage.setItem('childName', selectedChild.full_name);
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

  // 学習の進捗状況を表示するコンポーネント
  const LearningProgressSection = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">学習の進捗</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">完了レッスン</span>
            <span className="text-sm font-medium">{learningStats.completedLessons} / {learningStats.totalLessons}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(learningStats.completedLessons / learningStats.totalLessons) * 100}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">レベル</p>
            <p className="text-xl font-bold text-blue-900">{learningStats.level}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-700">総ポイント</p>
            <p className="text-xl font-bold text-green-900">{learningStats.totalPoints}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 感情アイコンを取得する関数
  const getEmotionIcon = (emotion: string) => {
    switch(emotion) {
      case 'とてもうれしい':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'うれしい':
        return <Smile className="h-5 w-5 text-pink-500" />;
      case 'ふつう':
        return <Meh className="h-5 w-5 text-purple-500" />;
      case 'すこしかなしい':
        return <Frown className="h-5 w-5 text-blue-500" />;
      case 'かなしい':
        return <Frown className="h-5 w-5 text-indigo-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500" />;
    }
  };

  // 感情色を取得する関数
  const getEmotionColor = (emotion: string) => {
    switch(emotion) {
      case 'とてもうれしい':
        return 'text-yellow-500 bg-yellow-50';
      case 'うれしい':
        return 'text-pink-500 bg-pink-50';
      case 'ふつう':
        return 'text-purple-500 bg-purple-50';
      case 'すこしかなしい':
        return 'text-blue-500 bg-blue-50';
      case 'かなしい':
        return 'text-indigo-500 bg-indigo-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  // 感情カードコンポーネント
  const EmotionOverviewCard = () => {
    // 選択中の子供の統計データを取得
    const childStats = childrenStats[selectedChildId] || { totalEmotions: 0 };
    const hasEmotionData = emotionStats.totalCount > 0;

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            感情分析
          </h3>
          <Link to={`/parent/analytics/sel?child=${selectedChildId}`} className="text-xs text-indigo-600 hover:underline flex items-center">
            詳細分析 <span className="ml-0.5">→</span>
          </Link>
        </div>
        
        {hasEmotionData ? (
          <div className="space-y-4">
            {/* 感情概要 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-xs text-pink-700">最も多い感情</p>
                {emotionStats.mostFrequent ? (
                  <div className="flex items-center gap-2 mt-1">
                    {getEmotionIcon(emotionStats.mostFrequent)}
                    <span className="text-base font-bold text-pink-900">{emotionStats.mostFrequent}</span>
                  </div>
                ) : (
                  <p className="text-sm text-pink-900">データなし</p>
                )}
              </div>
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-700">感情記録数</p>
                <p className="text-lg font-bold text-indigo-900">{childStats.totalEmotions}<span className="text-xs font-normal ml-1">件</span></p>
              </div>
            </div>
            
            {/* 最新の感情 */}
            <div className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-lg p-4">
              <p className="text-xs text-gray-700 mb-2">最新の記録</p>
              {emotionStats.latestEmotion ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEmotionIcon(emotionStats.latestEmotion)}
                    <span className="font-medium">{emotionStats.latestEmotion}</span>
                  </div>
                  <span className="text-xs text-gray-500">{emotionStats.latestDate}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">データなし</p>
              )}
            </div>
            
            {/* 感情分布 */}
            <div>
              <p className="text-xs text-gray-700 mb-2">最近の感情分布</p>
              <div className="space-y-2">
                {emotionStats.recentEmotions.map(emotion => (
                  <div key={emotion.emotion} className="flex items-center">
                    <div className={`p-1.5 rounded-full mr-2 ${getEmotionColor(emotion.emotion).split(' ')[1]}`}>
                      {getEmotionIcon(emotion.emotion)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{emotion.emotion}</span>
                        <span>{emotion.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getEmotionColor(emotion.emotion).split(' ')[0].replace('text', 'bg')}`}
                          style={{ width: `${emotion.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <Heart className="h-12 w-12 text-pink-200 mx-auto mb-3" />
              <p className="text-gray-500">まだ感情記録がありません</p>
              <p className="text-xs text-gray-400 mt-1">きもちクエストで記録を始めましょう</p>
            </div>
          </div>
        )}
      </div>
    );
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
                                    alt={child.full_name} 
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-3 w-3 text-indigo-600" />
                                )}
                              </div>
                              {child.full_name}
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
                                <img src={child.avatar_url} alt={child.full_name} className="h-8 w-8 object-cover" />
                              ) : (
                                <Users className="h-4 w-4 text-indigo-500" />
                              )}
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{child.full_name}</div>
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
                            <span className="sr-only">{child.full_name}の詳細</span>
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

      {/* メインコンテンツセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* 左側: 活動リスト */}
        <div className="lg:col-span-2 space-y-6">
          {/* 最近の活動 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                最近の活動
              </h3>
              {recentActivities.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">最終: {recentActivities[0]?.date || '不明'}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto px-0.5 scrollbar-thin">
              {filteredRecentActivities.length > 0 ? (
                filteredRecentActivities.map(activity => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    selectedChildId={selectedChildId}
                    getActivityIcon={getActivityIcon}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">まだ活動記録がありません</p>
                  <p className="text-xs text-gray-400 mt-1">お子様に課題を設定してみましょう</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 感情とEQ分析（大きめ表示） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmotionOverviewCard />
          
            {/* 成長指標 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  成長指標
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* 感情理解 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-pink-100 rounded-full">
                        <Heart className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="text-sm text-gray-700">感情理解</span>
                    </div>
                    <span className="text-xs font-medium">{growthStats.emotionalUnderstanding}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${growthStats.emotionalUnderstanding}%` }}
                    />
                  </div>
                </div>
                
                {/* 学習進捗 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">学習進捗</span>
                    </div>
                    <span className="text-xs font-medium">{growthStats.learningProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${growthStats.learningProgress}%` }}
                    />
                  </div>
                </div>
                
                {/* 創造性 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded-full">
                        <Image className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-sm text-gray-700">創造性</span>
                    </div>
                    <span className="text-xs font-medium">{growthStats.creativity}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${growthStats.creativity}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右側: サイドバー */}
        <div className="space-y-6">
          {/* 学習の進捗 */}
          <LearningProgressSection />
          
          {/* お知らせ表示エリア */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                お知らせ
              </h3>
            </div>
            
            {/* お知らせリスト */}
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">きもちクエストを毎日記録しましょう</p>
                    <p className="text-xs text-blue-700 mt-1">子供の感情記録は感情知能の発達に役立ちます</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-yellow-100 rounded-full flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">今月のお子様の成長がまとまりました</p>
                    <p className="text-xs text-yellow-700 mt-1">レポートを見て、お子様の成長を確認しましょう</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 