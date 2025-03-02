import { useMemo } from 'react';
import { Heart, TrendingUp, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { SELResponse } from '../../lib/types';

interface EmotionSectionProps {
  responses: SELResponse[];
}

interface EmotionStats {
  emotion: string;
  count: number;
  trend: number;
  averageIntensity: number;
}

function EmotionCard({ emotion, count, trend, averageIntensity }: EmotionStats) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">{emotion}</h3>
        <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-600">回数</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{averageIntensity.toFixed(1)}</p>
          <p className="text-sm text-gray-600">平均強度</p>
        </div>
      </div>
    </div>
  );
}

function EmotionTimeline({ responses }: { responses: SELResponse[] }) {
  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div key={response.id} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-medium text-gray-900">{response.emotion}</span>
            </div>
            <span className="text-sm text-gray-500">
              {format(new Date(response.created_at), 'M月d日 HH:mm', { locale: ja })}
            </span>
          </div>
          {response.note && (
            <p className="text-gray-600 text-sm mt-2">{response.note}</p>
          )}
          {response.sel_feedback && response.sel_feedback.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <MessageCircle className="h-4 w-4" />
                <span>フィードバック</span>
              </div>
              <p className="text-sm text-gray-600">{response.sel_feedback[0].feedback_text}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EmotionSection({ responses }: EmotionSectionProps) {
  const stats = useMemo(() => {
    const emotionMap = new Map<string, EmotionStats>();
    
    responses.forEach(response => {
      const stats = emotionMap.get(response.emotion) || {
        emotion: response.emotion,
        count: 0,
        trend: 0,
        averageIntensity: 0,
        totalIntensity: 0
      };
      
      stats.count++;
      stats.totalIntensity += response.intensity;
      stats.averageIntensity = stats.totalIntensity / stats.count;
      
      emotionMap.set(response.emotion, stats);
    });
    
    return Array.from(emotionMap.values());
  }, [responses]);

  return (
    <section className="bg-gray-50 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">感情分析</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">感情の傾向</h3>
          <div className="space-y-4">
            {stats.map((stat) => (
              <EmotionCard key={stat.emotion} {...stat} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近の記録</h3>
          <EmotionTimeline responses={responses} />
        </div>
      </div>
    </section>
  );
} 