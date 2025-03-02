import React, { useState, useCallback, memo, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Trophy } from 'lucide-react';
import { motion, AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { scienceLessons } from './ScienceLearning';
import { technologyLessons } from './TechnologyLearning';
import { engineeringLessons } from './EngineeringLearning';
import { artLessons } from './ArtLearning';
import { mathLessons } from './MathLearning';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useLessonContent } from '@/hooks/useLessonContent';
import { useRewards } from '@/hooks/useRewards';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const allLessons = [
  ...scienceLessons,
  ...technologyLessons,
  ...engineeringLessons,
  ...artLessons,
  ...mathLessons,
];

// アニメーション設定
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// ナビゲーションボタン
const NavigationButton = memo(({ 
  onClick, 
  disabled, 
  direction,
  children 
}: {
  onClick: () => void;
  disabled: boolean;
  direction: 'prev' | 'next';
  children: React.ReactNode;
}) => (
  <LazyMotion features={domAnimation}>
    <m.button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        ${direction === 'prev' 
          ? 'text-gray-600 hover:text-gray-900' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={false}
    >
      {direction === 'prev' && <ChevronLeft className="h-5 w-5" />}
      {children}
      {direction === 'next' && <ChevronRight className="h-5 w-5" />}
    </m.button>
  </LazyMotion>
));

NavigationButton.displayName = 'NavigationButton';

// プログレスバー
const ProgressBar = memo(({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <motion.div
      className="bg-indigo-600 h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// 問題カード
const QuestionCard = memo(({ 
  question,
  choices,
  onAnswer,
  answered,
  selectedIndex,
  correctIndex,
  explanation,
}: {
  question: string;
  choices: string[];
  onAnswer: (index: number) => void;
  answered: boolean;
  selectedIndex: number | null;
  correctIndex: number;
  explanation: string | null;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <p className="text-lg font-medium text-gray-900">{question}</p>
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <motion.button
          key={index}
          onClick={() => !answered && onAnswer(index)}
          disabled={answered}
          whileHover={!answered ? { scale: 1.01 } : {}}
          whileTap={!answered ? { scale: 0.99 } : {}}
          className={`
            w-full text-left p-4 rounded-lg border transition-colors
            ${answered
              ? index === correctIndex
                ? 'bg-green-50 border-green-200 text-green-800'
                : index === selectedIndex
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'border-gray-200'
              : 'border-gray-200 hover:border-indigo-500'
            }
          `}
        >
          {choice}
        </motion.button>
      ))}
    </div>
    {answered && explanation && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <p className="text-blue-800">{explanation}</p>
      </motion.div>
    )}
  </motion.div>
));

QuestionCard.displayName = 'QuestionCard';

// レッスンコンテンツ
export function LessonContent() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [perfectQuiz, setPerfectQuiz] = useState(true);
  const [direction, setDirection] = useState(0);

  const lesson = allLessons.find(l => l.id === lessonId);
  const { progress, completeLesson } = useLearningProgress(lessonId);
  const { steps, loading, error, submitQuizResponse } = useLessonContent(lessonId);
  const { addReward, checkAchievements } = useRewards(user?.id || '');

  useEffect(() => {
    if (steps[currentStep]?.type === 'quiz') {
      setStartTime(Date.now());
    }
  }, [currentStep, steps]);

  const handleBack = useCallback(() => {
    navigate(`/child/learning/lesson/${lessonId}`);
  }, [lessonId, navigate]);

  const handlePrevStep = useCallback(() => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(0, prev - 1));
    setSelectedIndex(null);
  }, []);

  const handleNextStep = useCallback(() => {
    setDirection(1);
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
    setSelectedIndex(null);
  }, [steps.length]);

  const handleAnswer = useCallback(async (index: number) => {
    if (!steps[currentStep] || steps[currentStep].type !== 'quiz') return;

    setSelectedIndex(index);
    const isCorrect = index === steps[currentStep].correctAnswer;
    
    if (!isCorrect) {
      setPerfectQuiz(false);
    }

    const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 0;
    await submitQuizResponse({
      lessonId,
      questionId: steps[currentStep].id,
      answer: index,
      isCorrect,
      timeTaken
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success('せいかい！', {
        icon: '🎉',
        duration: 2000
      });
    } else {
      toast.error('ざんねん...', {
        icon: '😢',
        duration: 2000
      });
    }
  }, [currentStep, steps, lessonId, startTime, submitQuizResponse]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !steps.length) {
    return (
      <ErrorMessage
        title="エラーが発生しました"
        message="レッスンの読み込みに失敗しました。"
        onRetry={handleBack}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>もどる</span>
        </button>

        <ProgressBar current={currentStep + 1} total={steps.length} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <QuestionCard
                {...steps[currentStep]}
                onAnswer={handleAnswer}
                answered={selectedIndex !== null}
                selectedIndex={selectedIndex}
                correctIndex={steps[currentStep].correctAnswer}
              />
            </Suspense>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <NavigationButton
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            direction="prev"
          >
            まえへ
          </NavigationButton>
          <NavigationButton
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1 || selectedIndex === null}
            direction="next"
          >
            つぎへ
          </NavigationButton>
        </div>
      </div>
    </div>
  );
} 