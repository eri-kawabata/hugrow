import { useState, useCallback } from 'react';
import { LearningContent } from '../LearningContent';
import { Button } from '../../Common/Button';
import { Check, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearningProgress } from '../../../hooks/useLearningProgress';

const ADDITION_CONTENT = {
  id: 'addition',
  title: 'たしざん',
  description: 'たのしくたしざんのれんしゅうをしよう！',
  duration: '10ぷん',
  level: 1,
  objectives: [
    'かずをたすことができるようになる',
    '10までのたしざんができるようになる',
    'ずをつかってかんがえることができるようになる'
  ]
};

// 問題を生成する関数
function generateQuestion() {
  const num1 = Math.floor(Math.random() * 5) + 1;
  const num2 = Math.floor(Math.random() * (10 - num1)) + 1;
  return { num1, num2, answer: num1 + num2 };
}

export function Addition() {
  const [question, setQuestion] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { progress, updateProgress } = useLearningProgress('math', 'addition');

  const checkAnswer = useCallback(async () => {
    const correct = parseInt(userAnswer) === question.answer;
    setIsCorrect(correct);
    
    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    await updateProgress(correct);
  }, [userAnswer, question.answer, updateProgress]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
    setUserAnswer('');
    setIsCorrect(null);
  }, []);

  return (
    <LearningContent 
      category="math" 
      content={ADDITION_CONTENT}
    >
      <div className="space-y-8">
        {/* 進捗表示 */}
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <span className="font-bold">れんぞく: {progress.streak}</span>
          </div>
          <div className="text-sm text-gray-600">
            さいこう: {progress.bestStreak}かい
          </div>
        </div>

        {/* 問題表示 */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-8">
            {question.num1} + {question.num2} = ?
          </div>

          {/* 数字ボタン */}
          <div className="grid grid-cols-5 gap-4 max-w-md mx-auto mb-8">
            {[1,2,3,4,5,6,7,8,9,0].map(num => (
              <button
                key={num}
                onClick={() => setUserAnswer(prev => 
                  prev.length < 2 ? prev + num : prev
                )}
                className="aspect-square bg-white rounded-xl shadow-sm hover:shadow-md 
                          transition-shadow text-2xl font-bold"
              >
                {num}
              </button>
            ))}
          </div>

          {/* 回答欄 */}
          <div className="mb-8">
            <div className="text-3xl font-bold mb-4">
              こたえ: {userAnswer || '_'}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setUserAnswer('')}
                variant="secondary"
              >
                けす
              </Button>
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer}
              >
                かくにん
              </Button>
            </div>
          </div>

          {/* 結果表示 */}
          {isCorrect !== null && (
            <div className={`text-2xl font-bold mb-6 ${
              isCorrect ? 'text-green-500' : 'text-red-500'
            }`}>
              {isCorrect ? 'せいかい！' : 'ざんねん...'}
            </div>
          )}

          {/* 次の問題ボタン */}
          {isCorrect !== null && (
            <Button
              onClick={nextQuestion}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              つぎのもんだい
            </Button>
          )}
        </div>
      </div>
    </LearningContent>
  );
} 