import { useState, useEffect } from 'react';
import { Palette, Beaker, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  progress: number;
  icon: LucideIcon;
  color: string;
  textColor: string;
  borderColor: string;
  path: string;
}

const ALL_RECOMMENDATIONS: Lesson[] = [
  {
    id: 'art-1',
    title: '色の組み合わせを学ぼう',
    description: '今日は補色について学びます。オレンジと青を使って絵を描いてみましょう。',
    icon: Palette,
    color: 'bg-pink-100',
    textColor: 'text-pink-600',
    borderColor: 'hover:border-pink-200',
    path: '/learning/arts',
    progress: 65,
    thumbnail_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'science-1',
    title: '科学実験に挑戦！',
    description: '水の性質について実験します。氷を溶かして状態変化を観察しよう。',
    icon: Beaker,
    color: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'hover:border-blue-200',
    path: '/learning/science',
    progress: 45,
    thumbnail_url: 'https://images.unsplash.com/photo-1532634993-15f421e42ec0?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'math-1',
    title: '数字のパターンを見つけよう',
    description: '身の回りにある数字のパターンを探して、規則性を見つけましょう。',
    icon: Calculator,
    color: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'hover:border-green-200',
    path: '/learning/mathematics',
    progress: 30,
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
  }
];

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Lesson[]>([]);

  useEffect(() => {
    // 今日の日付をシードとして使用して、毎日同じ学習を表示
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // シードを使用してランダムに並び替え
    const shuffled = [...ALL_RECOMMENDATIONS].sort(() => {
      const random = Math.sin(seed) * 10000;
      return random - Math.floor(random);
    });

    // 最初の3つを表示
    setRecommendations(shuffled.slice(0, 3));
  }, []);

  return { recommendations };
} 