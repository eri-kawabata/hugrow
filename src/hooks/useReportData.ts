import { useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ReportData } from '../lib/types';
import { useReportCache } from './useReportCache';
import { useMonitoredAsyncData } from './useMonitoredAsyncData';

export function useReportData() {
  const { cache, isCacheValid, updateCache } = useReportCache();
  
  const fetchReportData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証されていません');

    const { data, error } = await supabase.rpc('get_user_report_data', {
      p_user_id: user.id
    });

    if (error) throw error;

    const reportData: ReportData = {
      userId: user.id,
      ...data
    };

    updateCache({ report: reportData });
    return reportData;
  }, [updateCache]);

  const { 
    data,
    loading,
    error,
    execute: refetch
  } = useMonitoredAsyncData(
    fetchReportData,
    'Report',
    'fetchReportData',
    {
      errorMessage: 'レポートデータの取得に失敗しました',
      retryCount: 2
    }
  );

  useEffect(() => {
    if (!isCacheValid()) {
      refetch();
    }
  }, [isCacheValid, refetch]);

  return {
    data: isCacheValid() ? cache.report : data,
    loading,
    error,
    isAuthenticated: !!cache.report?.userId,
    refetch
  };
} 