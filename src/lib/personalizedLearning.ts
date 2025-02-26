import type { LearningStyle, LearningPreference, PersonalizedTip } from './types';

export const learningStyleTips: PersonalizedTip[] = [
  {
    id: 'visual-1',
    title: '図や絵を使って理解を深めよう',
    description: '数式や概念を図や絵に置き換えて考えてみましょう。視覚的な理解が得意なあなたには効果的です。',
    learning_style: 'visual_score',
    subject: 'mathematics'
  },
  {
    id: 'auditory-1',
    title: '声に出して学ぼう',
    description: '問題を声に出して読んだり、解き方を説明したりしてみましょう。聴覚的な学習が得意なあなたにぴったりです。',
    learning_style: 'auditory_score',
    subject: 'science'
  },
  {
    id: 'kinesthetic-1',
    title: '実際に手を動かして体験しよう',
    description: '実験や工作を通じて、体験的に学んでみましょう。体を動かしながらの学習が効果的です。',
    learning_style: 'kinesthetic_score',
    subject: 'engineering'
  }
];

export function getPersonalizedTips(
  learningStyle: LearningStyle,
  preferences: LearningPreference
): PersonalizedTip[] {
  // 学習スタイルのスコアが最も高い方法を特定
  const scores = {
    visual_score: learningStyle.visual_score,
    auditory_score: learningStyle.auditory_score,
    kinesthetic_score: learningStyle.kinesthetic_score
  };

  const dominantStyle = Object.entries(scores).reduce((a, b) => 
    scores[a as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b[0]
  );

  // 好みの科目に関連するヒントをフィルタリング
  return learningStyleTips.filter(tip => 
    tip.learning_style === dominantStyle &&
    preferences.preferred_subjects.includes(tip.subject)
  );
}

export function getDifficultyAdjustment(
  preferences: LearningPreference,
  currentScore: number
): 'easier' | 'harder' | 'maintain' {
  const threshold = preferences.learning_pace === 'fast' ? 0.8 : 0.7;
  
  if (currentScore < threshold * 100) {
    return 'easier';
  } else if (currentScore > 0.9 * 100) {
    return 'harder';
  }
  
  return 'maintain';
}

export function generatePersonalizedFeedback(
  learningStyle: LearningStyle,
  score: number
): string {
  const dominantStyle = Object.entries({
    visual_score: learningStyle.visual_score,
    auditory_score: learningStyle.auditory_score,
    kinesthetic_score: learningStyle.kinesthetic_score
  }).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  const feedbackTemplates = {
    visual_score: [
      '図や絵を使ってよく理解できていますね！',
      'もっと視覚的な要素を取り入れてみましょう。',
      'グラフや図を描いて考えてみるのがおすすめです。'
    ],
    auditory_score: [
      '声に出して考えるのが効果的ですね！',
      '友達と話し合いながら学習するのがおすすめです。',
      '音声メモを活用してみましょう。'
    ],
    kinesthetic_score: [
      '実践的な学習がとても効果的です！',
      'もっと手を動かして体験してみましょう。',
      '実験や工作を通じて理解を深めましょう。'
    ]
  };

  const templates = feedbackTemplates[dominantStyle as keyof typeof feedbackTemplates];
  const feedbackIndex = Math.floor(score / 34); // スコアに応じてフィードバックを選択

  return templates[Math.min(feedbackIndex, templates.length - 1)];
}