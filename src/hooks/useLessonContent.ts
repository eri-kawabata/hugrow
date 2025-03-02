import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { LessonStep, LessonQuiz } from '@/types/database';

export type Step = LessonStep & {
  quiz?: LessonQuiz;
};

export function useLessonContent(lessonId: string | undefined) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchSteps = async () => {
      try {
        setLoading(true);
        setError(null);

        // ステップを取得
        const { data: stepsData, error: stepsError } = await supabase
          .from('lesson_steps')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order');

        if (stepsError) throw stepsError;

        // クイズを取得
        const quizStepIds = stepsData
          .filter(step => step.type === 'quiz')
          .map(step => step.id);

        const { data: quizzesData, error: quizzesError } = await supabase
          .from('lesson_quizzes')
          .select('*')
          .in('step_id', quizStepIds);

        if (quizzesError) throw quizzesError;

        // ステップとクイズを結合
        const stepsWithQuizzes = stepsData.map(step => ({
          ...step,
          quiz: quizzesData.find(quiz => quiz.step_id === step.id),
        }));

        setSteps(stepsWithQuizzes);
      } catch (err) {
        console.error('Error fetching lesson content:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [lessonId]);

  const submitQuizResponse = async (
    quizId: string,
    selectedIndex: number,
    timeTaken: number
  ) => {
    const quiz = steps
      .map(step => step.quiz)
      .find(quiz => quiz?.id === quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const isCorrect = selectedIndex === quiz.correct_index;

    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        quiz_id: quizId,
        selected_index: selectedIndex,
        is_correct: isCorrect,
        time_taken: timeTaken,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  return {
    steps,
    loading,
    error,
    submitQuizResponse,
  };
} 