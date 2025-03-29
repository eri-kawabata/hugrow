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
  profile_id: string;
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
  getActivityIcon,
  getEmotionIcon
}: { 
  activity: ActivityItem; 
  selectedChildId: string;
  getActivityIcon: (type: string) => React.ReactNode;
  getEmotionIcon: (emotion: string) => React.ReactNode;
}) => {
  // 活動タイプに応じたコンテンツを返す
  const renderContent = () => {
    if (activity.type === '感情記録' && activity.emotion) {
      return (
        <div className="flex items-center gap-2">
          {getEmotionIcon(activity.emotion)}
          <span className="font-medium text-pink-900">{activity.emotion}</span>
        </div>
      );
    } else if (activity.type === '作品') {
      return (
        <span className="font-medium text-indigo-900">{activity.title || '無題の作品'}</span>
      );
    } else if (activity.type === '学習') {
      return (
        <span className="font-medium text-blue-900">科目: {activity.subject || '一般'}</span>
      );
    }
  };

  // 活動タイプに応じたカラーとスタイルを選択
  const getCardStyle = () => {
    switch (activity.type) {
      case '感情記録':
        return {
          bg: 'bg-pink-50 hover:bg-pink-100',
          iconColor: 'text-pink-500',
          labelColor: 'text-pink-500',
          linkPath: `/parent/analytics/sel?child=${selectedChildId}`
        };
      case '作品':
        return {
          bg: 'bg-indigo-50 hover:bg-indigo-100',
          iconColor: 'text-indigo-500',
          labelColor: 'text-indigo-500',
          linkPath: `/parent/works/${activity.id}?child=${selectedChildId}`
        };
      case '学習':
        return {
          bg: 'bg-blue-50 hover:bg-blue-100',
          iconColor: 'text-blue-500',
          labelColor: 'text-blue-500',
          linkPath: `/parent/analytics/learning?child=${selectedChildId}`
        };
      default:
        return {
          bg: 'bg-gray-50 hover:bg-gray-100',
          iconColor: 'text-gray-500',
          labelColor: 'text-gray-500',
          linkPath: `/parent/analytics?child=${selectedChildId}`
        };
    }
  };

  const style = getCardStyle();

  return (
    <div key={activity.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${style.bg}`}>
      <div className="flex items-center gap-3 flex-1">
        <div className={style.iconColor}>
          {activity.type === '感情記録' && <Heart className="h-5 w-5" />}
          {activity.type === '作品' && <Image className="h-5 w-5" />}
          {activity.type === '学習' && <BookOpen className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          {renderContent()}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${style.labelColor}`}>{activity.type}</span>
            <span className="text-xs text-gray-500">{activity.date}</span>
          </div>
        </div>
      </div>
      <Link 
        to={style.linkPath}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronDown className="h-5 w-5 transform -rotate-90" />
      </Link>
    </div>
  );
});

