import { Platform } from 'react-native';

export interface ThreadingConfig {
  useBackgroundThread: boolean;
  maxConcurrentOperations: number;
  priority: 'low' | 'normal' | 'high';
  timeoutMs: number;
}

export interface ProcessingTask<T = any> {
  id: string;
  operation: () => Promise<T>;
  priority: number;
  timeout?: number;
  onProgress?: (progress: number) => void;
  onComplete?: (result: T) => void;
  onError?: (error: Error) => void;
}

export interface ThreadingStats {
  activeOperations: number;
  queuedOperations: number;
  completedOperations: number;
  failedOperations: number;
  averageProcessingTime: number;
}

export class ThreadingManager {
  private static instance: ThreadingManager;
  private config: ThreadingConfig;
  private activeOperations: Map<string, ProcessingTask> = new Map();
  private operationQueue: ProcessingTask[] = [];
  private stats: ThreadingStats = {
    activeOperations: 0,
    queuedOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    averageProcessingTime: 0
  };
  private processingTimes: number[] = [];
  private isProcessing = false;

  private constructor(config: ThreadingConfig) {
    this.config = config;
  }

  static getInstance(config?: ThreadingConfig): ThreadingManager {
    if (!ThreadingManager.instance) {
      ThreadingManager.instance = new ThreadingManager(
        config || {
          useBackgroundThread: true,
          maxConcurrentOperations: 2,
          priority: 'normal',
          timeoutMs: 30000
        }
      );
    }
    return ThreadingManager.instance;
  }

