import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Work } from '../types/work';
import toast from 'react-hot-toast';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// メディアURLを安全に取得する関数
const getSafeMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  
  // すでに完全なURLの場合はそのまま返す
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Supabaseのストレージパスの場合は公開URLに変換
  if (url.startsWith('works/')) {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${url}`;
  }
  
  return url;
};

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // サムネイルURLを生成する関数
  const generateThumbnailUrl = (work: Work): string | undefined => {
    // media_urlとcontent_urlの両方をチェック
    const mediaUrl = work.media_url || work.content_url;
    if (!mediaUrl) return undefined;
    
    // 作品タイプに基づいてサムネイルを生成
    if (work.type === 'photo' || work.type === 'drawing') {
      // 画像の場合はURLを正規化して返す
      return getSafeMediaUrl(mediaUrl);
    } else if (work.type === 'audio') {
      // 音声の場合は音声用のデフォルトサムネイルを返す
      return undefined;
    }
    
    return undefined;
  };

  const fetchWorks = useCallback(async (userId?: string, profileId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // プロファイルIDが指定されていない場合は空の配列を返す
      if (!profileId) {
        setWorks([]);
        return;
      }

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

      // プロファイルIDでフィルタリング
      query = query.eq('profile_id', profileId);

      const { data, error } = await query;

      if (error) throw error;
      
      // メディアタイプの正規化とサムネイルURLの追加
      const normalizedWorks = (data || []).map(work => {
        // 元のメディアタイプを保存
        const originalType = work.media_type;
        let normalizedType = originalType;
        
        // content_urlとmedia_urlの両方をチェック
        let mediaUrl = work.media_url || work.content_url;
        
        // 正規化ロジック
        if (originalType === 'image') {
          normalizedType = 'drawing';
        } else if (originalType === 'video') {
          normalizedType = 'photo';
        }
        
        // typeフィールドがある場合はそれを優先
        if (work.type) {
          normalizedType = work.type;
        }
        
        // media_urlが相対パスの場合、完全なURLに変換
        mediaUrl = getSafeMediaUrl(mediaUrl);
        
        // サムネイルURLの設定
        let thumbnailUrl = mediaUrl;
        if (normalizedType === 'audio') {
          thumbnailUrl = undefined; // 音声の場合はデフォルト表示を使用
        }
        
        return {
          ...work,
          type: normalizedType,
          media_type: normalizedType,
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
        .select('media_url, content_url')
        .eq('id', workId)
        .single();

      // media_urlとcontent_urlの両方をチェック
      const mediaUrl = work?.media_url || work?.content_url;
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