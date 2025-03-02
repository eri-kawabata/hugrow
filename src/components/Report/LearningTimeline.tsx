import { useMemo } from 'react';
import { Timeline } from './Timeline';
import type { UserLearningActivity } from '../../lib/types';

interface LearningTimelineProps {
  activities: UserLearningActivity[];
}

export function LearningTimeline({ activities }: LearningTimelineProps) {
  const timelineItems = useMemo(() => 
    activities.map(activity => ({
      id: `${activity.activity_type}-${activity.activity_date}`,
      date: new Date(activity.activity_date),
      title: activity.activity_type === 'achievement' ? '実績獲得' : '感情記録',
      description: activity.activity_description,
      icon: activity.icon_url
    }))
  , [activities]);

  return (
    <section className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">最近の活動</h2>
      <Timeline items={timelineItems} />
    </section>
  );
} 