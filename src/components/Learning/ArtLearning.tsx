import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const artLessons: readonly Lesson[] = [
  {
    id: 'art-1',
    title: '色彩の世界',
    description: '色の性質と組み合わせについて学びましょう',
    difficulty: 1,
    duration: 20,
    points: 100,
  },
  {
    id: 'art-2',
    title: 'デジタルアート',
    description: 'デジタルツールを使って作品を作りましょう',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'art-3',
    title: '写真の技法',
    description: '写真撮影の基本と表現方法を学びましょう',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'art-4',
    title: 'アニメーション',
    description: '動きのある作品の作り方を学びましょう',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
  {
    id: 'art-5',
    title: '芸術と感情',
    description: '感情を芸術で表現する方法を探求しましょう',
    difficulty: 3,
    duration: 45,
    points: 250,
  },
] as const;

export function ArtLearning() {
  return (
    <BaseLearning
      title="芸術"
      description="創造性を解き放ち、自分らしい表現方法を見つけましょう"
      lessons={artLessons}
    />
  );
} 