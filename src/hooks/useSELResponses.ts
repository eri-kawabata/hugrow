import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { SELResponse } from '../lib/types';
import type { EmotionName } from '../lib/constants/emotions';

interface FetchOptions {
  userId: string;
  limit?: number;
  withFeedback?: boolean;
}

export function useSELResponses() {
  const [responses, setResponses] = useState<SELResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchResponses = useCallback(async (options: FetchOptions | string) => {
    setLoading(true);
    setError(null);

    try {
      const userId = typeof options === 'string' ? options : options.userId;
      const limit = typeof options === 'object' ? options.limit : 10;
      const withFeedback = typeof options === 'object' ? options.withFeedback : true;

      let query = supabase
        .from('sel_responses')
        .select(`
          *,
          sel_feedback (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!withFeedback) {
        query = query.select('*');
      }

      const { data, error } = await query;

      if (error) throw error;

      setResponses(data || []);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('感情データの取得に失敗しました');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addResponse = useCallback(async (
    userId: string, 
    emotion: EmotionName, 
    intensity: number
  ) => {
    try {
      const { error } = await supabase?.from('sel_responses').insert({
        user_id: userId,
        emotion,
        intensity,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      toast.success('感情を記録しました');
      return true;
    } catch (error) {
      console.error('感情記録エラー:', error);
      toast.error('記録に失敗しました');
      return false;
    }
  }, []);

  return {
    responses,
    setResponses,
    loading,
    error,
    fetchResponses,
    addResponse
  };
} 