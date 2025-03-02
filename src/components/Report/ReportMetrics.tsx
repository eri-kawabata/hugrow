import { useMemo } from 'react';
import { TrendingUp, Clock, Award, Target } from 'lucide-react';
import type { ReportData } from '../../lib/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-50 rounded-lg">
            {icon}
          </div>
          <h3 className="ml-3 text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp 
              className={`h-4 w-4 ${change.type === 'decrease' ? 'rotate-180' : ''}`}
            />
            <span className="ml-1">{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

interface ReportMetricsProps {
  data: ReportData;
}

export function ReportMetrics({ data }: ReportMetricsProps) {
  const metrics = useMemo(() => [
    {
      title: '総学習時間',
      value: `${Math.floor(data.stats.total_study_time / 60)}時間${data.stats.total_study_time % 60}分`,
      change: {
        value: 12, // 仮の値、APIから取得する必要あり
        type: 'increase' as const
      },
      icon: <Clock className="h-5 w-5 text-indigo-600" />
    },
    {
      title: '獲得ポイント',
      value: data.stats.total_points.toLocaleString(),
      icon: <Award className="h-5 w-5 text-yellow-600" />
    },
    {
      title: '目標達成率',
      value: `${data.stats.next_badge_progress}%`,
      icon: <Target className="h-5 w-5 text-green-600" />
    }
  ], [data.stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
} 