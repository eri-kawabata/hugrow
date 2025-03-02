import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Work } from '../types/work';
import toast from 'react-hot-toast';

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWork = useCallback(async (workId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      // 作品の情報を取得
      const { data: work } = await supabase
        .from('works')
        .select('media_url')
        .eq('id', workId)
        .single();

      if (work?.media_url) {
        // Storageからファイルを削除
        const filePath = work.media_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('works')
            .remove([filePath]);
        }
      }

      // データベースから作品を削除
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', workId)
        .eq('user_id', user.id); // 自分の作品のみ削除可能

      if (error) throw error;

      // 作品一覧を更新
      setWorks(prev => prev.filter(w => w.id !== workId));
      toast.success('作品を削除しました');
    } catch (err) {
      console.error('Error deleting work:', err);
      toast.error('削除に失敗しました');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  return { works, loading, error, fetchWorks, deleteWork };
} 