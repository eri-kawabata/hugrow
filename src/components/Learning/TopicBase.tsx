import { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LearningLayout } from './LearningLayout';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { Star, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '../Common/Button';

type TopicBaseProps = {
  subject: string;
  topic: {
    id: string;
    title: string;
    description: string;
    difficulty: 1 | 2 | 3;
    estimatedTime: string;
    objectives: string[];
  };
  children: ReactNode;
  onComplete?: () => void;
};

export function TopicBase({
  subject,
  topic,
  children,
  onComplete
}: TopicBaseProps) {
  const navigate = useNavigate();
  const { progress } = useLearningProgress(subject, topic.id);

  return (
    <LearningLayout title={topic.title}>
      <div className="space-y-8">
        {/* トピック概要 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/learning/${subject}`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="もどる"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{topic.title}</h1>
              <p className="text-gray-600">{topic.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-gray-600">
                むずかしさ: {Array(topic.difficulty).fill('★').join('')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600">
                よそうじかん: {topic.estimatedTime}
              </span>
            </div>
            {progress && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                <span className="text-gray-600">
                  れんぞくせいかい: {progress.streak}かい
                </span>
              </div>
            )}
          </div>

          {/* 学習目標 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-bold mb-2">がくしゅうもくひょう</h2>
            <ul className="space-y-2">
              {topic.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {children}
        </div>

        {/* 完了ボタン */}
        {onComplete && (
          <div className="flex justify-center">
            <Button
              onClick={onComplete}
              size="lg"
              className="flex items-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              かんりょう！
            </Button>
          </div>
        )}
      </div>
    </LearningLayout>
  );
} 