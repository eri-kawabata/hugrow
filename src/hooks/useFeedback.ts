import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Feedback } from '../types/feedback';

export function useFeedback(workId?: string) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    if (!workId) {
      setFeedbacks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('work_feedback')
        .select(`
          *,
          user_profile:profiles(display_name, avatar_url)
        `)
        .eq('work_id', workId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFeedbacks(data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  return { feedbacks, loading, error, fetchFeedbacks };
} 