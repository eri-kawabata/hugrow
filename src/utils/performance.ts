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

    // 遅いオペレーションを検出
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${componentName}.${operation} took ${duration}ms`);
    }

    return duration;
  }

  static getMetrics() {
    return this.metrics;
  }
}

export const performance = new PerformanceMonitor(); 