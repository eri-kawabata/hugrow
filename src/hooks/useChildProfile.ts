import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

export function useChildProfile() {
  const [childProfile, setChildProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId')
  );

  // 子供プロフィールを取得する関数
  const fetchChildProfile = async (childId: string | null) => {
    if (!childId) {
      setChildProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('useChildProfile - 子供プロフィール取得開始:', childId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', childId)
        .eq('role', 'child')
        .maybeSingle();

      if (error) {
        console.error('子供プロフィール取得エラー:', error);
        return;
      }

      console.log('useChildProfile - 取得したプロフィール:', data);
      setChildProfile(data);

      // 子供の名前をlocalStorageに保存
      if (data && data.username) {
        console.log('useChildProfile - 子供の名前を保存:', data.username);
        localStorage.setItem('childName', data.username);
        
        // カスタムイベントを発火して他のコンポーネントに通知
        const event = new CustomEvent('childProfileUpdated', { 
          detail: { childId, childName: data.username } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('子供プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // localStorageの変更を監視
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedChildId' || e.key === 'selectedChildProfileId') {
        const newChildId = e.newValue || localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
        console.log('useChildProfile - 子供ID変更検知:', e.key, newChildId);
        setSelectedChildId(newChildId);
      }
    };

    // カスタムイベントの監視
    const handleChildChange = () => {
      const newChildId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
      console.log('useChildProfile - selectedChildChanged イベント検知:', newChildId);
      setSelectedChildId(newChildId);
    };

    // 初期値を設定
    const initialChildId = localStorage.getItem('selectedChildId') || localStorage.getItem('selectedChildProfileId');
    if (initialChildId && initialChildId !== selectedChildId) {
      console.log('useChildProfile - 初期値設定:', initialChildId);
      setSelectedChildId(initialChildId);
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('selectedChildChanged', handleChildChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('selectedChildChanged', handleChildChange);
    };
  }, []);

  // 選択された子供IDが変更されたときにプロフィールを再取得
  useEffect(() => {
    console.log('useChildProfile - selectedChildId変更:', selectedChildId);
    fetchChildProfile(selectedChildId);
  }, [selectedChildId]);

  return { childProfile, loading, fetchChildProfile };
} 