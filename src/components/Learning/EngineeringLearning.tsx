import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';

export const engineeringLessons: readonly Lesson[] = [
  {
    id: 'eng-1',
    title: '身近な機械の仕組み',
    description: '日常生活で使う機械の仕組みと原理を学びましょう',
    difficulty: 1,
    duration: 25,
    points: 120,
  },
  {
    id: 'eng-2',
    title: 'ロボット入門',
    description: 'ロボットの基本的な構造と制御方法を学びましょう',
    difficulty: 2,
    duration: 30,
    points: 150,
  },
  {
    id: 'eng-3',
    title: '電気の力',
    description: '電気の性質と活用方法について実験しながら学びましょう',
    difficulty: 2,
    duration: 35,
    points: 180,
  },
  {
    id: 'eng-4',
    title: '構造と力学',
    description: '物を支える構造と力の関係について学びましょう',
    difficulty: 3,
    duration: 40,
    points: 200,
  },
  {
    id: 'eng-5',
    title: 'エネルギーと環境',
    description: 'さまざまなエネルギーと環境との関係を学びましょう',
    difficulty: 3,
    duration: 45,
    points: 250,
  },
] as const;

export function EngineeringLearning() {
  return (
    <BaseLearning
      title="工学"
      description="ものづくりの原理を理解し、創造力と問題解決能力を育みましょう"
      lessons={engineeringLessons}
    />
  );
} 