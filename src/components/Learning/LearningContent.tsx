import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LearningLayout } from './LearningLayout';
import { LoadingState } from '../Common/LoadingState';
import { ErrorState } from '../Common/ErrorState';
import { Trophy, Clock, BookOpen } from 'lucide-react';

type LearningContentProps = {
  category: string;
  content: {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: number;
    objectives: string[];
  };
  children: React.ReactNode;
};

export function LearningContent({ category, content, children }: LearningContentProps) {
  const navigate = useNavigate();
  const { topicId } = useParams();

  if (!content) {
    return (
      <ErrorState 
        message="コンテンツが見つかりませんでした" 
        onRetry={() => navigate(`/learning/${category}`)} 
      />
    );
  }

  return (
    <LearningLayout title={content.title}>
      <div className="space-y-8">
        {/* コンテンツ概要 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-4">
            {content.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-5 w-5" />
              <span>{content.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Trophy className="h-5 w-5" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < content.level ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 学習目標 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
            <BookOpen className="h-5 w-5" />
            がくしゅうもくひょう
          </h2>
          <ul className="space-y-2">
            {content.objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {children}
        </div>
      </div>
    </LearningLayout>
  );
} 