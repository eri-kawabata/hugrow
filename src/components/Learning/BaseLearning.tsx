import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Trophy } from 'lucide-react';

export type LessonCardProps = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  duration: number;
  points: number;
  completed?: boolean;
  onClick: () => void;
};

const LessonCard = memo(({ 
  title, 
  description, 
  difficulty, 
  duration, 
  points,
  completed,
  onClick
}: LessonCardProps) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left block bg-white rounded-xl shadow-sm 
      hover:shadow-md transition-all duration-200 p-6 
      hover:scale-[1.02] relative
      ${completed ? 'border-2 border-green-500' : ''}
    `}
  >
    {completed && (
      <div className="absolute top-4 right-4">
        <Trophy className="h-5 w-5 text-green-500" />
      </div>
    )}
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span>難易度: {Array(difficulty).fill('★').join('')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>約{duration}分</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>{points}ポイント</span>
        </div>
      </div>
    </div>
  </button>
));

LessonCard.displayName = 'LessonCard';

export type Lesson = Omit<LessonCardProps, 'onClick'>;

type BaseLearningProps = {
  title: string;
  description: string;
  lessons: readonly Lesson[];
};

export function BaseLearning({ title, description, lessons }: BaseLearningProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/child/learning"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>戻る</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            {...lesson}
            onClick={() => navigate(`/child/learning/lesson/${lesson.id}`)}
          />
        ))}
      </div>
    </div>
  );
} 