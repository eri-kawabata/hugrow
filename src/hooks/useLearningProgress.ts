import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  attempts: number;
  time_spent: number;
  metadata: Record<string, any>;
};

export function useLearningProgress(lessonId: string | undefined = 'overall') {
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        if (lessonId === 'overall') {
          // 全体の進捗を取得
          const { data, error } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          // 科目ごとの進捗を集計
          const progressBySubject = data.reduce((acc: Record<string, any>, curr) => {
            const subject = curr.lesson_id.split('-')[0];
            if (!acc[subject]) {
              acc[subject] = {
                completed: 0,
                total: 0,
                completion: 0
              };
            }
            acc[subject].total++;
            if (curr.completed_at) {
              acc[subject].completed++;
            }
            acc[subject].completion = Math.round((acc[subject].completed / acc[subject].total) * 100);
            return acc;
          }, {});

          setProgress(progressBySubject);
        } else {
          // 特定のレッスンの進捗を取得
          const { data, error } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          setProgress(data || {});
        }
      } catch (err) {
        console.error('Error fetching learning progress:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, lessonId]);

  const startLesson = async () => {
    if (!user?.id || !lessonId) {
      throw new Error('User or lesson not found');
    }

    const { data, error } = await supabase
      .from('learning_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        started_at: new Date().toISOString(),
        attempts: progress ? progress.attempts + 1 : 1,
        time_spent: 0,
        metadata: {},
      })
      .select()
      .single();

    if (error) throw error;
    setProgress(data);
    return data;
  };

  const updateProgress = async (updates: Partial<LearningProgress>) => {
    if (!user?.id || !lessonId || !progress?.id) {
      throw new Error('Progress not found');
    }

    const { data, error } = await supabase
      .from('learning_progress')
      .update(updates)
      .eq('id', progress.id)
      .select()
      .single();

    if (error) throw error;
    setProgress(data);
    return data;
  };

  const completeLesson = async (score: number) => {
    return updateProgress({
      completed_at: new Date().toISOString(),
      score,
    });
  };

  return {
    progress,
    loading,
    error,
    startLesson,
    updateProgress,
    completeLesson,
  };
} 