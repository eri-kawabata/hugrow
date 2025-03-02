import { useCallback, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/types';

interface ParentModeState {
  isParentMode: boolean;
  selectedChildId: string | null;
  children: Profile[];
}

const parentModeAtom = atom<ParentModeState>({
  isParentMode: false,
  selectedChildId: null,
  children: []
});

export function useParentMode() {
  const [state, setState] = useAtom(parentModeAtom);
  const navigate = useNavigate();

  // 子供一覧の取得
  const fetchChildren = useCallback(async (parentId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('child_number');

    if (error) throw error;
    setState(prev => ({ ...prev, children: data }));
  }, [setState]);

  // 子供の切り替え
  const switchChild = useCallback((childId: string) => {
    setState(prev => ({ ...prev, selectedChildId: childId }));
    navigate('/report'); // レポート画面へ遷移
  }, [setState, navigate]);

  // 保護者モードの切り替え
  const toggleParentMode = useCallback(() => {
    setState(prev => ({ ...prev, isParentMode: !prev.isParentMode }));
  }, [setState]);

  return {
    ...state,
    fetchChildren,
    switchChild,
    toggleParentMode
  };
} 