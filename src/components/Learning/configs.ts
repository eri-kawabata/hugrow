import { Microscope, Cpu, Wrench, Palette, Calculator } from 'lucide-react';
import type { SubjectConfig } from './SubjectLearning';

export const subjectConfigs: SubjectConfig = {
  science: {
    title: 'りか',
    description: 'しぜんのふしぎをたんけんしよう！',
    icon: <Microscope className="h-8 w-8 text-indigo-600" />,
    lessons: [
      {
        id: 'science_1',
        title: 'どうぶつとおともだち',
        description: 'かわいいどうぶつたちのせかいをのぞいてみよう',
        difficulty: 'easy',
        duration: '10ぷん',
        points: 100
      },
      {
        id: 'science_2',
        title: 'おはながすくすく',
        description: 'たねをうえて、おはなをそだてよう',
        difficulty: 'easy',
        duration: '15ぷん',
        points: 120
      },
      {
        id: 'science_3',
        title: 'おてんきマスター',
        description: 'あめやくもやにじのひみつをしろう',
        difficulty: 'medium',
        duration: '15ぷん',
        points: 150
      },
      {
        id: 'science_4',
        title: 'うちゅうりょこう',
        description: 'おつきさまやほしをみてみよう',
        difficulty: 'medium',
        duration: '10ぷん',
        points: 180
      },
      {
        id: 'science_5',
        title: 'ふしぎなじっけん',
        description: 'たのしいじっけんをしてみよう',
        difficulty: 'hard',
        duration: '20ぷん',
        points: 200
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