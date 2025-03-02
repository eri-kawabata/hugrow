import React, { memo, useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';
import { LoadingSpinner } from '@/components/Common/LoadingSpinner';
import { ErrorMessage } from '@/components/Common/ErrorMessage';
import type { Ranking } from '@/types/database';

const RankIcon = memo(({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <Crown className="w-6 h-6 text-yellow-500" />;
  } else if (rank === 2) {
    return <Medal className="w-6 h-6 text-gray-400" />;
  } else if (rank === 3) {
    return <Medal className="w-6 h-6 text-amber-600" />;
  }
  return <span className="text-lg font-bold text-gray-600">{rank}</span>;
});

RankIcon.displayName = 'RankIcon';

const RankingCard = memo(({ 
  rank,
  username,
  points,
  avatarUrl,
  isCurrentUser,
}: {
  rank: number;
  username: string;
  points: number;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}) => (
  <div className={`
    flex items-center gap-4 p-4 rounded-lg
    ${isCurrentUser ? 'bg-indigo-50 border border-indigo-200' : 'bg-white'}
  `}>
    <div className="flex-shrink-0 w-8 flex justify-center">
      <RankIcon rank={rank} />
    </div>
    <div className="flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-500">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-gray-900">
        {username}
        {isCurrentUser && (
          <span className="ml-2 text-sm font-normal text-indigo-600">
            (あなた)
          </span>
        )}
      </p>
    </div>
    <div className="flex-shrink-0">
      <p className="font-bold text-gray-900">{points.toLocaleString()} pt</p>
    </div>
  </div>
));

RankingCard.displayName = 'RankingCard';

const PeriodTab = memo(({ 
  period,
  activePeriod,
  onClick,
}: {
  period: Ranking['period'];
  activePeriod: Ranking['period'];
  onClick: (period: Ranking['period']) => void;
}) => (
  <button
    onClick={() => onClick(period)}
    className={`
      px-4 py-2 rounded-full text-sm font-medium
      ${activePeriod === period
        ? 'bg-indigo-600 text-white'
        : 'text-gray-600 hover:text-gray-900'
      }
    `}
  >
    {getPeriodLabel(period)}
  </button>
));

PeriodTab.displayName = 'PeriodTab';

export function RankingDisplay() {
  const [period, setPeriod] = useState<Ranking['period']>('weekly');
  const { rankings, userRank, loading, error } = useRankings(period);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="ランキングの読み込みに失敗しました"
        message="ランキングデータの取得中にエラーが発生しました。"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">ランキング</h2>
            {userRank && (
              <p className="mt-2">
                あなたの順位: {userRank.rank}位 / {userRank.points.toLocaleString()}pt
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly', 'all_time'] as const).map(p => (
          <PeriodTab
            key={p}
            period={p}
            activePeriod={period}
            onClick={setPeriod}
          />
        ))}
      </div>

      <div className="space-y-4">
        {rankings.map(ranking => (
          <RankingCard
            key={ranking.id}
            rank={ranking.rank}
            username={ranking.profile.username || '名無しユーザー'}
            points={ranking.points}
            avatarUrl={ranking.profile.avatar_url}
            isCurrentUser={userRank?.id === ranking.id}
          />
        ))}
      </div>
    </div>
  );
}

function getPeriodLabel(period: Ranking['period']): string {
  switch (period) {
    case 'daily':
      return 'デイリー';
    case 'weekly':
      return 'ウィークリー';
    case 'monthly':
      return 'マンスリー';
    case 'all_time':
      return '全期間';
  }
} 