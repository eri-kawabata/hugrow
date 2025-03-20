import React from 'react';
import { BaseLearning } from './BaseLearning';
import type { Lesson } from './BaseLearning';
import { Monitor, Code, Globe, Cpu, Lightbulb } from 'lucide-react';

export const technologyLessons: readonly Lesson[] = [
  {
    id: 'tech-1',
    title: 'パソコンとなかよし',
    description: 'パソコンってどんなおともだち？いっしょにみてみよう！',
    difficulty: 1,
    duration: 15,
    points: 120,
    icon: Monitor,
    color: 'from-blue-400 to-purple-400'
  },
  {
    id: 'tech-2',
    title: 'プログラミングであそぼう',
    description: 'たのしいゲームをつくってみよう！',
    difficulty: 1,
    duration: 20,
    points: 150,
    icon: Code,
    color: 'from-green-400 to-blue-400'
  },
  {
    id: 'tech-3',
    title: 'インターネットのせかい',
    description: 'インターネットでできることをたんけんしよう！',
    difficulty: 2,
    duration: 20,
    points: 180,
    icon: Globe,
    color: 'from-yellow-400 to-orange-400'
  },
  {
    id: 'tech-4',
    title: 'デジタルでものづくり',
    description: 'パソコンでじぶんだけのおもちゃをつくろう！',
    difficulty: 2,
    duration: 25,
    points: 200,
    icon: Lightbulb,
    color: 'from-pink-400 to-red-400'
  },
  {
    id: 'tech-5',
    title: 'ロボットとあそぼう',
    description: 'かしこいロボットとなかよくなろう！',
    difficulty: 2,
    duration: 25,
    points: 250,
    icon: Cpu,
    color: 'from-purple-400 to-indigo-400'
  },
] as const;

export function TechnologyLearning() {
  return (
    <BaseLearning
      title="テクノロジー"
      description="パソコンやロボットとなかよくなって、たのしくまなぼう！"
      lessons={technologyLessons}
      gradientColors={{
        from: '#60a5fa',
        via: '#818cf8',
        to: '#6366f1'
      }}
    />
  );
} 