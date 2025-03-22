import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { useLessonContent, Step as LessonStep } from '@/hooks/useLessonContent';

type Step = LessonStep & {
  type: 'content' | 'quiz';
  title: string;
  content: string;
  question?: string;
  choices?: string[];
  correctAnswer?: number;
  explanation?: string;
  quiz?: {
    id: string;
    correct_index: number;
  };
};

// プログレスバー
const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <motion.div
      className="bg-indigo-600 h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
);

// ナビゲーションボタン
const NavigationButton = ({ 
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
  <button
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
  >
    {children}
  </button>
);

// 問題カード
const QuestionCard = ({ 
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
  <div className="space-y-4">
    <p className="text-lg font-medium text-gray-900">{question}</p>
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => !answered && onAnswer(index)}
          disabled={answered}
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
        </button>
      ))}
    </div>
    {answered && explanation && (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">{explanation}</p>
      </div>
    )}
  </div>
);

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

// レッスンコンテンツ
export function LessonContent() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const { loading, error, steps, submitQuizResponse } = useLessonContent(lessonId);

  useEffect(() => {
    if (steps[stepIndex]?.type === 'quiz') {
      setStartTime(Date.now());
    }
  }, [stepIndex, steps]);

  const handleBack = useCallback(() => {
    navigate(`/child/learning/lesson/${lessonId}`);
  }, [lessonId, navigate]);

  const handlePrevStep = useCallback(() => {
    setDirection(-1);
    setStepIndex(prev => Math.max(0, prev - 1));
    setSelectedIndex(null);
  }, []);

  const handleNextStep = useCallback(() => {
    setDirection(1);
    setStepIndex(prev => Math.min(steps.length - 1, prev + 1));
    setSelectedIndex(null);
  }, [steps.length]);

  const handleAnswer = useCallback(async (index: number) => {
    if (!steps[stepIndex] || steps[stepIndex].type !== 'quiz') return;

    setSelectedIndex(index);
    const currentQuiz = steps[stepIndex] as Step;
    const isCorrect = currentQuiz.correctAnswer !== undefined && index === currentQuiz.correctAnswer;

    const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 0;
    
    if (!lessonId || !currentQuiz.quiz?.id) return;

    try {
      await submitQuizResponse(currentQuiz.quiz.id, index, timeTaken);

      if (isCorrect) {
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
    } catch (error) {
      console.error('Quiz response submission failed:', error);
      toast.error('エラーが発生しました');
    }
  }, [stepIndex, steps, lessonId, startTime, submitQuizResponse]);

  if (!lessonId) {
    return (
      <ErrorMessage
        title="エラーが発生しました"
        message="レッスンIDが見つかりません。"
        onRetry={() => navigate('/child/learning')}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
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

  const currentStep = steps[stepIndex] as Step;
  if (!currentStep) {
    return (
      <ErrorMessage
        title="エラーが発生しました"
        message="レッスンのステップが見つかりません。"
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

        <ProgressBar current={stepIndex + 1} total={steps.length} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIndex}
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
            {currentStep.type === 'quiz' ? (
              <QuestionCard
                question={currentStep.question || ''}
                choices={currentStep.choices || []}
                onAnswer={handleAnswer}
                answered={selectedIndex !== null}
                selectedIndex={selectedIndex}
                correctIndex={currentStep.correctAnswer || 0}
                explanation={currentStep.explanation || null}
              />
            ) : (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <NavigationButton
            onClick={handlePrevStep}
            disabled={stepIndex === 0}
            direction="prev"
          >
            まえへ
          </NavigationButton>
          <NavigationButton
            onClick={handleNextStep}
            disabled={stepIndex === steps.length - 1 || (currentStep.type === 'quiz' && selectedIndex === null)}
            direction="next"
          >
            つぎへ
          </NavigationButton>
        </div>
      </div>
    </div>
  );
} 