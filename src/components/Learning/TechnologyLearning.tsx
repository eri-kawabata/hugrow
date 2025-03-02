import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const technologyLessons: readonly Lesson[] = [
  {
    id: 'tech-1',
    title: 'コンピュータの仕組み',
    description: 'コンピュータの基本的な構造と動作原理を学びましょう',
    difficulty: 1,
    duration: 25,
    points: 120,
  },
  {
    id: 'tech-2',
    title: 'プログラミング入門',
    description: '簡単なプログラムを作りながらプログラミングの基礎を学びましょう',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'tech-3',
    title: 'インターネットの世界',
    description: 'インターネットの仕組みとWebの基礎知識を学びましょう',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'tech-4',
    title: 'デジタルものづくり',
    description: 'デジタル技術を使ったものづくりの方法を学びましょう',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
  {
    id: 'tech-5',
    title: 'AI入門',
    description: '人工知能の基本的な概念と活用方法を学びましょう',
    difficulty: 3,
    duration: 45,
    points: 250,
  },
] as const;

export function TechnologyLearning() {
  return (
    <BaseLearning
      title="技術"
      description="テクノロジーの仕組みを理解し、未来を創造する力を身につけましょう"
      lessons={technologyLessons}
    />
  );
} 