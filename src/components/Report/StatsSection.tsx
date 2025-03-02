import { useMemo } from 'react';
import { Clock, Award, Zap, Target, TrendingUp } from 'lucide-react';
import type { ReportData } from '../../lib/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: number;
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}

interface StatsSectionProps {
  data: ReportData;
}

export function StatsSection({ data }: StatsSectionProps) {
  const stats = useMemo(() => [
    {
      title: '総学習時間',
      value: `${Math.floor(data.stats.total_study_time / 60)}時間${data.stats.total_study_time % 60}分`,
      icon: <Clock className="h-5 w-5 text-indigo-600" />,
      description: `今週: ${Math.floor(data.stats.last_week_study_time / 60)}時間${data.stats.last_week_study_time % 60}分`,
      trend: 12 // 仮の値、APIから取得する必要あり
    },
    {
      title: '獲得ポイント',
      value: data.stats.total_points.toLocaleString(),
      icon: <Award className="h-5 w-5 text-yellow-600" />,
      description: '次のバッジまで: あと100ポイント'
    },
    {
      title: '現在の連続学習',
      value: `${data.streak?.current_streak || 0}日`,
      icon: <Zap className="h-5 w-5 text-orange-600" />,
      description: `最長記録: ${data.streak?.longest_streak || 0}日`
    },
    {
      title: '目標達成率',
      value: '85%',
      icon: <Target className="h-5 w-5 text-green-600" />,
      description: '月間目標まで: あと3個'
    }
  ], [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
} 