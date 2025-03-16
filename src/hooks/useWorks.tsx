import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';
import { useProfile } from './useProfile';
import { useSupabaseClient } from './useSupabaseClient';

export type Work = {
  id: string;
  user_id: string;
  profile_id: string;
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
  const { user } = useAuth();
  const { profile } = useProfile();
  const supabase = useSupabaseClient();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WorkError | null>(null);
  const [selectedChildUserId, setSelectedChildUserId] = useState<string | null>(null);
  const [selectedChildProfileId, setSelectedChildProfileId] = useState<string | null>(null);

  // ローカルストレージの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedChildUserId') {
        setSelectedChildUserId(e.newValue);
      }
      if (e.key === 'selectedChildProfileId' || e.key === 'selectedChildId') {
        const newProfileId = e.newValue || localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
        console.log('useWorks - ローカルストレージから子供プロファイルID変更検知:', newProfileId);
        if (newProfileId !== selectedChildProfileId) {
          setSelectedChildProfileId(newProfileId);
          
          // プロファイルIDが変更されたら作品を再取得
          if (newProfileId) {
            console.log('useWorks - プロファイルID変更による作品再取得');
            fetchWorks(newProfileId);
          }
        }
      }
    };

    const handleChildChange = () => {
      const newUserId = localStorage.getItem('selectedChildUserId');
      const newProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
      console.log('useWorks - 子供変更イベント検知 - userId:', newUserId, 'profileId:', newProfileId);
      
      if (newProfileId !== selectedChildProfileId) {
        setSelectedChildUserId(newUserId);
        setSelectedChildProfileId(newProfileId);
        
        // 子供変更イベントが発生したら作品を再取得
        if (newProfileId) {
          console.log('useWorks - 子供変更イベントによる作品再取得');
          fetchWorks(newProfileId);
        }
      }
    };

    // 初期値を設定
    const initialUserId = localStorage.getItem('selectedChildUserId');
    const initialProfileId = localStorage.getItem('selectedChildProfileId') || localStorage.getItem('selectedChildId');
    console.log('useWorks - 初期値設定 - userId:', initialUserId, 'profileId:', initialProfileId);
    
    if (initialProfileId) {
      setSelectedChildUserId(initialUserId);
      setSelectedChildProfileId(initialProfileId);
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);

    // コンポーネントマウント時に一度だけ実行
    if (initialProfileId) {
      console.log('useWorks - 初期値による作品再取得');
      fetchWorks(initialProfileId);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
    };
  }, []);

  // エラーハンドリング
  const handleError = (error: any) => {
    console.error('作品データ取得エラー:', error);
    setError({
      message: '作品データの取得に失敗しました',
      code: error.code
    });
    setLoading(false);
  };

  // 作品データを取得
  const fetchWorks = useCallback(async (specificProfileId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // 使用するプロファイルIDを決定
      const profileIdToUse = specificProfileId || selectedChildProfileId;
      console.log('fetchWorks - 使用するプロファイルID:', profileIdToUse);
      console.log('fetchWorks - 現在のユーザーロール:', profile?.role);

      // プロファイルIDが指定されていない場合はエラーログを出力
      if (!profileIdToUse && profile?.role === 'parent') {
        console.warn('fetchWorks - 警告: 親モードでプロファイルIDが指定されていません');
      }

      let query = supabase.from('works').select('*');

      // 子供の場合は自分の作品のみ表示
      if (profile?.role === 'child') {
        // 子供モードでは選択された子供のプロファイルIDを使用
        if (profileIdToUse) {
          console.log('fetchWorks - 子供モード: 選択された子供の作品のみ表示 - profileId:', profileIdToUse);
          // プロファイルIDによるフィルタリングを有効化
          query = query.eq('profile_id', profileIdToUse);
          console.log('fetchWorks - プロファイルIDによるフィルタリングを有効化しました');
        } else {
          console.log('fetchWorks - 子供モード: 自分の作品のみ表示 - profileId:', profile.id);
          // プロファイルIDによるフィルタリングを有効化
          query = query.eq('profile_id', profile.id);
          console.log('fetchWorks - プロファイルIDによるフィルタリングを有効化しました');
        }
      } 
      // 親の場合は選択された子供の作品を表示
      else if (profile?.role === 'parent' && profileIdToUse) {
        console.log('fetchWorks - 親モード: 選択された子供の作品を表示 - profileId:', profileIdToUse);
        // プロファイルIDによるフィルタリングを有効化
        query = query.eq('profile_id', profileIdToUse);
        console.log('fetchWorks - プロファイルIDによるフィルタリングを有効化しました');
      }
      // プロファイルIDが指定されていない場合はユーザーIDでフィルタリング
      else if (user) {
        console.log('fetchWorks - プロファイルID未指定: ユーザーIDでフィルタリング');
        query = query.eq('user_id', user.id);
      }

      console.log('fetchWorks - 実行するクエリ:', query);
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('fetchWorks - データ取得エラー:', error);
        throw error;
      }

      console.log('fetchWorks - 取得した作品データ:', data);
      console.log('fetchWorks - 取得した作品数:', data?.length || 0);
      
      // 追加のフィルタリング - プロファイルIDが一致する作品のみを保持
      let filteredData = data || [];
      
      // プロファイルIDによるフィルタリングを有効化
      if (profileIdToUse) {
        // データベースクエリですでにフィルタリングしているので、ここでの追加フィルタリングは不要
        // ただし、念のため一致しない作品がないか確認
        const nonMatchingWorks = filteredData.filter(work => work.profile_id !== profileIdToUse);
        if (nonMatchingWorks.length > 0) {
          console.warn(`fetchWorks - 警告: ${nonMatchingWorks.length}件の作品がプロファイルIDと一致しません`);
          console.log('fetchWorks - 一致しない作品:', nonMatchingWorks);
          
          // 一致しない作品を除外
          filteredData = filteredData.filter(work => work.profile_id === profileIdToUse);
          console.log('fetchWorks - フィルタリング後の作品数:', filteredData.length);
        }
      }
      
      setWorks(filteredData);
      setLoading(false);
    } catch (error: any) {
      handleError(error);
    }
  }, [supabase, user, profile, selectedChildProfileId]);

  // 初回レンダリング時とプロファイルID変更時に作品を取得
  useEffect(() => {
    if (prefetch && selectedChildProfileId) {
      console.log('useWorks - 作品取得トリガー - selectedChildProfileId:', selectedChildProfileId);
      fetchWorks(selectedChildProfileId);
    }
  }, [fetchWorks, prefetch, selectedChildProfileId]);

  // 作品を作成
  const createWork = async (work: Omit<Work, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'profile_id'>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }

      // プロファイルIDを決定
      let profileId = null;
      
      // 選択中の子供プロファイルIDを取得（ローカルストレージから）
      const selectedChildProfileId = localStorage.getItem('selectedChildProfileId');
      
      // 子供の場合は自分のプロファイルID
      if (profile?.role === 'child') {
        profileId = profile.id;
        console.log('createWork - 子供モード: 自分のプロファイルIDを使用:', profileId);
      } 
      // 親の場合は選択された子供のプロファイルID
      else if (profile?.role === 'parent') {
        if (selectedChildProfileId) {
          profileId = selectedChildProfileId;
          console.log('createWork - 親モード: ローカルストレージから選択された子供のプロファイルIDを使用:', profileId);
        } else {
          console.warn('createWork - 警告: 親モードで選択された子供のプロファイルIDがありません');
        }
      }

      if (!profileId) {
        throw new Error('プロファイルIDが取得できません。子供を選択してください。');
      }

      console.log('createWork - 使用するプロファイルID:', profileId);
      console.log('createWork - 現在のユーザー:', user.id);

      const workData = {
        ...work,
        user_id: user.id,
        profile_id: profileId,
        status: 'published',
        visibility: 'private',
        metadata: {}
      };
      
      console.log('createWork - 保存するデータ:', workData);

      const { data, error } = await supabase
        .from('works')
        .insert([workData])
        .select()
        .single();

      if (error) {
        console.error('createWork - エラー:', error);
        console.error('createWork - エラーの詳細:', error.details, error.hint, error.code);
        throw error;
      }

      console.log('createWork - 保存成功:', data);
      setWorks(prev => [data, ...prev]);
      setLoading(false);
      return data;
    } catch (error: any) {
      console.error('createWork - 例外発生:', error);
      handleError(error);
      return null;
    }
  };

  const updateWork = async (id: string, updates: Partial<Omit<Work, 'id' | 'user_id' | 'profile_id'>>) => {
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

  return {
    works,
    loading,
    error,
    fetchWorks,
    createWork,
    updateWork,
    deleteWork,
  };
} 