// 子供選択ボタンコンポーネント
const ChildSelectButton = React.memo(({ 
  child, 
  selectedChildId, 
  onSelect, 
  formatDate,
  recentActivities
}: { 
  child: ChildProfile; 
  selectedChildId: string;
  onSelect: (id: string) => void;
  formatDate: (date: string) => string;
  recentActivities: ActivityItem[];
}) => {
  // 誕生日をフォーマットする関数
  const formatBirthday = (dateString: string | null | undefined) => {
    if (!dateString) return '誕生日不明';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <button
      key={child.id}
      onClick={() => onSelect(child.id)}
      className={`flex items-center p-3 rounded-xl transition-all duration-300 w-full group ${
        selectedChildId === child.id 
          ? 'bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 shadow-md ring-1 ring-indigo-300 transform hover:scale-[1.02]' 
          : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:border-indigo-200'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
        selectedChildId === child.id 
        ? 'ring-2 ring-indigo-300 shadow-sm' 
        : 'ring-1 ring-gray-200 group-hover:ring-indigo-200'
      }`}>
        {child.avatar_url ? (
          <img 
            src={child.avatar_url} 
            alt={child.full_name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
            <Users className="h-6 w-6 text-indigo-500" />
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className="font-medium text-base">{child.full_name}</p>
        <p className="text-xs text-gray-600 font-medium">
          {child.birthday ? `${formatBirthday(child.birthday)}・${child.age || '?'}歳` : '誕生日不明'}
        </p>
        
        {/* アクティビティインジケーター */}
        <div className="flex gap-1 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="作品活動"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400" title="感情記録"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="学習活動"></div>
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
  );
});

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
    averageScore: 0,
    steamProgress: {
      science: 0,
      technology: 0,
      engineering: 0,
      art: 0,
      mathematics: 0
    }
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
        // 各子供の最新の活動日を取得
        const childrenWithLatestActivity = await Promise.all(
          childrenWithAge.map(async (child) => {
            try {
              // 作品、感情記録、学習活動のうち最新のものを取得するSQL
              const { data: latestActivities, error: activitiesError } = await supabase.rpc(
                'get_latest_activity_date',
                { profile_id_param: child.id }
              );
              
              if (activitiesError) {
                console.error(`子供 ${child.username} の最新活動取得エラー:`, activitiesError);
                // エラー時は既存の last_active_at を使用
                return child;
              }
              
              if (latestActivities && latestActivities.length > 0) {
                const latestDate = latestActivities[0].latest_date;
                return {
                  ...child,
                  last_active_at: latestDate || child.last_active_at
                };
              }
              
              return child;
            } catch (error) {
              console.error(`子供 ${child.username} の最新活動取得エラー:`, error);
              return child;
            }
          })
        );
        
        setChildren(childrenWithLatestActivity);
        
        // localStorageから選択されていた子供のIDを取得
        const savedChildId = localStorage.getItem('selectedChildId');
        const savedChild = savedChildId ? childrenWithLatestActivity.find(child => child.id === savedChildId) : null;
        
        if (savedChild) {
          // 保存されていた子供を選択
          setSelectedChildId(savedChild.id);
          setChildName(savedChild.full_name);
        } else {
          // 最初の子供を選択
          setSelectedChildId(childrenWithLatestActivity[0].id);
          setChildName(childrenWithLatestActivity[0].full_name);
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

        // STEAM科目ごとの進捗を計算
        const steamProgress = {
          science: 0,
          technology: 0,
          engineering: 0,
          art: 0,
          mathematics: 0
        };
        
        progressData.forEach(item => {
          const subject = item.lesson_id.split('-')[0];
          if (subject === 'science') steamProgress.science++;
          else if (subject === 'technology') steamProgress.technology++;
          else if (subject === 'engineering') steamProgress.engineering++;
          else if (subject === 'art') steamProgress.art++;
          else if (subject === 'mathematics') steamProgress.mathematics++;
        });

        setLearningStats({
          totalPoints,
          level,
          completedLessons,
          totalLessons: 25,
          averageScore,
          steamProgress
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
        created_at: item.created_at,
        profile_id: item.profile_id
      }));

      // 感情データをActivityItem形式に変換
      const emotionActivities: ActivityItem[] = (emotionsData || []).map(item => ({
        id: item.id,
        type: '感情記録',
        emotion: item.emotion,
        date: new Date(item.created_at).toLocaleDateString('ja-JP'),
        created_at: item.created_at,
        profile_id: item.profile_id
      }));

      // 学習活動を取得
      const { data: learningData, error: learningError } = await supabase
        .from('learning_progress')
        .select('id, lesson_id, completed_at, status, user_id')
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
        created_at: item.completed_at || '',
        profile_id: item.user_id
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

  // 感情アイコンを取得する関数
  const getEmotionIcon = (emotion: string) => {
    switch(emotion) {
      case 'とてもうれしい':
        return <div className="text-yellow-500 flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
          <Star className="h-4 w-4" fill="currentColor" />
        </div>;
      case 'うれしい':
        return <div className="text-pink-500 flex items-center justify-center w-6 h-6 bg-pink-100 rounded-full">
          <Heart className="h-4 w-4" fill="currentColor" />
        </div>;
      case 'ふつう':
        return <div className="text-purple-500 flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
          <Smile className="h-4 w-4" />
        </div>;
      case 'すこしかなしい':
        return <div className="text-blue-500 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
          <Meh className="h-4 w-4" />
        </div>;
      case 'かなしい':
        return <div className="text-indigo-500 flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full">
          <Frown className="h-4 w-4" />
        </div>;
      default:
        return <div className="text-gray-500 flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
          <Meh className="h-4 w-4" />
        </div>;
    }
  };

  // 感情色を取得する関数
  const getEmotionColor = (emotion: string) => {
    switch(emotion) {
      case 'とてもうれしい':
        return 'bg-yellow-500';
      case 'うれしい':
        return 'bg-pink-500';
      case 'ふつう':
        return 'bg-purple-500';
      case 'すこしかなしい':
        return 'bg-blue-500';
      case 'かなしい':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
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
                <p className="text-lg font-bold text-indigo-900">{childrenStats[selectedChildId]?.totalEmotions || 0}<span className="text-xs font-normal ml-1">件</span></p>
              </div>
            </div>
            
            {/* 最新の感情 */}
            <div className="bg-gradient-to-r from-pink-50 to-indigo-50 rounded-lg p-4">
              <p className="text-xs text-gray-700 mb-2">最新の記録</p>
              {emotionStats.latestEmotion ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEmotionIcon(emotionStats.latestEmotion)}
                    <span className="font-medium text-sm">{emotionStats.latestEmotion}</span>
                  </div>
                  <span className="text-xs text-gray-500">{emotionStats.latestDate}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">データなし</p>
              )}
            </div>
            
            {/* 感情分布 */}
            <div className="space-y-3 pt-2">
              <p className="text-sm text-gray-700 font-medium">感情の分布</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="flex flex-col items-center">
                  {getEmotionIcon('とてもうれしい')}
                  <p className="text-xs text-gray-600 mt-1">とても<br/>うれしい</p>
                </div>
                <div className="flex flex-col items-center">
                  {getEmotionIcon('うれしい')}
                  <p className="text-xs text-gray-600 mt-1">うれしい</p>
                </div>
                <div className="flex flex-col items-center">
                  {getEmotionIcon('ふつう')}
                  <p className="text-xs text-gray-600 mt-1">ふつう</p>
                </div>
                <div className="flex flex-col items-center">
                  {getEmotionIcon('すこしかなしい')}
                  <p className="text-xs text-gray-600 mt-1">すこし<br/>かなしい</p>
                </div>
                <div className="flex flex-col items-center">
                  {getEmotionIcon('かなしい')}
                  <p className="text-xs text-gray-600 mt-1">かなしい</p>
                </div>
              </div>
              {emotionStats.recentEmotions.map(emotion => (
                <div key={emotion.emotion} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getEmotionIcon(emotion.emotion)}
                      <span className="text-sm text-gray-700">{emotion.emotion}</span>
                    </div>
                    <span className="text-xs text-gray-500">{emotion.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getEmotionColor(emotion.emotion)}`}
                      style={{ width: `${emotion.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-16">
      {/* ヘッダーセクション - シンプルな青紫色のグラデーション */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-5 text-white shadow-md mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">
                {childName}のダッシュボード
              </h1>
              <p className="text-blue-50 text-sm">お子様の成長と活動を確認できます</p>
            </div>
            
            {/* シンプルな統計 */}
            <div className="flex divide-x divide-white/20">
              <div className="text-center px-4 first:pl-0 last:pr-0">
                <p className="text-lg font-bold">{stats.totalWorks}</p>
                <p className="text-xs text-blue-50">作品</p>
              </div>
              <div className="text-center px-4 first:pl-0 last:pr-0">
                <p className="text-lg font-bold">{stats.totalEmotions}</p>
                <p className="text-xs text-blue-50">感情</p>
              </div>
              <div className="text-center px-4 first:pl-0 last:pr-0">
                <p className="text-lg font-bold">{stats.totalLearning}</p>
                <p className="text-xs text-blue-50">学習</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 子供選択タブ - モダンなデザイン */}
      {children.length >= 1 && (
        <div className="overflow-auto scrollbar-hide mb-6 bg-white rounded-xl p-5 shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center">
              <Users className="h-4 w-4 text-indigo-500 mr-2" />
              お子様を選択
            </h2>
            {children.length > 3 && (
              <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                すべて表示
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children.map(child => (
              <ChildSelectButton 
                key={child.id} 
                child={child} 
                selectedChildId={selectedChildId} 
                onSelect={handleChildChange}
                formatDate={formatDate}
                recentActivities={recentActivities}
              />
            ))}
          </div>
        </div>
      )}

      {/* メインコンテンツエリア - 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側カラム - 最近の活動 */}
        <div className="space-y-6">
          {/* 最近の活動カード */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                <span>最近の活動</span>
              </h3>
              <Link to={`/parent/analytics?child=${selectedChildId}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
                <span>詳細を見る →</span>
              </Link>
            </div>
            
            <div className="p-5">
              {recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100">
                  {recentActivities.slice(0, 15).map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      selectedChildId={selectedChildId}
                      getActivityIcon={getActivityIcon}
                      getEmotionIcon={getEmotionIcon}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-indigo-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">活動記録がありません</p>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">お子様がアプリを使用すると、活動がここに表示されます</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側カラム - 成長指標 */}
        <div className="space-y-6">
          {/* 成長指標カード - デザイン強化 */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <span>成長指標</span>
              </h3>
              <Link to={`/parent/analytics?child=${selectedChildId}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center group">
                <span>詳細分析 →</span>
              </Link>
            </div>
            
            <div className="p-6 space-y-7">
              {/* 感情理解 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-pink-100 rounded-full shadow-sm">
                      <Heart className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-800">感情理解</span>
                      <p className="text-xs text-gray-500 mt-0.5">感情の記録と認識の能力</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-pink-600">{growthStats.emotionalUnderstanding}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                    style={{ width: `${growthStats.emotionalUnderstanding}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
              
              {/* 学習進捗 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-full shadow-sm">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-800">学習進捗</span>
                      <p className="text-xs text-gray-500 mt-0.5">STEAM学習の習得と成長</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{growthStats.learningProgress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${growthStats.learningProgress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
              
              {/* 創造性 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-full shadow-sm">
                      <Image className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-800">創造性</span>
                      <p className="text-xs text-gray-500 mt-0.5">作品制作と創造的思考</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{growthStats.creativity}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    style={{ width: `${growthStats.creativity}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>

              {/* 総合成長度 */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-full shadow-sm">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-800">総合成長度</span>
                      <p className="text-xs text-gray-500 mt-0.5">全体的な発達と成長</p>
                    </div>
                  </div>
                  {/* 総合成長度は3つの指標の平均値 */}
                  <span className="text-lg font-bold text-indigo-600">
                    {Math.round((growthStats.emotionalUnderstanding + growthStats.learningProgress + growthStats.creativity) / 3)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                    style={{ width: `${Math.round((growthStats.emotionalUnderstanding + growthStats.learningProgress + growthStats.creativity) / 3)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">0%</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
              
              {/* 追加の説明テキスト */}
              <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-full mt-0.5">
                    <AlertCircle className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-900">成長指標について</p>
                    <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                      この指標はお子様のアプリ使用状況から算出された目安です。感情理解、学習進捗、創造性の3つの観点から総合的な成長を評価しています。詳しい分析は詳細ページでご確認ください。
                    </p>
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