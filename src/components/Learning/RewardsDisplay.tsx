import React, { memo } from 'react';
import { Trophy, Star, Award, Medal } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';

const RewardCard = memo(({ 
  title, 
  points, 
  icon: Icon,
  description,
  progress = 100,
}: {
  title: string;
  points: number;
  icon: React.ElementType;
  description: string;
  progress?: number;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-4 flex items-start gap-4">
    <div className="flex-shrink-0">
      <Icon className="w-8 h-8 text-yellow-500" />
    </div>
    <div className="flex-grow">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      {progress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% 達成</p>
        </div>
      )}
    </div>
    <div className="flex-shrink-0 flex items-center gap-1">
      <Star className="w-4 h-4 text-yellow-500" />
      <span className="font-semibold text-gray-900">{points}</span>
    </div>
  </div>
));

RewardCard.displayName = 'RewardCard';

const AchievementIcon = {
  lesson_complete: Trophy,
  quiz_perfect: Star,
  streak: Medal,
  achievement: Award,
} as const;

export function RewardsDisplay({ userId }: { userId: string }) {
  const { rewards, achievements, totalPoints, loading, error } = useRewards(userId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="報酬の読み込みに失敗しました"
        message="報酬データの取得中にエラーが発生しました。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">総獲得ポイント</h2>
            <p className="text-4xl font-bold mt-2">{totalPoints}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">最近の報酬</h2>
        <div className="space-y-4">
          {rewards.slice(0, 5).map(reward => (
            <RewardCard
              key={reward.id}
              title={getRewardTitle(reward.type)}
              points={reward.points}
              icon={AchievementIcon[reward.type]}
              description={getRewardDescription(reward)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">実績</h2>
        <div className="space-y-4">
          {achievements.map(achievement => (
            <RewardCard
              key={achievement.id}
              title={achievement.title}
              points={achievement.requirements.points || 0}
              icon={AchievementIcon[achievement.type as keyof typeof AchievementIcon] || Award}
              description={achievement.description}
              progress={achievement.progress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getRewardTitle(type: string): string {
  switch (type) {
    case 'lesson_complete':
      return 'レッスン完了';
    case 'quiz_perfect':
      return 'クイズ全問正解';
    case 'streak':
      return '連続学習達成';
    case 'achievement':
      return '実績解除';
    default:
      return '報酬獲得';
  }
}

function getRewardDescription(reward: any): string {
  switch (reward.type) {
    case 'lesson_complete':
      return `レッスン「${reward.metadata.lesson_title || ''}」を完了しました`;
    case 'quiz_perfect':
      return 'クイズで全問正解を達成しました';
    case 'streak':
      return `${reward.metadata.days || 0}日連続で学習を継続しました`;
    case 'achievement':
      return reward.metadata.title || '新しい実績を解除しました';
    default:
      return '報酬を獲得しました';
  }
} 