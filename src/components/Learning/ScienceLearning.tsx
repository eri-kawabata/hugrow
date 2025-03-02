import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const scienceLessons: readonly Lesson[] = [
  {
    id: 'science-1',
    title: '生き物のふしぎ',
    description: '身近な生き物の生態や特徴について学びましょう',
    difficulty: 1,
    duration: 20,
    points: 100,
  },
  {
    id: 'science-2',
    title: '植物の成長',
    description: '植物の成長過程と必要な条件を理解しましょう',
    difficulty: 1,
    duration: 25,
    points: 120,
  },
  {
    id: 'science-3',
    title: '天気と気象',
    description: '天気の変化と気象現象のメカニズムを学びましょう',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'science-4',
    title: '地球と宇宙',
    description: '私たちの住む地球と広大な宇宙について探求しましょう',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'science-5',
    title: '物質の性質',
    description: '身の回りの物質の性質と変化について実験しましょう',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
] as const;

export function ScienceLearning() {
  return (
    <BaseLearning
      title="理科"
      description="自然界の不思議を探求し、科学的な思考力を育みましょう"
      lessons={scienceLessons}
    />
  );
}