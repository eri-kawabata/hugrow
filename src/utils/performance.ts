interface PerformanceMetrics {
  componentName: string;
  operation: string;
  startTime: number;
  duration: number;
  success: boolean;
  error?: Error;
}

class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 100;
  private static readonly SLOW_THRESHOLD = 500; // 500ms以上を遅いと判断

  static startOperation(componentName: string, operation: string): number {
    return performance.now();
  }

  static endOperation(
    componentName: string, 
    operation: string, 
    startTime: number, 
    success: boolean = true,
    error?: Error
  ) {
    const duration = performance.now() - startTime;
    const metric: PerformanceMetrics = {
      componentName,
      operation,
      startTime,
      duration,
      success,
      error
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // 遅いオペレーションを検出（本番環境では警告を出さない）
    if (duration > this.SLOW_THRESHOLD && process.env.NODE_ENV !== 'production') {
      console.warn(`Slow operation detected: ${componentName}.${operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static getMetrics() {
    return this.metrics;
  }

  static getAverageOperationTime(componentName: string, operation: string) {
    const relevantMetrics = this.metrics.filter(
      m => m.componentName === componentName && m.operation === operation
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / relevantMetrics.length;
  }

  static getSuccessRate(componentName: string, operation: string) {
    const relevantMetrics = this.metrics.filter(
      m => m.componentName === componentName && m.operation === operation
    );
    
    if (relevantMetrics.length === 0) return 1;
    
    const successCount = relevantMetrics.filter(m => m.success).length;
    return successCount / relevantMetrics.length;
  }
}

export const performance = PerformanceMonitor; 