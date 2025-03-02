import { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Brain, TrendingUp, MessageCircle } from 'lucide-react';
import type { SELResponse } from '../../lib/types';
import { useSELAnalytics } from '../../hooks/useSELAnalytics';

interface SELAnalyticsViewProps {
  responses: SELResponse[];
}

export function SELAnalyticsView({ responses }: SELAnalyticsViewProps) {
  const { emotionTrends, weeklyMood, insights } = useSELAnalytics(responses);

  // 週間ムードのグラフデータ
  const weeklyMoodData = useMemo(() => ({
    labels: weeklyMood.map(w => format(new Date(w.date), 'M/d', { locale: ja })),
    datasets: [
      {
        label: '感情の強度',
        data: weeklyMood.map(w => w.averageIntensity),
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa20',
        fill: true,
        tension: 0.4
      }
    ]
  }), [weeklyMood]);

  // 感情トレンドのグラフデータ
  const emotionTrendData = useMemo(() => ({
    labels: emotionTrends.map(e => e.emotion),
    datasets: [
      {
        label: '出現回数',
        data: emotionTrends.map(e => e.count),
        backgroundColor: emotionTrends.map(e => 
          e.trend > 0 ? '#86efac' : '#fca5a5'
        )
      }
    ]
  }), [emotionTrends]);

  return (
    <div className="space-y-8">
      {/* 週間ムードグラフ */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">週間ムードの変化</h3>
        </div>
        <div className="h-64">
          <Line 
            data={weeklyMoodData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 10
                }
              }
            }}
          />
        </div>
      </section>

      {/* 感情トレンド */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-medium text-gray-900">感情の傾向</h3>
        </div>
        <div className="h-64">
          <Bar 
            data={emotionTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </section>

      {/* インサイト */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-medium text-gray-900">感情の分析</h3>
        </div>
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li 
              key={index}
              className="flex items-start gap-3 text-gray-600"
            >
              <span className="text-green-500">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
} 