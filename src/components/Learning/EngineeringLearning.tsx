import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';
import { Wrench, Cpu, Zap, Building2, Leaf } from 'lucide-react';

export const engineeringLessons: readonly Lesson[] = [
  {
    id: 'eng-1',
    title: 'おもちゃのひみつ',
    description: 'すきなおもちゃのしくみをさがしてみよう！',
    difficulty: 1,
    duration: 15,
    points: 120,
    icon: Wrench,
    color: 'from-orange-400 to-red-400'
  },
  {
    id: 'eng-2',
    title: 'ロボットをつくろう',
    description: 'かんたんなロボットをつくってあそぼう！',
    difficulty: 1,
    duration: 20,
    points: 150,
    icon: Cpu,
    color: 'from-blue-400 to-indigo-400'
  },
  {
    id: 'eng-3',
    title: 'でんきのふしぎ',
    description: 'ピカピカひかるでんきのまほうをためしてみよう！',
    difficulty: 2,
    duration: 20,
    points: 180,
    icon: Zap,
    color: 'from-yellow-400 to-amber-400'
  },
  {
    id: 'eng-4',
    title: 'つみきのまほう',
    description: 'たかいタワーをつくってみよう！',
    difficulty: 2,
    duration: 20,
    points: 200,
    icon: Building2,
    color: 'from-green-400 to-teal-400'
  },
  {
    id: 'eng-5',
    title: 'エコなものづくり',
    description: 'ちきゅうにやさしいものづくりをしよう！',
    difficulty: 2,
    duration: 25,
    points: 250,
    icon: Leaf,
    color: 'from-emerald-400 to-green-400'
  },
] as const;

export function EngineeringLearning() {
  return (
    <BaseLearning
      title="ものづくり"
      description="たのしくつくって、ふしぎをみつけよう！"
      lessons={engineeringLessons}
      gradientColors={{
        from: '#f97316',
        via: '#84cc16',
        to: '#22c55e'
      }}
    />
  );
} 