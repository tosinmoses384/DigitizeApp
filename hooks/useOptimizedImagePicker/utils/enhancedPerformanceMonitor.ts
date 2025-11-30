import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface PerformanceMetrics {
  // Processing metrics
  processingTime: number;
  compressionRatio: number;
  qualityScore: number;
  
  // Memory metrics
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    leaked: number;
  };
  
  // File metrics
  fileSize: {
    original: number;
    processed: number;
    savings: number;
  };
  
  // Cache metrics
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  
  // Threading metrics
  concurrentTasks: number;
  queueTime: number;
  threadUtilization: number;
  
  // Error metrics
  errors: number;
  warnings: number;
  recoveryAttempts: number;
  
  // Platform metrics
  platform: string;
  deviceInfo: DeviceInfo;
  
  // Custom metrics
  customMetrics: { [key: string]: number };
}

interface DeviceInfo {
  platform: string;
  osVersion?: string;
  deviceModel?: string;
  availableMemory?: number;
  totalMemory?: number;
  cpuCores?: number;
}

interface PerformanceSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  operations: PerformanceOperation[];
  aggregatedMetrics: PerformanceMetrics;
}

interface PerformanceOperation {
  operationId: string;
  type: 'pick' | 'process' | 'compress' | 'enhance' | 'crop' | 'metadata';
  startTime: number;
  endTime: number;
  metrics: PerformanceMetrics;
  success: boolean;
  error?: string;
}

interface PerformanceAlert {
  type: 'memory' | 'performance' | 'error' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: Partial<PerformanceMetrics>;
  timestamp: number;
  suggestions: string[];
}

class EnhancedPerformanceMonitor {
  private static instance: EnhancedPerformanceMonitor;
  private currentSession: PerformanceSession | null = null;
  private performanceHistory: PerformanceSession[] = [];
  private activeOperations: Map<string, PerformanceOperation> = new Map();
  private memorySnapshots: Array<{ timestamp: number; usage: number }> = [];
  private cacheStats = { hits: 0, misses: 0 };
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private deviceInfo: DeviceInfo = { platform: Platform.OS };

  // Performance thresholds
  private readonly thresholds = {
    maxProcessingTime: 10000, // 10 seconds
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minCompressionRatio: 0.1, // 10%
    minQualityScore: 0.6, // 60%
    maxConcurrentTasks: 5,
    minCacheHitRate: 0.3 // 30%
  };

  public static getInstance(): EnhancedPerformanceMonitor {
    if (!EnhancedPerformanceMonitor.instance) {
      EnhancedPerformanceMonitor.instance = new EnhancedPerformanceMonitor();
      EnhancedPerformanceMonitor.instance.initialize();
    }
    return EnhancedPerformanceMonitor.instance;
  }

  private async initialize(): Promise<void> {
    this.deviceInfo = await this.collectDeviceInfo();
    this.startMemoryMonitoring();
  }

  private async collectDeviceInfo(): Promise<DeviceInfo> {
    const info: DeviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
    };

    try {
      // Collect additional device info if available
      // Note: Some of these APIs might not be available in Expo
      if (Platform.OS === 'ios') {
        // iOS specific info collection
      } else if (Platform.OS === 'android') {
        // Android specific info collection
      }
    } catch (error) {
      console.warn('Could not collect full device info:', error);
    }

