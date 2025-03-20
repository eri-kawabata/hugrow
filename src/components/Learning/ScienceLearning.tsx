import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';
import { Bird, Flower2, Cloud, Globe2, TestTube } from 'lucide-react';

export const scienceLessons: readonly Lesson[] = [
  {
    id: 'science-1',
    title: 'どうぶつとなかよし',
    description: 'かわいいどうぶつたちのくらしをのぞいてみよう！',
    difficulty: 1,
    duration: 20,
    points: 100,
    icon: Bird,
    color: 'from-orange-400 to-red-400'
  },
  {
    id: 'science-2',
    title: 'おはながすくすく',
    description: 'たねをうえて、おはながさくまでをみてみよう！',
    difficulty: 1,
    duration: 25,
    points: 120,
    icon: Flower2,
    color: 'from-pink-400 to-rose-400'
  },
  {
    id: 'science-3',
    title: 'おてんきマジック',
    description: 'あめやゆきがふるひみつをたんけんしよう！',
    difficulty: 2,
    duration: 30,
    points: 150,
    icon: Cloud,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'science-4',
    title: 'ちきゅうとうちゅう',
    description: 'おおきなちきゅうとキラキラほしをみてみよう！',
    difficulty: 2,
    duration: 35,
    points: 180,
    icon: Globe2,
    color: 'from-indigo-400 to-purple-400'
  },
  {
    id: 'science-5',
    title: 'ふしぎなじっけん',
    description: 'かんたんなじっけんでかがくのふしぎをたしかめよう',
    difficulty: 'hard',
    duration: '25分',
    points: 200,
    icon: TestTube,
    color: 'from-green-400 to-emerald-400'
  },
] as const;

export function ScienceLearning() {
  return (
    <BaseLearning
      title="りかのせかい"
      description="わくわくたのしい！ふしぎいっぱい！"
      lessons={scienceLessons}
      gradientColors={{
        from: '#22c55e',
        via: '#3b82f6',
        to: '#6366f1'
      }}
    />
  );
}