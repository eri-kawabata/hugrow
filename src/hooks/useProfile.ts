import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Profile } from '../lib/types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // まず親プロフィールを探す
      const { data: parentProfile, error: parentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'parent')
        .maybeSingle();

      if (parentProfile) {
        setProfile(parentProfile);
        return parentProfile;
      }

      // 親プロフィールが見つからない場合は、子供プロフィールを探す
      const { data: childProfile, error: childError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'child')
        .maybeSingle();

      if (childProfile) {
        setProfile(childProfile);
        return childProfile;
      }

      // どちらも見つからない場合は、ロールを指定せずに検索
      const { data: anyProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        setError(new Error(error.message));
        return null;
      }

      setProfile(anyProfile);
      return anyProfile;
    } catch (error: any) {
      console.error('プロフィール取得エラー:', error);
      setError(error instanceof Error ? error : new Error('プロフィール取得中にエラーが発生しました'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, fetchProfile };
} 