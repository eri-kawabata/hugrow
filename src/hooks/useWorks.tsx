import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export type Work = {
  id: string;
  user_id: string;
  title: string;
  type: 'drawing' | 'audio' | 'photo';
  content_url: string;
  created_at: string;
  updated_at?: string;
};

type WorkError = {
  message: string;
  code?: string;
};

export function useWorks(prefetch = false) {
  const { user, profile } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(!prefetch);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [selectedChildUserId, setSelectedChildUserId] = useState<string | null>(
    localStorage.getItem('selectedChildUserId')
  );

  // 子供切り替え時のイベントリスナー
  useEffect(() => {
    // ローカルストレージの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedChildUserId') {
        console.log('【デバッグ】useWorks: selectedChildUserIdが変更されました:', e.newValue);
        setSelectedChildUserId(e.newValue);
        fetchWorks(true); // 強制的に再取得
      }
    };

    // カスタムイベントを監視
    const handleChildChange = () => {
      const newSelectedChildUserId = localStorage.getItem('selectedChildUserId');
      console.log('【デバッグ】useWorks: selectedChildUserIdが変更されました (カスタムイベント):', newSelectedChildUserId);
      setSelectedChildUserId(newSelectedChildUserId);
      fetchWorks(true); // 強制的に再取得
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
    };
  }, []);

  const handleError = (error: unknown) => {
    const workError = error as WorkError;
    const errorMessage = workError.message || '予期せぬエラーが発生しました';
    setError(new Error(errorMessage));
    toast.error(errorMessage);
    console.error('Works error:', error);
  };

  const fetchWorks = useCallback(async (force = false) => {
    if (!user) return;

    // キャッシュの確認（5分）
    if (!force && lastFetch && new Date().getTime() - lastFetch.getTime() < 5 * 60 * 1000) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('【デバッグ】useWorks: fetchWorks開始');
      console.log('【デバッグ】useWorks: ユーザー情報:', user);
      console.log('【デバッグ】useWorks: プロファイル情報:', profile);
      console.log('【デバッグ】useWorks: 選択中の子供ID:', selectedChildUserId);

      let query = supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });

      if (profile?.role === 'parent') {
        console.log('【デバッグ】useWorks: 親モードでの取得');
        const { data: children } = await supabase
          .from('parent_child_relations')
          .select('child_id')
          .eq('parent_id', user.id);

        console.log('【デバッグ】useWorks: 取得した子供関係:', children);

        const childIds = children?.map(relation => relation.child_id) || [];
        console.log('【デバッグ】useWorks: 子供IDリスト:', childIds);
        
        query = query.in('user_id', [user.id, ...childIds]);
        console.log('【デバッグ】useWorks: 親モードでのクエリ:', query);
      } else {
        // 子供モードの場合、選択された子供のIDを使用
        if (selectedChildUserId) {
          query = query.eq('user_id', selectedChildUserId);
          console.log('【デバッグ】useWorks: 子供のユーザーIDでフィルタリング:', selectedChildUserId);
        } else {
          query = query.eq('user_id', user.id);
          console.log('【デバッグ】useWorks: ユーザーIDでフィルタリング:', user.id);
        }
        
        console.log('【デバッグ】useWorks: 子供モードでのクエリ:', query);
      }

      const { data, error } = await query;
      console.log('【デバッグ】useWorks: クエリ結果:', data);
      console.log('【デバッグ】useWorks: クエリエラー:', error);
      
      if (error) throw error;

      setWorks(data || []);
      setLastFetch(new Date());
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, lastFetch, selectedChildUserId]);

  const createWork = async (work: Omit<Work, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .insert([
          {
            ...work,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setWorks(prev => [data, ...prev]);
      toast.success('作品を作成しました');
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWork = async (id: string, updates: Partial<Omit<Work, 'id' | 'user_id'>>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorks(prev =>
        prev.map(work => (work.id === id ? { ...work, ...data } : work))
      );
      toast.success('作品を更新しました');
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteWork = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorks(prev => prev.filter(work => work.id !== id));
      toast.success('作品を削除しました');
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !prefetch) {
      fetchWorks();
    }
  }, [user, fetchWorks, prefetch]);

  return {
    works,
    loading,
    error,
    fetchWorks: () => fetchWorks(true),
    createWork,
    updateWork,
    deleteWork,
  };
} 