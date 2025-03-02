import {
  Beaker, Magnet, Zap, Music,
  Gamepad, Film,
  Bot, Construction, Cog,
  Palette, Shapes, Brush,
  Plus, Minus, Square
} from 'lucide-react';
import type { LearningCategory } from '../types/learning';

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    id: 'science',
    title: 'かがく',
    description: 'たのしくじっけんしながら、ふしぎをみつけよう！',
    path: '/learning/science',
    topics: [
      {
        id: 'magnet',
        title: 'じしゃくのふしぎ',
        description: 'じしゃくであそびながら、ちからについてまなぼう！',
        icon: Magnet,
        path: '/learning/science/magnet',
        color: 'bg-blue-500',
        level: 1,
        duration: '15ぷん',
        items: ['じしゃく', 'クリップ', 'かみ'],
        objectives: [
          'じしゃくのせいしつをしる',
          'じしゃくのつよさをためす',
          'あたらしいじっけんをかんがえる'
        ],
      },
      // 他の科学トピック
    ],
  },
  {
    id: 'technology',
    title: 'テクノロジー',
    description: 'コンピューターであそぼう！',
    path: '/learning/technology',
    topics: [
      {
        id: 'game',
        title: 'ゲームをつくろう',
        description: 'かんたんなブロックでプログラミング！',
        icon: Gamepad,
        path: '/learning/technology/game',
        color: 'bg-purple-500',
        level: 1,
        duration: '20ぷん',
        items: ['ブロック', 'キャラクター', 'おと'],
      },
      // 他のテクノロジートピック
    ],
  },
  {
    id: 'engineering',
    title: 'ものづくり',
    description: 'つくってためそう！',
    path: '/learning/engineering',
    topics: [
      {
        id: 'robot',
        title: 'ロボットづくり',
        description: 'かんたんなロボットをつくってうごかそう！',
        icon: Bot,
        path: '/learning/engineering/robot',
        color: 'bg-orange-500',
        level: 2,
        duration: '30ぷん',
        items: ['モーター', 'でんち', 'ダンボール'],
      },
      {
        id: 'bridge',
        title: 'はしをつくる',
        description: 'じょうぶなはしのひみつをしろう！',
        icon: Construction,
        path: '/learning/engineering/bridge',
        color: 'bg-amber-500',
        level: 1,
        duration: '20ぷん',
        items: ['わりばし', 'セロハンテープ', 'おもり'],
      },
      // 他のエンジニアリングトピック
    ],
  },
  {
    id: 'art',
    title: 'アート',
    description: 'そうぞうりょくをはっきしよう！',
    path: '/learning/art',
    topics: [
      {
        id: 'drawing',
        title: 'おえかき',
        description: 'すきなものをかいてみよう！',
        icon: Brush,
        path: '/learning/art/drawing',
        color: 'bg-pink-500',
        level: 1,
        duration: '20ぷん',
        items: ['えんぴつ', 'クレヨン', 'かみ'],
      },
      // 他のアートトピック
    ],
  },
  {
    id: 'math',
    title: 'さんすう',
    description: 'かずとなかよくなろう！',
    path: '/learning/math',
    topics: [
      {
        id: 'addition',
        title: 'たしざん',
        description: 'たのしくたしざんれんしゅう！',
        icon: Plus,
        path: '/learning/math/addition',
        color: 'bg-green-500',
        level: 1,
        duration: '10ぷん',
        items: ['すうじカード', 'ブロック', 'ノート'],
      },
      // 他の算数トピック
    ],
  },
];

// カテゴリーIDからカテゴリーを取得するヘルパー関数
export function getCategoryById(categoryId: string): LearningCategory | undefined {
  return LEARNING_CATEGORIES.find(category => category.id === categoryId);
}

// トピックIDからトピックを取得するヘルパー関数
export function getTopicById(categoryId: string, topicId: string) {
  const category = getCategoryById(categoryId);
  return category?.topics.find(topic => topic.id === topicId);
} 