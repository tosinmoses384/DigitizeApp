import { ProcessingStats } from '../types';

export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryBefore?: number;
  memoryAfter?: number;
  success: boolean;
  error?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private activeOperations: Map<string, PerformanceMetrics> = new Map();
  private alerts: Array<{ timestamp: number; message: string; severity: 'warning' | 'error' }> = [];

  private constructor(
    private readonly maxMetricsHistory: number = 100,
    private readonly memoryThreshold: number = 100 * 1024 * 1024, // 100MB
    private readonly timeThreshold: number = 15000 // 15 seconds
  ) {}

  static getInstance(
    maxMetricsHistory?: number,
    memoryThreshold?: number,
    timeThreshold?: number
  ): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(
        maxMetricsHistory,
        memoryThreshold,
        timeThreshold
      );
    }
    return PerformanceMonitor.instance;
  }

  startOperation(operationName: string, operationId?: string): string {
    const id = operationId || `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metric: PerformanceMetrics = {
      operationName,
      startTime: Date.now(),
      memoryBefore: this.getCurrentMemoryUsage(),
      success: false
    };

    this.activeOperations.set(id, metric);
    return id;
  }

  endOperation(operationId: string, success: boolean = true, error?: string): PerformanceMetrics | null {
    const metric = this.activeOperations.get(operationId);
    if (!metric) {
      console.warn(`No active operation found for ID: ${operationId}`);
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.memoryAfter = this.getCurrentMemoryUsage();
    metric.success = success;
    metric.error = error;

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    // Add to history
    this.addMetricToHistory(metric);

    // Remove from active operations
    this.activeOperations.delete(operationId);

    return metric;
  }

  getCurrentMemoryUsage(): number {
    // In React Native, we don't have direct access to memory usage
    // This would need to be implemented with native modules
    // For now, return 0 as placeholder
    return 0;
  }

  private addMetricToHistory(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  private checkPerformanceAlerts(metric: PerformanceMetrics): void {
    // Check processing time threshold
    if (metric.duration && metric.duration > this.timeThreshold) {
      this.addAlert(
        `Long processing time detected: ${metric.operationName} took ${metric.duration}ms`,
        'warning'
      );
    }

    // Check memory usage threshold
    if (metric.memoryAfter && metric.memoryAfter > this.memoryThreshold) {
      this.addAlert(
        `High memory usage detected: ${metric.memoryAfter / 1024 / 1024}MB after ${metric.operationName}`,
        'error'
      );
    }

    // Check for failed operations
    if (!metric.success) {
      this.addAlert(
        `Operation failed: ${metric.operationName} - ${metric.error || 'Unknown error'}`,
        'error'
      );
    }
  }

  private addAlert(message: string, severity: 'warning' | 'error'): void {
    this.alerts.push({
      timestamp: Date.now(),
      message,
      severity
    });

    // Keep only the last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
  }

  getProcessingStats(): ProcessingStats {
    const successfulOperations = this.metrics.filter(m => m.success);
    const totalImages = successfulOperations.length;

    if (totalImages === 0) {
      return {
        totalImagesProcessed: 0,
        averageProcessingTime: 0,
        averageCompressionRatio: 0,
        memoryUsage: {
          peak: 0,
          average: 0,
          current: this.getCurrentMemoryUsage()
        },
        errorRate: 0,
        cacheHitRate: 0
      };
    }

    const totalTime = successfulOperations.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageTime = totalTime / totalImages;

    const memoryUsages = successfulOperations
      .map(m => m.memoryAfter || 0)
      .filter(m => m > 0);
    
    const averageMemory = memoryUsages.length > 0 ? 
      memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length : 0;
    
    const peakMemory = memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0;

    const totalOperations = this.metrics.length;
    const failedOperations = totalOperations - totalImages;
    const errorRate = totalOperations > 0 ? failedOperations / totalOperations : 0;

    return {
      totalImagesProcessed: totalImages,
      averageProcessingTime: Math.round(averageTime),
      averageCompressionRatio: 0, // Would need to be calculated from actual compression data
      memoryUsage: {
        peak: peakMemory,
        average: averageMemory,
        current: this.getCurrentMemoryUsage()
      },
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: 0 // Would need to be tracked separately
    };
  }

  getRecentAlerts(maxAge: number = 300000): Array<{ timestamp: number; message: string; severity: 'warning' | 'error' }> {
    const cutoff = Date.now() - maxAge;
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  getOperationMetrics(operationName?: string): PerformanceMetrics[] {
    if (operationName) {
      return this.metrics.filter(m => m.operationName === operationName);
    }
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
    this.alerts = [];
  }

  getActiveOperations(): string[] {
    return Array.from(this.activeOperations.keys());
  }

  // Utility method for automatic performance monitoring
  async monitorOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const operationId = this.startOperation(operationName);
    
    try {
      const result = await operation();
      this.endOperation(operationId, true);
      return result;
    } catch (error) {
      this.endOperation(operationId, false, error?.toString());
      throw error;
    }
  }
}

// Decorator function for automatic performance monitoring
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  operationName: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const monitor = PerformanceMonitor.getInstance();
    return monitor.monitorOperation(operationName, () => fn(...args));
  }) as T;
}

// Memory pressure detection utility
export class MemoryPressureDetector {
  private static instance: MemoryPressureDetector;
  private callbacks: Array<(pressure: 'low' | 'moderate' | 'high') => void> = [];
  private currentPressure: 'low' | 'moderate' | 'high' = 'low';

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): MemoryPressureDetector {
    if (!MemoryPressureDetector.instance) {
      MemoryPressureDetector.instance = new MemoryPressureDetector();
    }
    return MemoryPressureDetector.instance;
  }

  private startMonitoring(): void {
    // In a real implementation, this would hook into native memory events
    // For now, simulate memory pressure based on operation count
    setInterval(() => {
      const monitor = PerformanceMonitor.getInstance();
      const activeOps = monitor.getActiveOperations().length;
      
      let newPressure: 'low' | 'moderate' | 'high' = 'low';
      if (activeOps > 5) {
        newPressure = 'high';
      } else if (activeOps > 2) {
        newPressure = 'moderate';
      }

      if (newPressure !== this.currentPressure) {
        this.currentPressure = newPressure;
        this.notifyCallbacks(newPressure);
      }
    }, 5000); // Check every 5 seconds
  }

  private notifyCallbacks(pressure: 'low' | 'moderate' | 'high'): void {
    this.callbacks.forEach(callback => {
      try {
        callback(pressure);
      } catch (error) {
        console.warn('Memory pressure callback failed:', error);
      }
    });
  }

  onMemoryPressure(callback: (pressure: 'low' | 'moderate' | 'high') => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index >= 0) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  getCurrentPressure(): 'low' | 'moderate' | 'high' {
    return this.currentPressure;
  }
}