import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Trophy } from 'lucide-react';
import { GradientHeader } from '@/components/Common/GradientHeader';

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
      w-full text-left block bg-white rounded-3xl shadow-lg 
      hover:shadow-xl transition-all duration-300 p-8
      hover:scale-[1.03] relative border-2 border-transparent
      ${completed ? 'border-green-400' : ''}
    `}
  >
    {completed && (
      <div className="absolute top-4 right-4">
        <Trophy className="h-6 w-6 text-green-400" />
      </div>
    )}
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-lg text-gray-600">{description}</p>
      </div>

      <div className="flex items-center justify-between text-gray-600">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span className="text-lg">
            {'★'.repeat(difficulty)}
            {'☆'.repeat(3 - difficulty)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="text-lg">{duration}ぷん</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-indigo-400" />
          <span className="text-lg">{points}ポイント</span>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/child/learning"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        もどる
      </Link>

      <GradientHeader 
        title={title}
        gradientColors={{
          from: '#8ec5d6',
          via: '#f7c5c2',
          to: '#f5f6bf'
        }}
      />

      <p className="text-xl text-center mb-12 text-gray-600">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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