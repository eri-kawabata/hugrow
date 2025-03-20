import { Microscope, Cpu, Wrench, Palette, Calculator, Bird, Flower2, Cloud, Globe2, TestTube } from 'lucide-react';
import type { SubjectConfig } from './SubjectLearning';

export const subjectConfigs: SubjectConfig = {
  science: {
    title: 'かがくのせかい',
    description: 'しぜんのふしぎをたんけんしよう！',
    icon: <TestTube className="h-6 w-6 text-blue-500" />,
    gradientColors: {
      from: '#22c55e',
      via: '#3b82f6',
      to: '#6366f1'
    },
    lessons: [
      {
        id: 'science-1',
        title: 'どうぶつとなかよし',
        description: 'いろいろなどうぶつのせいかつをしらべてみよう',
        difficulty: 'easy',
        duration: '15分',
        points: 100,
        icon: <Bird className="h-6 w-6" />,
        color: 'from-orange-400 to-red-400'
      },
      {
        id: 'science-2',
        title: 'しょくぶつのひみつ',
        description: 'たねからめがでて、おおきくそだつしょくぶつのふしぎ',
        difficulty: 'easy',
        duration: '15分',
        points: 100,
        icon: <Flower2 className="h-6 w-6" />,
        color: 'from-pink-400 to-rose-400'
      },
      {
        id: 'science-3',
        title: 'てんきのへんか',
        description: 'あめやゆきのひみつをしらべよう',
        difficulty: 'medium',
        duration: '20分',
        points: 150,
        icon: <Cloud className="h-6 w-6" />,
        color: 'from-blue-400 to-cyan-400'
      },
      {
        id: 'science-4',
        title: 'ちきゅうのふしぎ',
        description: 'わたしたちのちきゅうについてまなぼう',
        difficulty: 'medium',
        duration: '20分',
        points: 150,
        icon: <Globe2 className="h-6 w-6" />,
        color: 'from-indigo-400 to-purple-400'
      },
      {
        id: 'science-5',
        title: 'ふしぎなじっけん',
        description: 'かんたんなじっけんでかがくのふしぎをたしかめよう',
        difficulty: 'hard',
        duration: '25分',
        points: 200,
        icon: <TestTube className="h-6 w-6" />,
        color: 'from-green-400 to-emerald-400'
      }
    ]
  },
  technology: {
    title: 'ぎじゅつ',
    description: 'たのしくあそびながらまなぼう！',
    icon: <Cpu className="h-8 w-8 text-indigo-600" />,
    lessons: [
      {
        id: 'tech_1',
        title: 'パソコンとなかよし',
        description: 'パソコンでなにができるかな？',
        difficulty: 'easy',
        duration: '10ぷん',
        points: 100
      },
      {
        id: 'tech_2',
        title: 'おえかきプログラム',
        description: 'パソコンでおえかきをしよう',
        difficulty: 'medium',
        duration: '15ぷん',
        points: 150
      },
      {
        id: 'tech_3',
        title: 'ロボットあそび',
        description: 'かんたんなロボットをうごかそう',
        difficulty: 'hard',
        duration: '20ぷん',
        points: 200
      }
    ]
  },
  engineering: {
    title: 'こうさく',
    description: 'てづくりをたのしもう！',
    icon: <Wrench className="h-8 w-8 text-indigo-600" />,
    lessons: [
      {
        id: 'eng_1',
        title: 'かみこうさく',
        description: 'かみでいろいろなものをつくろう',
        difficulty: 'easy',
        duration: '15ぷん',
        points: 100
      },
      {
        id: 'eng_2',
        title: 'ブロックあそび',
        description: 'ブロックでたてものをつくろう',
        difficulty: 'medium',
        duration: '20ぷん',
        points: 150
      },
      {
        id: 'eng_3',
        title: 'くうきでっぽう',
        description: 'ペットボトルでくうきでっぽうをつくろう',
        difficulty: 'hard',
        duration: '25ぷん',
        points: 200
      }
    ]
  },
  art: {
    title: 'おえかき',
    description: 'たのしくおえかきしよう！',
    icon: <Palette className="h-8 w-8 text-indigo-600" />,
    lessons: [
      {
        id: 'art_1',
        title: 'クレヨンおえかき',
        description: 'クレヨンでいろんなものをかこう',
        difficulty: 'easy',
        duration: '15ぷん',
        points: 100
      },
      {
        id: 'art_2',
        title: 'いろあそび',
        description: 'すてきないろをつくってみよう',
        difficulty: 'medium',
        duration: '20ぷん',
        points: 150
      },
      {
        id: 'art_3',
        title: 'ゆびえのぐ',
        description: 'ゆびえのぐでたのしくかこう',
        difficulty: 'hard',
        duration: '25ぷん',
        points: 200
      }
    ]
  },
  math: {
    title: 'すうじ',
    description: 'すうじとなかよくなろう！',
    icon: <Calculator className="h-8 w-8 text-indigo-600" />,
    lessons: [
      {
        id: 'math_1',
        title: 'すうじあそび',
        description: '1から10までのすうじをおぼえよう',
        difficulty: 'easy',
        duration: '10ぷん',
        points: 100
      },
      {
        id: 'math_2',
        title: 'たしざん・ひきざん',
        description: 'たのしくけいさんしよう',
        difficulty: 'medium',
        duration: '15ぷん',
        points: 150
      },
      {
        id: 'math_3',
        title: 'かたちあそび',
        description: 'まるやさんかくをみつけよう',
        difficulty: 'hard',
        duration: '20ぷん',
        points: 200
      }
    ]
  }
}; 