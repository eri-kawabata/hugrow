import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Work } from '../types/work';
import toast from 'react-hot-toast';

// メディアURLを安全に取得する関数
const getSafeMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  
  // 既に完全なURLの場合はそのまま返す
  if (url.startsWith('http')) return url;
  
  // 相対パスの場合はSupabaseの完全なURLを生成
  try {
    const { data } = supabase.storage.from('works').getPublicUrl(url);
    return data.publicUrl;
  } catch (error) {
    console.error('URL生成エラー:', error);
    return url;
  }
};

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorks = useCallback(async (userId?: string, profileId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      // クエリを構築
      let query = supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      
      // ユーザーIDが指定されている場合は、そのユーザーの作品のみを取得
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // ユーザーIDが指定されていない場合は、現在のユーザーの作品のみを取得
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // 作品データを正規化
      const normalizedWorks = (data || []).map(work => {
        const mediaUrl = getSafeMediaUrl(work.content_url);
        
        // サムネイルURLの設定
        let thumbnailUrl = undefined;
        if (work.type === 'photo' || work.type === 'drawing') {
          thumbnailUrl = mediaUrl;
        }
        
        return {
          ...work,
          media_url: mediaUrl,
          thumbnail_url: thumbnailUrl
        };
      });
      
      setWorks(normalizedWorks);
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
        .select('content_url')
        .eq('id', workId)
        .single();

      const mediaUrl = work?.content_url;

      if (mediaUrl) {
        // Storageからファイルを削除
        const filePath = mediaUrl.split('/').pop();
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
    } catch (error) {
      console.error('Error deleting work:', error);
      throw error;
    }
  }, []);

  return { works, setWorks, loading, error, fetchWorks, deleteWork };
} 