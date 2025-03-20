import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const scienceLessons: readonly Lesson[] = [
  {
    id: 'science-1',
    title: 'どうぶつとなかよし',
    description: 'かわいいどうぶつたちのくらしをのぞいてみよう！',
    difficulty: 1,
    duration: 20,
    points: 100,
  },
  {
    id: 'science-2',
    title: 'おはながすくすく',
    description: 'たねをうえて、おはながさくまでをみてみよう！',
    difficulty: 1,
    duration: 25,
    points: 120,
  },
  {
    id: 'science-3',
    title: 'おてんきマジック',
    description: 'あめやゆきがふるひみつをたんけんしよう！',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'science-4',
    title: 'ちきゅうとうちゅう',
    description: 'おおきなちきゅうとキラキラほしをみてみよう！',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'science-5',
    title: 'ふしぎなじっけん',
    description: 'たのしいまほうのようなじっけんをしてみよう！',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
] as const;

export function ScienceLearning() {
  return (
    <BaseLearning
      title="りかのせかい"
      description="わくわくたのしい！ふしぎいっぱい！"
      lessons={scienceLessons}
    />
  );
}