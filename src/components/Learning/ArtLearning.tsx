import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';
import { Palette, Brush, Camera, Play, Heart } from 'lucide-react';

export const artLessons: readonly Lesson[] = [
  {
    id: 'art-1',
    title: 'いろあそび',
    description: 'きれいないろをまぜてあそぼう！',
    difficulty: 1,
    duration: 15,
    points: 100,
    icon: Palette,
    color: 'from-pink-400 to-purple-400'
  },
  {
    id: 'art-2',
    title: 'おえかきタイム',
    description: 'タブレットでたのしくおえかき！',
    difficulty: 1,
    duration: 20,
    points: 150,
    icon: Brush,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'art-3',
    title: 'しゃしんであそぼう',
    description: 'すてきなしゃしんをとってみよう！',
    difficulty: 2,
    duration: 20,
    points: 180,
    icon: Camera,
    color: 'from-yellow-400 to-orange-400'
  },
  {
    id: 'art-4',
    title: 'うごくえをつくろう',
    description: 'パラパラまんがをつくってみよう！',
    difficulty: 2,
    duration: 20,
    points: 200,
    icon: Play,
    color: 'from-green-400 to-emerald-400'
  },
  {
    id: 'art-5',
    title: 'きもちをえにかこう',
    description: 'うれしいきもち、たのしいきもちをえにしよう！',
    difficulty: 2,
    duration: 20,
    points: 250,
    icon: Heart,
    color: 'from-red-400 to-pink-400'
  },
] as const;

export function ArtLearning() {
  return (
    <BaseLearning
      title="おえかき"
      description="えをかいて、たのしくそうぞうしよう！"
      lessons={artLessons}
      gradientColors={{
        from: '#ec4899',
        via: '#8b5cf6',
        to: '#6366f1'
      }}
    />
  );
} 