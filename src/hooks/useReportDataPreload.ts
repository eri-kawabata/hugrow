import { useEffect } from 'react';
import { useReportData } from './useReportData';
import { useReportCache } from './useReportCache';

export function useReportDataPreload() {
  const { updateCache } = useReportCache();
  
  useEffect(() => {
    // ページ遷移前にデータをプリロード
    const prefetchData = async () => {
      const response = await fetch('/api/report/prefetch');
      const data = await response.json();
      updateCache({ report: data });
    };

    // Idle時にプリフェッチを実行
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => prefetchData());
    }
  }, [updateCache]);
} 