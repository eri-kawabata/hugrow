import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 保護者モード用のレポートデータを取得するフック
 * @param childUserId 保護者が管理する子供のユーザーID
 */
export function useParentReportData(childUserId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    if (!childUserId) {
      setError('子供の ID が指定されていません。');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // reports テーブルから child_id が一致するレポートを取得
      const { data: reportData, error } = await supabase
        .from('reports')
        .select('*')
        .eq('child_id', childUserId)
        .single();
      if (error) {
        throw error;
      }
      if (reportData) {
        setData(reportData);
      } else {
        setError('レポートが見つかりませんでした。');
      }
    } catch (err: any) {
      setError(err.message || 'レポートデータの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [childUserId]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return { data, loading, error, refetch: fetchReportData };
} 