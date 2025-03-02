import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const mathLessons: readonly Lesson[] = [
  {
    id: 'math-1',
    title: '数と計算の基礎',
    description: '数の性質と基本的な計算方法を学びましょう',
    difficulty: 1,
    duration: 20,
    points: 100,
  },
  {
    id: 'math-2',
    title: '図形の世界',
    description: '平面図形と立体図形の性質を探求しましょう',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'math-3',
    title: 'パターンと規則',
    description: '数や図形のパターンを見つけて規則を理解しましょう',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'math-4',
    title: 'データの分析',
    description: 'グラフや表を使ってデータを分析する方法を学びましょう',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
  {
    id: 'math-5',
    title: '論理的思考',
    description: '数学的な考え方で問題を解決する方法を学びましょう',
    difficulty: 3,
    duration: 45,
    points: 250,
  },
] as const;

export function MathLearning() {
  return (
    <BaseLearning
      title="数学"
      description="論理的な思考力を養い、問題解決能力を高めましょう"
      lessons={mathLessons}
    />
  );
} 