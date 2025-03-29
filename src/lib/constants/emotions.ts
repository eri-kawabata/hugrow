export const emotions = [
  { 
    name: 'とてもうれしい', 
    color: '#FCD34D',
    intensity: 5,
    description: '最高の気分！',
    icon: '😄'
  },
  { 
    name: 'うれしい', 
    color: '#F472B6',
    intensity: 4,
    description: '良い気分',
    icon: '😊'
  },
  { 
    name: 'ふつう', 
    color: '#A78BFA',
    intensity: 3,
    description: '普通の気分',
    icon: '😐'
  },
  { 
    name: 'すこしかなしい', 
    color: '#60A5FA',
    intensity: 2,
    description: '少し落ち込んでいる',
    icon: '😕'
  },
  { 
    name: 'かなしい', 
    color: '#818CF8',
    intensity: 1,
    description: '悲しい気持ち',
    icon: '😭'
  },
] as const;

export type EmotionType = typeof emotions[number];
export type EmotionName = EmotionType['name']; 