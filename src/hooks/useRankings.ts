import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ranking, Profile } from '@/types/database';

type RankingWithProfile = Ranking & {
  profile: Pick<Profile, 'username' | 'avatar_url'>;
};

export function useRankings(period: Ranking['period'] = 'weekly') {
  const [rankings, setRankings] = useState<RankingWithProfile[]>([]);
  const [userRank, setUserRank] = useState<RankingWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);

        // ランキングデータを取得（上位20件）
        const { data: rankingsData, error: rankingsError } = await supabase
          .from('rankings')
          .select(`
            *,
            profile:profiles (
              username,
              avatar_url
            )
          `)
          .eq('period', period)
          .order('points', { ascending: false })
          .limit(20);

        if (rankingsError) throw rankingsError;

        // 現在のユーザーのランキングを取得
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: userRankData, error: userRankError } = await supabase
            .from('rankings')
            .select(`
              *,
              profile:profiles (
                username,
                avatar_url
              )
            `)
            .eq('period', period)
            .eq('user_id', userData.user.id)
            .single();

          if (userRankError && userRankError.code !== 'PGRST116') {
            throw userRankError;
          }

          setUserRank(userRankData);
        }

        setRankings(rankingsData);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [period]);

  const updateRankings = async () => {
    try {
      // 全ユーザーの報酬ポイントを集計
      const { data: pointsData, error: pointsError } = await supabase
        .from('rewards')
        .select('user_id, points')
        .gte('created_at', getPeriodStartDate(period));

      if (pointsError) throw pointsError;

      // ユーザーごとにポイントを集計
      const userPoints = pointsData.reduce((acc, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + curr.points;
        return acc;
      }, {} as Record<string, number>);

      // ランキングを更新
      const updates = Object.entries(userPoints).map(([userId, points]) => ({
        user_id: userId,
        period,
        points,
        rank: 0, // 後で更新
        metadata: {},
      }));

      // ポイント順にソートしてランクを付与
      updates.sort((a, b) => b.points - a.points);
      updates.forEach((update, index) => {
        update.rank = index + 1;
      });

      // データベースを更新
      const { error: updateError } = await supabase
        .from('rankings')
        .upsert(updates);

      if (updateError) throw updateError;

      // 最新のランキングを再取得
      await fetchRankings();
    } catch (err) {
      console.error('Error updating rankings:', err);
      throw err;
    }
  };

  return {
    rankings,
    userRank,
    loading,
    error,
    updateRankings,
  };
}

function getPeriodStartDate(period: Ranking['period']): string {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      now.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      now.setDate(now.getDate() - now.getDay());
      now.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      break;
    case 'all_time':
      return '1970-01-01T00:00:00Z';
  }

  return now.toISOString();
} 