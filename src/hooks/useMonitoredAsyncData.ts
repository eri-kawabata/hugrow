import { useAsyncData } from './useAsyncData';
import { performance } from '../utils/performance';
import { errorTracker } from '../utils/errorTracking';

export function useMonitoredAsyncData<T, E = Error>(
  asyncFn: () => Promise<T>,
  componentName: string,
  operation: string,
  options = {}
) {
  const monitoredFn = async () => {
    const startTime = performance.startOperation(componentName, operation);
    try {
      const result = await asyncFn();
      performance.endOperation(componentName, operation, startTime, true);
      return result;
    } catch (error) {
      performance.endOperation(componentName, operation, startTime, false, error as Error);
      errorTracker.trackError(componentName, operation, error as Error);
      throw error;
    }
  };

  return useAsyncData(monitoredFn, options);
} 