import React, { useState, useCallback, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Trophy, Play } from 'lucide-react';
import { scienceLessons } from './ScienceLearning';
import { technologyLessons } from './TechnologyLearning';
import { engineeringLessons } from './EngineeringLearning';
import { artLessons } from './ArtLearning';
import { mathLessons } from './MathLearning';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import toast from 'react-hot-toast';

const allLessons = [
  ...scienceLessons,
  ...technologyLessons,
  ...engineeringLessons,
  ...artLessons,
  ...mathLessons,
];

const BackButton = memo(({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
  >
    <ArrowLeft className="h-5 w-5" />
    <span>戻る</span>
  </button>
));

BackButton.displayName = 'BackButton';

const StartButton = memo(({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? (
      <>
        <LoadingSpinner size="sm" color="white" fullHeight={false} />
        <span>読み込み中...</span>
      </>
    ) : (
      <>
        <Play className="h-5 w-5" />
        <span>レッスンを始める</span>
      </>
    )}
  </button>
));

StartButton.displayName = 'StartButton';

export function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const lesson = allLessons.find(l => l.id === lessonId);
  const { progress, startLesson } = useLearningProgress(lessonId);

  const handleBack = useCallback(() => {
    const subject = lessonId?.split('-')[0];
    navigate(`/child/learning/${subject}`);
  }, [lessonId, navigate]);

  const handleStart = useCallback(async () => {
    if (!lesson) return;

    try {
      setLoading(true);
      await startLesson();
      toast.success('レッスンを開始しました！');
      navigate(`/child/learning/lesson/${lessonId}/content`);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      toast.error('レッスンの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [lesson, startLesson, lessonId, navigate]);

  if (!lesson) {
    return (
      <ErrorMessage
        title="レッスンが見つかりません"
        message="指定されたレッスンは存在しません。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <BackButton onClick={handleBack} />

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="mt-2 text-gray-600">{lesson.description}</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="h-5 w-5" />
              <span>難易度: {Array(lesson.difficulty).fill('★').join('')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span>所要時間: 約{lesson.duration}分</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Trophy className="h-5 w-5" />
              <span>獲得ポイント: {lesson.points}pt</span>
            </div>
          </div>

          {progress?.completed_at ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Trophy className="h-5 w-5" />
                <span>このレッスンは完了しています！</span>
              </div>
              <p className="mt-2 text-sm text-green-600">
                完了日時: {new Date(progress.completed_at).toLocaleString('ja-JP')}
              </p>
            </div>
          ) : (
            <StartButton onClick={handleStart} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
} 