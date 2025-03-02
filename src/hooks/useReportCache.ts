import { atom, useAtom } from 'jotai';
import type { ReportData, SELResponse } from '../lib/types';

interface CacheData {
  report: ReportData | null;
  responses: SELResponse[];
  lastFetched: number | null;
}

const cacheAtom = atom<CacheData>({
  report: null,
  responses: [],
  lastFetched: null
});

// キャッシュの有効期間（5分）
const CACHE_TTL = 5 * 60 * 1000;

export function useReportCache() {
  const [cache, setCache] = useAtom(cacheAtom);

  const isCacheValid = () => {
    if (!cache.lastFetched) return false;
    return Date.now() - cache.lastFetched < CACHE_TTL;
  };

  const updateCache = (data: Partial<CacheData>) => {
    setCache(prev => ({
      ...prev,
      ...data,
      lastFetched: Date.now()
    }));
  };

  return {
    cache,
    isCacheValid,
    updateCache
  };
} 