  /**
   * Queue a processing task
   */
  async queueTask<T>(task: Omit<ProcessingTask<T>, 'id'>): Promise<T> {
    const taskId = this.generateTaskId();
    const fullTask: ProcessingTask<T> = {
      ...task,
      id: taskId,
      priority: task.priority || 1
    };

    return new Promise<T>((resolve, reject) => {
      fullTask.onComplete = resolve;
      fullTask.onError = reject;

      // Add to queue with priority sorting
      this.operationQueue.push(fullTask);
      this.operationQueue.sort((a, b) => b.priority - a.priority);
      this.stats.queuedOperations = this.operationQueue.length;

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the operation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.operationQueue.length > 0 && 
           this.activeOperations.size < this.config.maxConcurrentOperations) {
      
      const task = this.operationQueue.shift();
      if (!task) continue;

      this.stats.queuedOperations = this.operationQueue.length;
      this.executeTask(task);
    }

    // Check if we need to continue processing
    if (this.operationQueue.length > 0) {
      // Wait a bit and try again
      setTimeout(() => {
        this.isProcessing = false;
        this.processQueue();
      }, 100);
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask<T>(task: ProcessingTask<T>): Promise<void> {
    const startTime = Date.now();
    this.activeOperations.set(task.id, task);
    this.stats.activeOperations = this.activeOperations.size;

    try {
      // Set up timeout if specified
      const timeoutMs = task.timeout || this.config.timeoutMs;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
      });

      // Execute the operation with timeout
      const result = await Promise.race([
        this.executeWithPriority(task),
        timeoutPromise
      ]);

      // Update stats
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime, true);

      // Call completion callback
      task.onComplete?.(result);

    } catch (error) {
      // Update stats
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime, false);

      // Call error callback
      task.onError?.(error as Error);
    } finally {
      // Clean up
      this.activeOperations.delete(task.id);
      this.stats.activeOperations = this.activeOperations.size;

      // Continue processing queue
      if (this.operationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 10);
      }
    }
  }

  /**
   * Execute operation with priority handling
   */
  private async executeWithPriority<T>(task: ProcessingTask<T>): Promise<T> {
    if (this.config.useBackgroundThread) {
      return this.executeInBackground(task);
    } else {
      return task.operation();
    }
  }

  /**
   * Execute operation in background (simulated)
   */
  private async executeInBackground<T>(task: ProcessingTask<T>): Promise<T> {
    // In a real implementation, this would use:
    // - JSI/TurboModules for direct native communication
    // - React Native Workers for true background processing
    // - Native background queues (iOS: DispatchQueue, Android: AsyncTask)

    // For now, we simulate background processing with setTimeout
    // to yield control back to the main thread
    return new Promise<T>((resolve, reject) => {
      const executeChunk = async () => {
        try {
          // Yield control to main thread
          await this.yieldToMainThread();
          
          // Execute the actual operation
          const result = await task.operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      // Start execution based on priority
      const delay = this.getPriorityDelay(this.config.priority);
      setTimeout(executeChunk, delay);
    });
  }

  /**
   * Yield control to main thread
   */
  private yieldToMainThread(): Promise<void> {
    return new Promise(resolve => {
      if (Platform.OS === 'ios') {
        // iOS: Use setImmediate for better performance
        setImmediate(resolve);
      } else {
        // Android: Use setTimeout with minimal delay
        setTimeout(resolve, 0);
      }
    });
  }

  /**
   * Get delay based on priority
   */
  private getPriorityDelay(priority: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 0;
      case 'normal': return 1;
      case 'low': return 5;
      default: return 1;
    }
  }

  /**
   * Cancel a specific task
   */
  cancelTask(taskId: string): boolean {
    // Remove from queue
    const queueIndex = this.operationQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.operationQueue.splice(queueIndex, 1);
      this.stats.queuedOperations = this.operationQueue.length;
      return true;
    }

    // Cancel active operation (limited cancellation support)
    const activeTask = this.activeOperations.get(taskId);
    if (activeTask) {
      // In a real implementation, you'd have better cancellation support
      activeTask.onError?.(new Error('Operation cancelled'));
      this.activeOperations.delete(taskId);
      this.stats.activeOperations = this.activeOperations.size;
      return true;
    }

    return false;
  }

  /**
   * Cancel all operations
   */
  cancelAllOperations(): void {
    // Clear queue
    this.operationQueue.forEach(task => {
      task.onError?.(new Error('Operation cancelled'));
    });
    this.operationQueue = [];
    this.stats.queuedOperations = 0;

    // Cancel active operations
    this.activeOperations.forEach(task => {
      task.onError?.(new Error('Operation cancelled'));
    });
    this.activeOperations.clear();
    this.stats.activeOperations = 0;
  }

  /**
   * Update processing statistics
   */
  private updateProcessingStats(processingTime: number, success: boolean): void {
    this.processingTimes.push(processingTime);
    
    // Keep only last 100 processing times for average calculation
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }

    // Update stats
    if (success) {
      this.stats.completedOperations++;
    } else {
      this.stats.failedOperations++;
    }

    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current threading statistics
   */
  getStats(): ThreadingStats {
    return { ...this.stats };
  }

  /**
   * Update threading configuration
   */
  updateConfig(newConfig: Partial<ThreadingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ThreadingConfig {
    return { ...this.config };
  }

  /**
   * Check if system is under heavy load
   */
  isUnderHeavyLoad(): boolean {
    return this.activeOperations.size >= this.config.maxConcurrentOperations &&
           this.operationQueue.length > 5;
  }

  /**
   * Optimize performance based on current load
   */
  optimizeForCurrentLoad(): void {
    if (this.isUnderHeavyLoad()) {
      // Reduce concurrent operations temporarily
      this.config.maxConcurrentOperations = Math.max(1, this.config.maxConcurrentOperations - 1);
    } else if (this.stats.averageProcessingTime < 1000 && this.operationQueue.length === 0) {
      // Increase concurrent operations if performance is good
      this.config.maxConcurrentOperations = Math.min(4, this.config.maxConcurrentOperations + 1);
    }
  }

  /**
   * Memory pressure handling
   */
  handleMemoryPressure(): void {
    // Reduce concurrent operations
    this.config.maxConcurrentOperations = 1;
    
    // Clear lower priority tasks from queue
    this.operationQueue = this.operationQueue.filter(task => task.priority >= 3);
    this.stats.queuedOperations = this.operationQueue.length;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.cancelAllOperations();
    this.processingTimes = [];
    this.isProcessing = false;
  }
}

export default ThreadingManager;
