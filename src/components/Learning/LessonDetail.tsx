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
import { GradientHeader } from '@/components/Common/GradientHeader';
import { motion } from 'framer-motion';
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
    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-lg"
  >
    <ArrowLeft className="h-6 w-6 mr-2" />
    <span>もどる</span>
  </button>
));

BackButton.displayName = 'BackButton';

const StartButton = memo(({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <motion.button
    onClick={onClick}
    disabled={loading}
    className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-400 to-blue-400 text-white py-6 px-8 rounded-2xl text-2xl font-bold hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {loading ? (
      <>
        <LoadingSpinner size="lg" color="white" fullHeight={false} />
        <span>よみこみちゅう...</span>
      </>
    ) : (
      <>
        <Play className="h-8 w-8" />
        <span>はじめる！</span>
      </>
    )}
  </motion.button>
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
      toast.success('レッスンをはじめるよ！', {
        icon: '🎉',
        style: {
          fontSize: '1.2rem',
          borderRadius: '1rem',
          background: '#4ade80',
          color: '#fff'
        }
      });
      navigate(`/child/learning/lesson/${lessonId}/content`);
    } catch (error) {
      console.error('Failed to start lesson:', error);
      toast.error('うまくいかなかったよ...', {
        icon: '😢',
        style: {
          fontSize: '1.2rem',
          borderRadius: '1rem'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [lesson, startLesson, lessonId, navigate]);

  if (!lesson) {
    return (
      <ErrorMessage
        title="みつからないよ..."
        message="さがしているレッスンがないみたい。"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <BackButton onClick={handleBack} />

      <GradientHeader 
        title={lesson.title}
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl text-center text-gray-600">
          {lesson.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            className="bg-yellow-50 rounded-2xl p-6 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="h-8 w-8 text-yellow-400" />
            <span className="text-lg">
              {'★'.repeat(lesson.difficulty)}
              {'☆'.repeat(3 - lesson.difficulty)}
            </span>
          </motion.div>

          <motion.div 
            className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <Clock className="h-8 w-8 text-blue-400" />
            <span className="text-lg">{lesson.duration}ぷん</span>
          </motion.div>

          <motion.div 
            className="bg-purple-50 rounded-2xl p-6 flex flex-col items-center space-y-2"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="h-8 w-8 text-purple-400" />
            <span className="text-lg">{lesson.points}ポイント</span>
          </motion.div>
        </div>

        {progress?.completed_at ? (
          <motion.div 
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center gap-4">
              <Trophy className="h-12 w-12 text-green-400" />
              <div className="text-center">
                <p className="text-xl font-bold text-green-800">
                  クリアしたよ！おめでとう！
                </p>
                <p className="mt-2 text-green-600">
                  {new Date(progress.completed_at).toLocaleDateString('ja-JP')}に クリアしました
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <StartButton onClick={handleStart} loading={loading} />
        )}
      </motion.div>
    </div>
  );
} 