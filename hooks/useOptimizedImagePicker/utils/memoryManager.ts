import { Platform, AppState, AppStateStatus } from 'react-native';

export interface MemoryStats {
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
}

export interface MemoryConfig {
  maxImageSize: number; // Maximum image size to process
  maxConcurrentOperations: number;
  enableMemoryMonitoring: boolean;
  memoryThresholds: {
    warning: number; // 0-1 scale
    critical: number; // 0-1 scale
  };
}

export interface ProcessingContext {
  id: string;
  imageSize: number;
  estimatedMemoryUsage: number;
  priority: number;
  startTime: number;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryConfig;
  private activeProcessing: Map<string, ProcessingContext> = new Map();
  private memoryHistory: number[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private memoryPressureCallbacks: Array<(pressure: string) => void> = [];

  private constructor(config: MemoryConfig) {
    this.config = config;
    this.setupMemoryMonitoring();
    this.setupAppStateHandling();
  }

  static getInstance(config?: MemoryConfig): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(
        config || {
          maxImageSize: 50 * 1024 * 1024, // 50MB
          maxConcurrentOperations: 2,
          enableMemoryMonitoring: true,
          memoryThresholds: {
            warning: 0.7,
            critical: 0.9
          }
        }
      );
    }
    return MemoryManager.instance;
  }

  /**
   * Check if processing can start based on memory constraints
   */
  async canStartProcessing(imageSize: number, estimatedMemoryUsage: number): Promise<{
    canStart: boolean;
    reason?: string;
    suggestedDelay?: number;
  }> {
    // Check if image is too large
    if (imageSize > this.config.maxImageSize) {
      return {
        canStart: false,
        reason: `Image too large (${(imageSize / 1024 / 1024).toFixed(1)}MB). Maximum: ${(this.config.maxImageSize / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Check concurrent operations limit
    if (this.activeProcessing.size >= this.config.maxConcurrentOperations) {
      return {
        canStart: false,
        reason: 'Too many concurrent operations',
        suggestedDelay: 1000
      };
    }

    // Check memory pressure
    const memoryStats = await this.getMemoryStats();
    if (memoryStats.memoryPressure === 'critical') {
      return {
        canStart: false,
        reason: 'Critical memory pressure detected',
        suggestedDelay: 2000
      };
    }

    if (memoryStats.memoryPressure === 'high') {
      // Allow only high priority operations
      return {
        canStart: false,
        reason: 'High memory pressure - only critical operations allowed',
        suggestedDelay: 500
      };
    }

    // Estimate if we have enough memory
    const availableMemory = memoryStats.freeMemory;
    if (estimatedMemoryUsage > availableMemory * 0.8) {
      return {
        canStart: false,
        reason: 'Insufficient memory for operation',
        suggestedDelay: 1500
      };
    }

    return { canStart: true };
  }

  /**
   * Register a processing operation
   */
  registerProcessing(
    id: string,
    imageSize: number,
    estimatedMemoryUsage: number,
    priority: number = 1
  ): void {
    const context: ProcessingContext = {
      id,
      imageSize,
      estimatedMemoryUsage,
      priority,
      startTime: Date.now()
    };

    this.activeProcessing.set(id, context);
    this.optimizeForCurrentLoad();
  }

  /**
   * Unregister a processing operation
   */
  unregisterProcessing(id: string): void {
    this.activeProcessing.delete(id);
    this.optimizeForCurrentLoad();
  }

  /**
   * Get current memory statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    try {
      // In a real implementation, you'd use native modules to get actual memory stats
      // For now, we'll simulate based on active processing
      const estimatedUsage = Array.from(this.activeProcessing.values())
        .reduce((total, context) => total + context.estimatedMemoryUsage, 0);

      // Simulate memory stats (in bytes)
      const totalMemory = this.getTotalDeviceMemory();
      const baseUsage = totalMemory * 0.3; // Assume 30% base usage
      const usedMemory = baseUsage + estimatedUsage;
      const freeMemory = totalMemory - usedMemory;
      const usageRatio = usedMemory / totalMemory;

      let memoryPressure: 'low' | 'medium' | 'high' | 'critical';
      let recommendedAction: string;

      if (usageRatio < this.config.memoryThresholds.warning) {
        memoryPressure = 'low';
        recommendedAction = 'No action needed';
      } else if (usageRatio < this.config.memoryThresholds.critical) {
        memoryPressure = 'medium';
        recommendedAction = 'Consider reducing concurrent operations';
      } else if (usageRatio < 0.95) {
        memoryPressure = 'high';
        recommendedAction = 'Reduce image processing operations';
      } else {
        memoryPressure = 'critical';
        recommendedAction = 'Stop all non-essential operations';
      }

      return {
        totalMemory,
        usedMemory,
        freeMemory,
        memoryPressure,
        recommendedAction
      };
    } catch (error) {
      console.warn('Failed to get memory stats:', error);
      return {
        totalMemory: 0,
        usedMemory: 0,
        freeMemory: 0,
        memoryPressure: 'medium',
        recommendedAction: 'Unable to determine memory status'
      };
    }
  }

  /**
   * Estimate memory usage for image processing
   */
  estimateMemoryUsage(
    imageWidth: number,
    imageHeight: number,
    operations: string[] = []
  ): number {
    // Base memory usage: width * height * 4 bytes (RGBA)
    let baseUsage = imageWidth * imageHeight * 4;

    // Add overhead for different operations
    operations.forEach(operation => {
      switch (operation) {
        case 'resize':
          baseUsage *= 1.5; // Temporary buffer for resizing
          break;
        case 'compress':
          baseUsage *= 1.2; // Compression buffer
          break;
        case 'background_removal':
          baseUsage *= 2.5; // ML model requires significant memory
          break;
        case 'format_conversion':
          baseUsage *= 1.3; // Format conversion buffer
          break;
        default:
          baseUsage *= 1.1; // General overhead
      }
    });

    return Math.round(baseUsage);
  }

  /**
   * Handle memory pressure situations
   */
  async handleMemoryPressure(): Promise<void> {
    const stats = await this.getMemoryStats();
    
    if (stats.memoryPressure === 'critical') {
      await this.performEmergencyCleanup();
    } else if (stats.memoryPressure === 'high') {
      await this.performAggressiveCleanup();
    } else if (stats.memoryPressure === 'medium') {
      await this.performStandardCleanup();
    }

    // Notify callbacks
    this.memoryPressureCallbacks.forEach(callback => {
      try {
        callback(stats.memoryPressure);
      } catch (error) {
        console.warn('Memory pressure callback failed:', error);
      }
    });
  }

  /**
   * Perform emergency cleanup
   */
  private async performEmergencyCleanup(): Promise<void> {
    console.warn('Performing emergency memory cleanup');

    // Cancel all low priority operations
    const lowPriorityOperations = Array.from(this.activeProcessing.entries())
      .filter(([_, context]) => context.priority < 3);

    for (const [id, _] of lowPriorityOperations) {
      this.unregisterProcessing(id);
    }

    // Reduce max concurrent operations
    this.config.maxConcurrentOperations = 1;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Perform aggressive cleanup
   */
  private async performAggressiveCleanup(): Promise<void> {
    console.warn('Performing aggressive memory cleanup');

    // Cancel medium priority operations
    const mediumPriorityOperations = Array.from(this.activeProcessing.entries())
      .filter(([_, context]) => context.priority < 2);

    for (const [id, _] of mediumPriorityOperations) {
      this.unregisterProcessing(id);
    }

    // Reduce max concurrent operations
    this.config.maxConcurrentOperations = Math.max(1, this.config.maxConcurrentOperations - 1);
  }

  /**
   * Perform standard cleanup
   */
  private async performStandardCleanup(): Promise<void> {
    console.log('Performing standard memory cleanup');

    // Remove oldest low priority operations
    const sortedOperations = Array.from(this.activeProcessing.entries())
      .filter(([_, context]) => context.priority < 1)
      .sort(([_, a], [__, b]) => a.startTime - b.startTime);

    if (sortedOperations.length > 0) {
      const [oldestId, _] = sortedOperations[0];
      this.unregisterProcessing(oldestId);
    }
  }

  /**
   * Optimize configuration based on current load
   */
  private optimizeForCurrentLoad(): void {
    const activeCount = this.activeProcessing.size;
    const avgMemoryUsage = Array.from(this.activeProcessing.values())
      .reduce((sum, context) => sum + context.estimatedMemoryUsage, 0) / Math.max(1, activeCount);

    // Adjust max concurrent operations based on memory usage
    if (avgMemoryUsage > 100 * 1024 * 1024) { // 100MB per operation
      this.config.maxConcurrentOperations = 1;
    } else if (avgMemoryUsage > 50 * 1024 * 1024) { // 50MB per operation
      this.config.maxConcurrentOperations = 2;
    } else {
      this.config.maxConcurrentOperations = 3;
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (!this.config.enableMemoryMonitoring) return;

    this.startMemoryMonitoring();
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        const stats = await this.getMemoryStats();
        this.memoryHistory.push(stats.usedMemory);

        // Keep only last 60 readings (5 minutes at 5-second intervals)
        if (this.memoryHistory.length > 60) {
          this.memoryHistory = this.memoryHistory.slice(-60);
        }

        // Check for memory pressure
        if (stats.memoryPressure !== 'low') {
          await this.handleMemoryPressure();
        }
      } catch (error) {
        console.warn('Memory monitoring failed:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Setup app state handling
   */
  private setupAppStateHandling(): void {
    AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'background') {
      // App went to background - perform cleanup
      this.performStandardCleanup();
    } else if (nextAppState === 'active') {
      // App became active - resume monitoring
      if (this.config.enableMemoryMonitoring && !this.isMonitoring) {
        this.startMemoryMonitoring();
      }
    }
  }

  /**
   * Get estimated total device memory
   */
  private getTotalDeviceMemory(): number {
    // Rough estimates based on platform and typical device specs
    if (Platform.OS === 'ios') {
      return 4 * 1024 * 1024 * 1024; // 4GB typical for iOS devices
    } else {
      return 3 * 1024 * 1024 * 1024; // 3GB typical for Android devices
    }
  }

  /**
   * Add memory pressure callback
   */
  addMemoryPressureCallback(callback: (pressure: string) => void): void {
    this.memoryPressureCallbacks.push(callback);
  }

  /**
   * Remove memory pressure callback
   */
  removeMemoryPressureCallback(callback: (pressure: string) => void): void {
    const index = this.memoryPressureCallbacks.indexOf(callback);
    if (index !== -1) {
      this.memoryPressureCallbacks.splice(index, 1);
    }
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 10) return 'stable';

    const recent = this.memoryHistory.slice(-5);
    const older = this.memoryHistory.slice(-10, -5);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const threshold = 0.05; // 5% threshold
    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > threshold) return 'increasing';
    if (change < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!newConfig.enableMemoryMonitoring && this.isMonitoring) {
      this.stopMemoryMonitoring();
    } else if (newConfig.enableMemoryMonitoring && !this.isMonitoring) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopMemoryMonitoring();
    this.activeProcessing.clear();
    this.memoryHistory = [];
    this.memoryPressureCallbacks = [];
  }
}

export default MemoryManager;
