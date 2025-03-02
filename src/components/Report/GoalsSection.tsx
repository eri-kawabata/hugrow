import { useMemo } from 'react';
import { Target, Brain, Book, Clock, Award } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

function GoalCard({ title, current, target, unit, icon, color }: GoalCardProps) {
  const percentage = Math.min(100, (current / target) * 100);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: color }}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              pathColor: color,
              textColor: color,
              trailColor: '#f3f4f6'
            })}
          />
        </div>
        <div>
          <p className="text-sm text-gray-600">
            現在: {current}{unit}
          </p>
          <p className="text-sm text-gray-600">
            目標: {target}{unit}
          </p>
        </div>
      </div>
    </div>
  );
}

export function GoalsSection() {
  const goals = useMemo(() => [
    {
      title: '週間学習時間',
      current: 12,
      target: 15,
      unit: '時間',
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      color: '#3b82f6'
    },
    {
      title: '月間チャレンジ',
      current: 8,
      target: 12,
      unit: '個',
      icon: <Target className="h-5 w-5 text-green-600" />,
      color: '#22c55e'
    },
    {
      title: '教科別目標',
      current: 4,
      target: 5,
      unit: '科目',
      icon: <Book className="h-5 w-5 text-purple-600" />,
      color: '#9333ea'
    },
    {
      title: '獲得バッジ',
      current: 3,
      target: 5,
      unit: '個',
      icon: <Award className="h-5 w-5 text-yellow-600" />,
      color: '#eab308'
    }
  ], []);

  return (
    <section className="bg-gray-50 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">学習目標</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <GoalCard key={goal.title} {...goal} />
        ))}
      </div>
    </section>
  );
} 