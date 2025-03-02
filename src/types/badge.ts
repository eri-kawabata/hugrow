import { LucideIcon, Star, Medal, Trophy, Crown, Rocket, Lightbulb, Palette } from 'lucide-react';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: 'learning' | 'challenge' | 'creation' | 'achievement';
  level: 1 | 2 | 3;
  condition: string;
}

// バッジの定義
export const BADGES: Badge[] = [
  // 学習カテゴリー
  {
    id: 'science-explorer',
    title: 'かがくたんけんか',
    description: 'かがくのせかいをたんけんしたよ！',
    icon: Lightbulb,
    color: 'bg-blue-500',
    category: 'learning',
    level: 1,
    condition: 'COMPLETE_FIRST_SCIENCE'
  },
  {
    id: 'math-genius',
    title: 'さんすうの天才',
    description: 'さんすうのもんだいを10かいとけた！',
    icon: Star,
    color: 'bg-green-500',
    category: 'learning',
    level: 2,
    condition: 'SOLVE_10_MATH_PROBLEMS'
  },
  // 他のバッジ...
]; 