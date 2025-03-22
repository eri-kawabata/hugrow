import { 
  Microscope, 
  Cpu, 
  Wrench, 
  Palette, 
  Calculator,
  Beaker,
  Binary,
  Cog,
  PaintBucket,
  Plus
} from 'lucide-react';
import { Monitor, Code, Shield, Smartphone } from 'lucide-react';
import { Settings, Hammer, Ruler } from 'lucide-react';
import { Music, Camera, Theater } from 'lucide-react';
import { Shapes, Clock, Scale } from 'lucide-react';

export type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  points: number;
  icon: any;
};

export const scienceLessons: Lesson[] = [
  {
    id: 'science_1',
    title: 'しぜんかんさつ',
    description: 'まわりのしぜんをかんさつしよう',
    difficulty: 'easy',
    duration: 15,
    points: 100,
    icon: Microscope
  },
  {
    id: 'science-2',
    title: "みずのふしぎ",
    description: "みずのせいしつをじっけんでたしかめよう",
    difficulty: 'medium',
    duration: 25,
    points: 120,
    icon: Beaker
  },
  {
    id: 'science-3',
    title: "ぶつりのせかい",
    description: "じしゃくやでんきのふしぎをしらべよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Binary
  },
  {
    id: 'science-4',
    title: "おんどとエネルギー",
    description: "あたたかさのひみつをさぐってみよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Cog
  }
];

export const technologyLessons: Lesson[] = [
  {
    id: 'technology_1',
    title: 'コンピュータのしくみ',
    description: 'コンピュータのきほんをまなぼう',
    difficulty: 'easy',
    duration: 20,
    points: 100,
    icon: Cpu
  },
  {
    id: 'tech-2',
    title: "プログラミングのきほん",
    description: "かんたんなプログラムをつくってみよう",
    difficulty: 'medium',
    duration: 25,
    points: 120,
    icon: Code
  },
  {
    id: 'tech-3',
    title: "あんぜんなインターネット",
    description: "インターネットをあんぜんにつかうほうほう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Shield
  },
  {
    id: 'tech-4',
    title: "スマートデバイス",
    description: "スマートフォンやタブレットのひみつをしろう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Smartphone
  }
];

export const engineeringLessons: Lesson[] = [
  {
    id: 'engineering_1',
    title: 'ものづくりのきそ',
    description: 'かんたんなものづくりをしよう',
    difficulty: 'easy',
    duration: 25,
    points: 100,
    icon: Wrench
  },
  {
    id: 'eng-2',
    title: "きかいのしくみ",
    description: "かんたんなきかいのしくみをしらべてみよう",
    difficulty: 'medium',
    duration: 25,
    points: 120,
    icon: Settings
  },
  {
    id: 'eng-3',
    title: "ものづくりのきそ",
    description: "じぶんでかんたんなものをつくってみよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Hammer
  },
  {
    id: 'eng-4',
    title: "せっけい入門",
    description: "アイデアをかたちにするほうほうをまなぼう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Ruler
  }
];

export const artLessons: Lesson[] = [
  {
    id: 'art_1',
    title: 'えをかこう',
    description: 'じぶんのすきなものをかいてみよう',
    difficulty: 'easy',
    duration: 30,
    points: 100,
    icon: Palette
  },
  {
    id: 'art-2',
    title: "おんがくをつくろう",
    description: "リズムやメロディをつくってみよう",
    difficulty: 'medium',
    duration: 25,
    points: 120,
    icon: Music
  },
  {
    id: 'art-3',
    title: "しゃしんをとろう",
    description: "きれいなしゃしんのとりかたをまなぼう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Camera
  },
  {
    id: 'art-4',
    title: "げきをつくろう",
    description: "おはなしをつくってえんじてみよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Theater
  }
];

export const mathLessons: Lesson[] = [
  {
    id: 'math_1',
    title: 'かずをかぞえよう',
    description: 'かずのかぞえかたをまなぼう',
    difficulty: 'easy',
    duration: 15,
    points: 100,
    icon: Calculator
  },
  {
    id: 'math-2',
    title: "ずけいのなまえ",
    description: "いろいろなかたちのなまえをおぼえよう",
    difficulty: 'medium',
    duration: 25,
    points: 120,
    icon: Shapes
  },
  {
    id: 'math-3',
    title: "とけいのよみかた",
    description: "じかんのよみかたをれんしゅうしよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Clock
  },
  {
    id: 'math-4',
    title: "おおきさくらべ",
    description: "ながさやおもさをくらべてみよう",
    difficulty: 'hard',
    duration: 30,
    points: 150,
    icon: Scale
  }
];

export const allLessons = [
  ...scienceLessons,
  ...technologyLessons,
  ...engineeringLessons,
  ...artLessons,
  ...mathLessons
]; 