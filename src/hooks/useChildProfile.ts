import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

export function useChildProfile() {
  const [childProfile, setChildProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildProfile = async () => {
      try {
        // ローカルストレージから選択された子供のIDを取得
        const childId = localStorage.getItem('selectedChildId');
        if (!childId) return;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', childId)
          .eq('role', 'child')
          .maybeSingle();

        setChildProfile(data);
      } catch (error) {
        console.error('子供プロフィール取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildProfile();
  }, []);

  return { childProfile, loading };
} 