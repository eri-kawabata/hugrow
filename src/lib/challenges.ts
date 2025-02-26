import { Brain, Camera, Palette, Beaker, Calculator } from 'lucide-react';

export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  bonus: number;
  icon: typeof Brain;
  category: 'art' | 'science' | 'math' | 'technology';
};

export const challenges: DailyChallenge[] = [
  {
    id: 'color-numbers',
    title: '数と色のハーモニー',
    description: '数と色を組み合わせて、あなただけの特別な作品を作ろう！数字に色をつけて、新しい表現方法を見つけましょう。',
    points: 150,
    bonus: 50,
    icon: Calculator,
    category: 'math'
  },
  {
    id: 'nature-patterns',
    title: '自然のパターンを探そう',
    description: '自然の中から見つけた面白い形や模様を写真に撮って、その形が生まれた理由を考えてみよう！科学と芸術の不思議な出会いを探検しましょう。',
    points: 120,
    bonus: 30,
    icon: Camera,
    category: 'science'
  },
  {
    id: 'emotion-colors',
    title: '感情の色を描こう',
    description: '今日の気分を色で表現してみよう！暖かい色、冷たい色、明るい色、暗い色を使って、あなたの感情を絵にしましょう。',
    points: 100,
    bonus: 40,
    icon: Palette,
    category: 'art'
  },
  {
    id: 'science-experiment',
    title: '台所で科学実験',
    description: '身近な材料で簡単な科学実験に挑戦！重曹とお酢を使って、化学反応の不思議を観察してみましょう。',
    points: 130,
    bonus: 45,
    icon: Beaker,
    category: 'science'
  }
];

export function getTodaysChallenge(): DailyChallenge {
  // 今日の日付をシードとして使用
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // シードを使用してランダムなインデックスを生成
  const index = seed % challenges.length;
  
  return challenges[index];
}