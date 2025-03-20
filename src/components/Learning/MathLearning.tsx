import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';
import { Hash, Square, Puzzle, BarChart, Brain } from 'lucide-react';

export const mathLessons: readonly Lesson[] = [
  {
    id: 'math-1',
    title: 'かずあそび',
    description: 'たのしくかぞえてあそぼう！',
    difficulty: 1,
    duration: 15,
    points: 100,
    icon: Hash,
    color: 'from-blue-400 to-indigo-400'
  },
  {
    id: 'math-2',
    title: 'かたちあそび',
    description: 'まるやさんかくをみつけよう！',
    difficulty: 1,
    duration: 20,
    points: 150,
    icon: Square,
    color: 'from-green-400 to-teal-400'
  },
  {
    id: 'math-3',
    title: 'ならべてあそぼう',
    description: 'おもしろいならびかたをさがそう！',
    difficulty: 2,
    duration: 20,
    points: 180,
    icon: Puzzle,
    color: 'from-yellow-400 to-orange-400'
  },
  {
    id: 'math-4',
    title: 'グラフであそぼう',
    description: 'えやグラフでたしかめよう！',
    difficulty: 2,
    duration: 20,
    points: 200,
    icon: BarChart,
    color: 'from-purple-400 to-pink-400'
  },
  {
    id: 'math-5',
    title: 'なぞときあそび',
    description: 'たのしいなぞときにちょうせん！',
    difficulty: 2,
    duration: 20,
    points: 250,
    icon: Brain,
    color: 'from-red-400 to-rose-400'
  },
] as const;

export function MathLearning() {
  return (
    <BaseLearning
      title="すうじ"
      description="かずやかたちでたのしくあそぼう！"
      lessons={mathLessons}
      gradientColors={{
        from: '#3b82f6',
        via: '#06b6d4',
        to: '#0ea5e9'
      }}
    />
  );
} 