    return info;
  }

  private startMemoryMonitoring(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      const memoryUsage = this.getCurrentMemoryUsage();
      this.memorySnapshots.push({
        timestamp: Date.now(),
        usage: memoryUsage
      });

      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }

      // Check for memory alerts
      this.checkMemoryAlerts(memoryUsage);
    }, 1000); // Check every second
  }

  public startSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      operations: [],
      aggregatedMetrics: this.createEmptyMetrics()
    };

    return sessionId;
  }

  public endSession(): PerformanceSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.aggregatedMetrics = this.calculateAggregatedMetrics(
      this.currentSession.operations
    );

    // Store in history
    this.performanceHistory.push(this.currentSession);
    
    // Limit history size
    if (this.performanceHistory.length > 50) {
      this.performanceHistory.shift();
    }

    const session = this.currentSession;
    this.currentSession = null;
    
    return session;
  }

  public startOperation(type: PerformanceOperation['type']): string {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const operation: PerformanceOperation = {
      operationId,
      type,
      startTime: Date.now(),
      endTime: 0,
      metrics: this.createEmptyMetrics(),
      success: false
    };

    this.activeOperations.set(operationId, operation);
    return operationId;
  }

  public endOperation(
    operationId: string,
    success: boolean,
    metrics: Partial<PerformanceMetrics> = {},
    error?: string
  ): void {
    const operation = this.activeOperations.get(operationId);
    if (!operation) return;

    operation.endTime = Date.now();
    operation.success = success;
    operation.error = error;
    operation.metrics = {
      ...operation.metrics,
      ...metrics,
      processingTime: operation.endTime - operation.startTime
    };

    // Add to current session if exists
    if (this.currentSession) {
      this.currentSession.operations.push(operation);
    }

    this.activeOperations.delete(operationId);

    // Check for performance alerts
    this.checkPerformanceAlerts(operation);
  }

  public recordCacheHit(): void {
    this.cacheStats.hits++;
  }

  public recordCacheMiss(): void {
    this.cacheStats.misses++;
  }

  public recordCustomMetric(name: string, value: number, operationId?: string): void {
    if (operationId) {
      const operation = this.activeOperations.get(operationId);
      if (operation) {
        operation.metrics.customMetrics[name] = value;
      }
    }
  }

  private getCurrentMemoryUsage(): number {
    // Mock memory usage - in real implementation, use native modules
    // or performance.memory API where available
    return Math.random() * 50 * 1024 * 1024; // Random value up to 50MB
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      processingTime: 0,
      compressionRatio: 0,
      qualityScore: 0,
      memoryUsage: {
        initial: this.getCurrentMemoryUsage(),
        peak: 0,
        final: 0,
        leaked: 0
      },
      fileSize: {
        original: 0,
        processed: 0,
        savings: 0
      },
      cacheHits: this.cacheStats.hits,
      cacheMisses: this.cacheStats.misses,
      cacheHitRate: this.calculateCacheHitRate(),
      concurrentTasks: this.activeOperations.size,
      queueTime: 0,
      threadUtilization: 0,
      errors: 0,
      warnings: 0,
      recoveryAttempts: 0,
      platform: this.deviceInfo.platform,
      deviceInfo: this.deviceInfo,
      customMetrics: {}
    };
  }

  private calculateCacheHitRate(): number {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return total > 0 ? this.cacheStats.hits / total : 0;
  }

  private calculateAggregatedMetrics(operations: PerformanceOperation[]): PerformanceMetrics {
    if (operations.length === 0) return this.createEmptyMetrics();

    const metrics = this.createEmptyMetrics();
    let totalProcessingTime = 0;
    let totalCompressionRatio = 0;
    let totalQualityScore = 0;
    let totalOriginalSize = 0;
    let totalProcessedSize = 0;
    let successfulOps = 0;

    for (const op of operations) {
      totalProcessingTime += op.metrics.processingTime;
      
      if (op.success) {
        successfulOps++;
        totalCompressionRatio += op.metrics.compressionRatio;
        totalQualityScore += op.metrics.qualityScore;
        totalOriginalSize += op.metrics.fileSize.original;
        totalProcessedSize += op.metrics.fileSize.processed;
      }

      metrics.errors += op.metrics.errors;
      metrics.warnings += op.metrics.warnings;
      metrics.recoveryAttempts += op.metrics.recoveryAttempts;

      // Track peak memory usage
      if (op.metrics.memoryUsage.peak > metrics.memoryUsage.peak) {
        metrics.memoryUsage.peak = op.metrics.memoryUsage.peak;
      }
    }

    // Calculate averages
    metrics.processingTime = totalProcessingTime;
    metrics.compressionRatio = successfulOps > 0 ? totalCompressionRatio / successfulOps : 0;
    metrics.qualityScore = successfulOps > 0 ? totalQualityScore / successfulOps : 0;
    metrics.fileSize.original = totalOriginalSize;
    metrics.fileSize.processed = totalProcessedSize;
    metrics.fileSize.savings = totalOriginalSize - totalProcessedSize;

    return metrics;
  }

  private checkMemoryAlerts(currentUsage: number): void {
    if (currentUsage > this.thresholds.maxMemoryUsage) {
      this.triggerAlert({
        type: 'memory',
        severity: 'high',
        message: `High memory usage detected: ${(currentUsage / 1024 / 1024).toFixed(1)}MB`,
        metrics: { memoryUsage: { initial: 0, peak: currentUsage, final: 0, leaked: 0 } },
        timestamp: Date.now(),
        suggestions: [
          'Reduce concurrent operations',
          'Clear image caches',
          'Use lower quality settings',
          'Process images in smaller batches'
        ]
      });
    }
  }

  private checkPerformanceAlerts(operation: PerformanceOperation): void {
    const { metrics } = operation;

    // Processing time alert
    if (metrics.processingTime > this.thresholds.maxProcessingTime) {
      this.triggerAlert({
        type: 'performance',
        severity: 'medium',
        message: `Slow processing detected: ${metrics.processingTime}ms`,
        metrics: { processingTime: metrics.processingTime },
        timestamp: Date.now(),
        suggestions: [
          'Use lower quality settings',
          'Disable advanced features',
          'Reduce image dimensions'
        ]
      });
    }

    // Quality alert
    if (metrics.qualityScore < this.thresholds.minQualityScore) {
      this.triggerAlert({
        type: 'quality',
        severity: 'medium',
        message: `Low quality score: ${(metrics.qualityScore * 100).toFixed(1)}%`,
        metrics: { qualityScore: metrics.qualityScore },
        timestamp: Date.now(),
        suggestions: [
          'Increase quality settings',
          'Use different compression algorithm',
          'Check input image quality'
        ]
      });
    }

    // Cache hit rate alert
    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      this.triggerAlert({
        type: 'performance',
        severity: 'low',
        message: `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        metrics: { cacheHitRate: metrics.cacheHitRate },
        timestamp: Date.now(),
        suggestions: [
          'Increase cache size',
          'Review cache invalidation strategy',
          'Check for cache key collisions'
        ]
      });
    }
  }

  private triggerAlert(alert: PerformanceAlert): void {
    console.warn('Performance Alert:', alert);
    
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    }
  }

  public onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  public removeAlertCallback(callback: (alert: PerformanceAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  public getRealtimeMetrics(): {
    memoryUsage: number;
    activeOperations: number;
    cacheHitRate: number;
    averageProcessingTime: number;
    recentErrors: number;
  } {
    const recentOps = this.performanceHistory
      .flatMap(session => session.operations)
      .filter(op => Date.now() - op.endTime < 60000); // Last minute

    const avgProcessingTime = recentOps.length > 0
      ? recentOps.reduce((sum, op) => sum + op.metrics.processingTime, 0) / recentOps.length
      : 0;

    const recentErrors = recentOps.filter(op => !op.success).length;

    return {
      memoryUsage: this.getCurrentMemoryUsage(),
      activeOperations: this.activeOperations.size,
      cacheHitRate: this.calculateCacheHitRate(),
      averageProcessingTime: avgProcessingTime,
      recentErrors
    };
  }

  public getPerformanceReport(): {
    summary: string;
    totalSessions: number;
    totalOperations: number;
    successRate: number;
    averageMetrics: PerformanceMetrics;
    trends: {
      processingTime: number[];
      memoryUsage: number[];
      qualityScore: number[];
    };
    recommendations: string[];
  } {
    const allOperations = this.performanceHistory.flatMap(session => session.operations);
    const successfulOps = allOperations.filter(op => op.success);
    const successRate = allOperations.length > 0 ? successfulOps.length / allOperations.length : 0;

    const averageMetrics = this.calculateAggregatedMetrics(allOperations);

    // Calculate trends (last 10 operations)
    const recentOps = allOperations.slice(-10);
    const trends = {
      processingTime: recentOps.map(op => op.metrics.processingTime),
      memoryUsage: recentOps.map(op => op.metrics.memoryUsage.peak),
      qualityScore: recentOps.map(op => op.metrics.qualityScore)
    };

    const recommendations = this.generateRecommendations(averageMetrics, successRate);

    const summary = `Processed ${allOperations.length} operations across ${this.performanceHistory.length} sessions. ` +
                   `Success rate: ${(successRate * 100).toFixed(1)}%. ` +
                   `Average processing time: ${averageMetrics.processingTime.toFixed(0)}ms.`;

    return {
      summary,
      totalSessions: this.performanceHistory.length,
      totalOperations: allOperations.length,
      successRate,
      averageMetrics,
      trends,
      recommendations
    };
  }

  private generateRecommendations(metrics: PerformanceMetrics, successRate: number): string[] {
    const recommendations: string[] = [];

    if (metrics.processingTime > this.thresholds.maxProcessingTime) {
      recommendations.push('Consider reducing image quality or dimensions to improve processing speed');
    }

    if (metrics.memoryUsage.peak > this.thresholds.maxMemoryUsage) {
      recommendations.push('Implement memory optimization strategies or process images in smaller batches');
    }

    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      recommendations.push('Optimize caching strategy to improve performance');
    }

    if (successRate < 0.9) {
      recommendations.push('Investigate common failure patterns and implement better error handling');
    }

    if (metrics.qualityScore < this.thresholds.minQualityScore) {
      recommendations.push('Review compression settings to maintain better image quality');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }

    return recommendations;
  }

  public exportMetrics(): string {
    return JSON.stringify({
      deviceInfo: this.deviceInfo,
      performanceHistory: this.performanceHistory,
      cacheStats: this.cacheStats,
      memorySnapshots: this.memorySnapshots.slice(-20), // Last 20 snapshots
      thresholds: this.thresholds,
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  public clearHistory(): void {
    this.performanceHistory = [];
    this.memorySnapshots = [];
    this.cacheStats = { hits: 0, misses: 0 };
  }

  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.clearHistory();
    this.alertCallbacks = [];
  }
}

// Performance decorator for automatic monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationType: PerformanceOperation['type'] = 'process'
) {
  return async (...args: T): Promise<R> => {
    const monitor = EnhancedPerformanceMonitor.getInstance();
    const operationId = monitor.startOperation(operationType);
    
    try {
      const result = await operation(...args);
      monitor.endOperation(operationId, true);
      return result;
    } catch (error) {
      monitor.endOperation(operationId, false, {}, (error as Error).message);
      throw error;
    }
  };
}

// Export instance and types
export const enhancedPerformanceMonitor = EnhancedPerformanceMonitor.getInstance();

export type {
  PerformanceMetrics,
  PerformanceSession,
  PerformanceOperation,
  PerformanceAlert,
  DeviceInfo
};
