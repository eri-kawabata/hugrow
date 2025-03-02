import { useMemo } from 'react';
import { Award } from 'lucide-react';
import type { UserAchievement } from '../../lib/types';

interface AchievementSectionProps {
  achievements: UserAchievement[];
}

export function AchievementSection({ achievements }: AchievementSectionProps) {
  const sortedAchievements = useMemo(() => 
    [...achievements]
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 4)
  , [achievements]);

  return (
    <section className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <Award className="h-6 w-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">最近の実績</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors"
          >
            <AchievementCard achievement={achievement} />
          </div>
        ))}
      </div>
    </section>
  );
} 