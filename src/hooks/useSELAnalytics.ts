import { useMemo } from 'react';
import { SELResponse } from '../lib/types';

interface SELAnalytics {
  emotionTrends: {
    emotion: string;
    count: number;
    trend: number;
    averageIntensity: number;
  }[];
  weeklyMood: {
    date: string;
    averageIntensity: number;
    dominantEmotion: string;
  }[];
  insights: string[];
}

export function useSELAnalytics(responses: SELResponse[]): SELAnalytics {
  return useMemo(() => {
    // 感情トレンドの分析
    const emotionTrends = analyzeEmotionTrends(responses);
    
    // 週間ムードの計算
    const weeklyMood = calculateWeeklyMood(responses);
    
    // インサイトの生成
    const insights = generateInsights(emotionTrends, weeklyMood);

    return {
      emotionTrends,
      weeklyMood,
      insights
    };
  }, [responses]);
} 