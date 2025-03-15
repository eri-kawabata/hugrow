import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// 子供データの型定義
export type ChildProfile = {
  id: string;
  username: string;
  avatar_url?: string;
  birthday?: string | null;
  child_number?: number;
  status?: string;
  last_active_at?: string;
  age?: number | null;
};

// 統計データの型定義
export type ChildStats = {
  totalWorks: number;
  totalEmotions: number;
  totalLearning: number;
};

// 活動データの型定義
export type ActivityItem = {
  id: string;
  type: '作品' | '感情記録' | '学習';
  title?: string;
  emotion?: string;
  subject?: string;
  date: string;
  created_at: string;
};

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

// 日付フォーマット関数
export const formatDate = (dateString: string) => {
  if (!dateString) return '日付なし';
  
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    console.error('日付のフォーマットエラー:', e);
    return '日付エラー';
  }
};

// 子供データを取得するカスタムフック
export function useChildData() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childName, setChildName] = useState<string>('お子様');
  const [loading, setLoading] = useState(true);
  const [childrenStats, setChildrenStats] = useState<{[key: string]: ChildStats}>({});
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ChildStats>({
    totalWorks: 0,
    totalEmotions: 0,
    totalLearning: 0
  });
  const [growthStats, setGrowthStats] = useState({
    emotionalUnderstanding: 0,
    learningProgress: 0,
    creativity: 0
  });

  // 子供一覧を取得する関数
  const fetchChildren = useCallback(async () => {
    try {
      // キャッシュから子供データを取得
      const cachedChildren = localStorage.getItem('children');
      if (cachedChildren) {
        const parsedChildren = JSON.parse(cachedChildren);
        setChildren(parsedChildren);
        
        // 前回選択した子供IDを取得
        const lastSelectedChildId = localStorage.getItem('selectedChildId');
        if (lastSelectedChildId && parsedChildren.some((child: ChildProfile) => child.id === lastSelectedChildId)) {
          setSelectedChildId(lastSelectedChildId);
          return;
        } else if (parsedChildren.length > 0) {
          setSelectedChildId(parsedChildren[0].id);
          return;
        }
      }
      
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
        
        // キャッシュに保存
        localStorage.setItem('children', JSON.stringify(childrenWithAge));
        
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
  }, []);

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
  const fetchStats = useCallback(async (childId: string) => {
    try {
      // キャッシュから統計データを取得
      const cachedStats = localStorage.getItem(`stats_${childId}`);
      const cacheTime = localStorage.getItem(`stats_${childId}_time`);
      
      // キャッシュが10分以内なら使用
      if (cachedStats && cacheTime) {
        const now = new Date().getTime();
        const cacheAge = now - parseInt(cacheTime);
        if (cacheAge < 10 * 60 * 1000) { // 10分
          setStats(JSON.parse(cachedStats));
          return;
        }
      }
      
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

      const newStats = {
        totalWorks: worksCount,
        totalEmotions: emotionsCount,
        totalLearning: learningCount
      };
      
      // キャッシュを更新
      localStorage.setItem(`stats_${childId}`, JSON.stringify(newStats));
      localStorage.setItem(`stats_${childId}_time`, new Date().getTime().toString());
      
      setStats(newStats);
    } catch (error) {
      console.error('統計データの取得中にエラーが発生しました:', error);
    }
  }, []);

  // 最近の活動データを取得する関数
  const fetchRecentActivities = useCallback(async (childId: string) => {
    if (!supabase) return;

    try {
      setLoading(true);
      
      // キャッシュから活動データを取得
      const cachedActivities = localStorage.getItem(`activities_${childId}`);
      const cacheTime = localStorage.getItem(`activities_${childId}_time`);
      
      // キャッシュが2分以内なら使用
      if (cachedActivities && cacheTime) {
        const now = new Date().getTime();
        const cacheAge = now - parseInt(cacheTime);
        if (cacheAge < 2 * 60 * 1000) { // 2分
          setRecentActivities(JSON.parse(cachedActivities));
          setLoading(false);
          return;
        }
      }
      
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
      
      // キャッシュに保存
      localStorage.setItem(`activities_${childId}`, JSON.stringify(recentActivities));
      localStorage.setItem(`activities_${childId}_time`, new Date().getTime().toString());
      
      setRecentActivities(recentActivities);
      
    } catch (error) {
      console.error('最近の活動データの取得中にエラーが発生しました:', error);
      // エラー時は空の配列を設定
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 全ての子供の統計データを取得する関数
  const fetchAllChildrenStats = useCallback(async () => {
    if (!children.length) return;
    
    // キャッシュから全子供の統計データを取得
    const cachedAllStats = localStorage.getItem('all_children_stats');
    const cacheTime = localStorage.getItem('all_children_stats_time');
    
    // キャッシュが10分以内なら使用
    if (cachedAllStats && cacheTime) {
      const now = new Date().getTime();
      const cacheAge = now - parseInt(cacheTime);
      if (cacheAge < 10 * 60 * 1000) { // 10分
        setChildrenStats(JSON.parse(cachedAllStats));
        return;
      }
    }
    
    const stats: {[key: string]: ChildStats} = {};
    
    for (const child of children) {
      try {
        let worksCount = 0;
        let emotionsCount = 0;
        let learningCount = 0;

        // 作品の総数を取得
        try {
          const { count, error } = await supabase
            .from('works')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', child.id);

          if (error) {
            handleSupabaseError(error, `${child.username}の作品統計の取得に失敗しました`);
          } else if (count !== null) {
            worksCount = count;
          }
        } catch (worksError) {
          console.error(`${child.username}の作品統計の取得中にエラーが発生しました:`, worksError);
        }

        // 感情記録の総数を取得
        try {
          const { count, error } = await supabase
            .from('sel_responses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', child.id);

          if (error) {
            handleSupabaseError(error, `${child.username}の感情記録統計の取得に失敗しました`);
          } else if (count !== null) {
            emotionsCount = count;
          }
        } catch (emotionsError) {
          console.error(`${child.username}の感情記録統計の取得中にエラーが発生しました:`, emotionsError);
        }

        // 学習活動の総数を取得
        try {
          const { count, error } = await supabase
            .from('learning_activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', child.id);
          
          if (error) {
            handleSupabaseError(error, `${child.username}の学習統計の取得に失敗しました`);
          } else if (count !== null) {
            learningCount = count;
          }
        } catch (learningError) {
          console.error(`${child.username}の学習統計の取得中にエラーが発生しました:`, learningError);
        }

        stats[child.id] = {
          totalWorks: worksCount,
          totalEmotions: emotionsCount,
          totalLearning: learningCount
        };
        
      } catch (error) {
        console.error(`${child.username}の統計データの取得中にエラーが発生しました:`, error);
        stats[child.id] = {
          totalWorks: 0,
          totalEmotions: 0,
          totalLearning: 0
        };
      }
    }
    
    // キャッシュに保存
    localStorage.setItem('all_children_stats', JSON.stringify(stats));
    localStorage.setItem('all_children_stats_time', new Date().getTime().toString());
    
    console.log('全ての子供の統計データ:', stats);
    setChildrenStats(stats);
  }, [children]);

  // 成長統計を計算する関数
  const calculateGrowthStats = useCallback((childId: string) => {
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
  }, [childrenStats]);

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
  }, [children]);

  // 初期化
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // 選択された子供が変更されたときのデータ取得
  useEffect(() => {
    if (selectedChildId) {
      fetchChildName(selectedChildId);
      fetchStats(selectedChildId);
      fetchRecentActivities(selectedChildId);
      calculateGrowthStats(selectedChildId);
    }
  }, [selectedChildId, fetchChildName, fetchStats, fetchRecentActivities, calculateGrowthStats]);
  
  // 子供リストが変更されたときに全ての子供の統計を取得
  useEffect(() => {
    if (children.length > 0) {
      fetchAllChildrenStats();
    }
  }, [children, fetchAllChildrenStats]);

  return {
    children,
    selectedChildId,
    childName,
    loading,
    stats,
    recentActivities,
    childrenStats,
    growthStats,
    handleChildChange
  };
} 