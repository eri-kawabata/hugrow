import { SELResponse } from '../types';
import { subDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface EmotionTrend {
  emotion: string;
  count: number;
  trend: number;
  averageIntensity: number;
}

interface WeeklyMood {
  date: string;
  averageIntensity: number;
  dominantEmotion: string;
}

export function analyzeEmotionTrends(responses: SELResponse[]): EmotionTrend[] {
  const currentPeriod = responses.filter(r => 
    new Date(r.created_at) >= subDays(new Date(), 7)
  );
  const previousPeriod = responses.filter(r => 
    new Date(r.created_at) >= subDays(new Date(), 14) &&
    new Date(r.created_at) < subDays(new Date(), 7)
  );

  const emotions = new Map<string, EmotionTrend>();

  // 現在期間の集計
  currentPeriod.forEach(response => {
    const trend = emotions.get(response.emotion) || {
      emotion: response.emotion,
      count: 0,
      trend: 0,
      averageIntensity: 0,
      totalIntensity: 0
    };

    trend.count++;
    trend.totalIntensity += response.intensity;
    trend.averageIntensity = trend.totalIntensity / trend.count;

    emotions.set(response.emotion, trend);
  });

  // トレンドの計算
  previousPeriod.forEach(response => {
    const trend = emotions.get(response.emotion);
    if (trend) {
      const previousCount = previousPeriod.filter(r => r.emotion === response.emotion).length;
      trend.trend = ((trend.count - previousCount) / previousCount) * 100;
    }
  });

  return Array.from(emotions.values());
}

export function calculateWeeklyMood(responses: SELResponse[]): WeeklyMood[] {
  const weeks = new Map<string, {
    totalIntensity: number;
    emotions: Map<string, number>;
    count: number;
  }>();

  responses.forEach(response => {
    const weekStart = format(
      startOfWeek(new Date(response.created_at), { locale: ja }), 
      'yyyy-MM-dd'
    );

    const week = weeks.get(weekStart) || {
      totalIntensity: 0,
      emotions: new Map(),
      count: 0
    };

    week.totalIntensity += response.intensity;
    week.count++;
    week.emotions.set(
      response.emotion, 
      (week.emotions.get(response.emotion) || 0) + 1
    );

    weeks.set(weekStart, week);
  });

  return Array.from(weeks.entries()).map(([date, data]) => ({
    date,
    averageIntensity: data.totalIntensity / data.count,
    dominantEmotion: Array.from(data.emotions.entries())
      .sort((a, b) => b[1] - a[1])[0][0]
  }));
}

export function generateInsights(
  emotionTrends: EmotionTrend[],
  weeklyMood: WeeklyMood[]
): string[] {
  const insights: string[] = [];

  // 感情の多様性
  const uniqueEmotions = emotionTrends.length;
  if (uniqueEmotions > 5) {
    insights.push('感情表現が豊かで、自己認識が高まっています');
  }

  // 感情の強度
  const highIntensityEmotions = emotionTrends.filter(e => e.averageIntensity > 7);
  if (highIntensityEmotions.length > 0) {
    insights.push(`${highIntensityEmotions.map(e => e.emotion).join('・')}の感情が特に強く表れています`);
  }

  // ムードの変化
  if (weeklyMood.length >= 2) {
    const recentMood = weeklyMood[weeklyMood.length - 1];
    const previousMood = weeklyMood[weeklyMood.length - 2];
    
    if (recentMood.averageIntensity > previousMood.averageIntensity) {
      insights.push('感情の強度が上昇傾向にあります');
    }
  }

  return insights;
} 