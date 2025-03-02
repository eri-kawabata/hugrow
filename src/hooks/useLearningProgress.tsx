import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string | null;
  metadata: Record<string, any> | null;
  difficulty_level: number;
  started_at: string;
  progress_data: Record<string, any>;
  score: number;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string | null;
};

type ProgressError = {
  message: string;
  code?: string;
};

export function useLearningProgress(lessonId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: unknown) => {
    const progressError = error as ProgressError;
    const errorMessage = progressError.message || '予期せぬエラーが発生しました';
    setError(new Error(errorMessage));
    toast.error(errorMessage);
    console.error('Learning progress error:', error);
  };

  const fetchProgress = useCallback(async () => {
    if (!user || !lessonId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error) throw error;

      setProgress(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [user, lessonId]);

  const startLesson = async () => {
    if (!user || !lessonId) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          progress_data: {},
          score: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<Omit<LearningProgress, 'id' | 'user_id' | 'lesson_id'>>) => {
    if (!user || !lessonId) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_progress')
        .update(updates)
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (score: number) => {
    if (!user || !lessonId) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score,
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
      toast.success('レッスンを完了しました！');
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && lessonId) {
      fetchProgress();
    }
  }, [user, lessonId, fetchProgress]);

  return {
    progress,
    loading,
    error,
    startLesson,
    updateProgress,
    completeLesson,
  };
} 