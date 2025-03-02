import React from 'react';
import { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: number | string;
  unit: string;
  subtext: string;
  color: {
    bg: string;
    text: string;
  };
  theme?: 'default' | 'kids';
};

export const StatCard = React.memo(function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  subtext,
  color,
  theme = 'default'
}: StatCardProps) {
  return (
    <div className={`
      bg-white rounded-3xl shadow-md p-6 
      ${theme === 'kids' ? 'hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1' : ''}
    `}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`
          p-4 ${color.bg} rounded-2xl
          ${theme === 'kids' ? 'shadow-sm' : ''}
        `}>
          <Icon className={`h-8 w-8 ${color.text}`} />
        </div>
        <h3 className="font-bold text-xl text-gray-900">{title}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-5xl font-bold ${color.text}`}>{value}</span>
        <span className="text-xl text-gray-600">{unit}</span>
      </div>
      <p className="text-lg text-gray-500 mt-3">{subtext}</p>
    </div>
  );
}); 