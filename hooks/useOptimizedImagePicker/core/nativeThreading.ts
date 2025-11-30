import { NativeModules, Platform } from 'react-native';

// JSI/TurboModule interface for native threading
interface NativeImageProcessorSpec {
  processImageInBackground(
    uri: string,
    options: ProcessingOptions,
    callback: (result: ProcessingResult) => void
  ): void;
  
  cancelProcessing(taskId: string): boolean;
  
  getProcessingQueue(): ProcessingTask[];
  
  setMaxConcurrentTasks(count: number): void;
  
  enableBackgroundProcessing(enabled: boolean): void;
}

interface ProcessingOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  enableSmartCropping?: boolean;
  stripMetadata?: boolean;
  compressionAlgorithm?: 'fast' | 'balanced' | 'high_quality';
}

interface ProcessingResult {
  success: boolean;
  uri?: string;
  error?: string;
  processingTime: number;
  originalSize: number;
  compressedSize: number;
  metadata?: any;
}

interface ProcessingTask {
  id: string;
  uri: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  options: ProcessingOptions;
}

// Native module wrapper with fallback
class NativeImageProcessor {
  private nativeModule: NativeImageProcessorSpec | null = null;
  private isInitialized = false;
  private taskQueue: Map<string, ProcessingTask> = new Map();
  private maxConcurrentTasks = 3;
  private currentTasks = 0;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Try to get the native module
      if (Platform.OS === 'ios') {
        this.nativeModule = NativeModules.DigitizeAppImageProcessor;
      } else if (Platform.OS === 'android') {
        this.nativeModule = NativeModules.DigitizeAppImageProcessor;
      }
      
      if (this.nativeModule) {
        this.isInitialized = true;
        this.nativeModule.setMaxConcurrentTasks(this.maxConcurrentTasks);
        this.nativeModule.enableBackgroundProcessing(true);
        console.log('Native image processor initialized successfully');
      } else {
        console.warn('Native image processor not available, using JavaScript fallback');
      }
    } catch (error) {
      console.warn('Failed to initialize native image processor:', error);
      this.nativeModule = null;
    }
  }

  public isNativeAvailable(): boolean {
    return this.isInitialized && this.nativeModule !== null;
  }

  public async processImage(
    uri: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    const taskId = this.generateTaskId();
    
    const task: ProcessingTask = {
      id: taskId,
      uri,
      status: 'queued',
      progress: 0,
      startTime: Date.now(),
      options
    };
    
    this.taskQueue.set(taskId, task);

    if (this.isNativeAvailable()) {
      return this.processWithNative(taskId, uri, options, onProgress);
    } else {
      return this.processWithJavaScript(taskId, uri, options, onProgress);
    }
  }

  private async processWithNative(
    taskId: string,
    uri: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const task = this.taskQueue.get(taskId);
      if (!task) {
        reject(new Error('Task not found'));
        return;
      }

      task.status = 'processing';
      this.currentTasks++;

      // Progress simulation for native processing
      const progressInterval = setInterval(() => {
        if (task.status === 'processing') {
          task.progress = Math.min(task.progress + 10, 90);
          onProgress?.(task.progress);
        }
      }, 100);

      this.nativeModule!.processImageInBackground(
        uri,
        options,
        (result: ProcessingResult) => {
          clearInterval(progressInterval);
          this.currentTasks--;
          
          task.status = result.success ? 'completed' : 'failed';
          task.progress = 100;
          onProgress?.(100);
          
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Native processing failed'));
          }
          
          this.taskQueue.delete(taskId);
        }
      );
    });
  }

  private async processWithJavaScript(
    taskId: string,
    uri: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    // Fallback to JavaScript processing using existing utilities
    const task = this.taskQueue.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = 'processing';
    const startTime = Date.now();

    try {
      // Simulate progressive processing steps
      onProgress?.(10);
      await this.delay(50);
      
      onProgress?.(30);
      await this.delay(100);
      
      onProgress?.(60);
      await this.delay(150);
      
      onProgress?.(90);
      await this.delay(100);

      // Here we would integrate with existing JavaScript processing
      // For now, return a mock result
      const result: ProcessingResult = {
        success: true,
        uri: uri, // In real implementation, this would be the processed URI
        processingTime: Date.now() - startTime,
        originalSize: 1024 * 1024, // Mock values
        compressedSize: 512 * 1024,
      };

      task.status = 'completed';
      task.progress = 100;
      onProgress?.(100);
      
      this.taskQueue.delete(taskId);
      return result;
    } catch (error) {
      task.status = 'failed';
      this.taskQueue.delete(taskId);
      throw error;
    }
  }

  public cancelTask(taskId: string): boolean {
    const task = this.taskQueue.get(taskId);
    if (!task) return false;

    if (this.isNativeAvailable()) {
      return this.nativeModule!.cancelProcessing(taskId);
    } else {
      // JavaScript cancellation
      this.taskQueue.delete(taskId);
      return true;
    }
  }

  public getQueueStatus(): ProcessingTask[] {
    return Array.from(this.taskQueue.values());
  }

  public setMaxConcurrentTasks(count: number): void {
    this.maxConcurrentTasks = count;
    if (this.isNativeAvailable()) {
      this.nativeModule!.setMaxConcurrentTasks(count);
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// React Native Worker integration
class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private workerScript: string;
  private maxWorkers = 2;

  constructor() {
    this.workerScript = this.createWorkerScript();
  }

  private createWorkerScript(): string {
    return `
      // Worker script for image processing
      self.onmessage = function(e) {
        const { taskId, uri, options } = e.data;
        
        // Simulate image processing work
        const startTime = Date.now();
        
        // Progressive updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          self.postMessage({
            type: 'progress',
            taskId,
            progress: Math.min(progress, 90)
          });
          
          if (progress >= 90) {
            clearInterval(progressInterval);
            
            // Simulate completion
            setTimeout(() => {
              self.postMessage({
                type: 'complete',
                taskId,
                result: {
                  success: true,
                  uri: uri, // Processed URI would go here
                  processingTime: Date.now() - startTime,
                  originalSize: 1024 * 1024,
                  compressedSize: 512 * 1024
                }
              });
            }, 200);
          }
        }, 100);
      };
    `;
  }

  public async processInWorker(
    uri: string,
    options: ProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      
      try {
        // Create worker (Note: This is a simplified example)
        // In a real implementation, you'd use react-native-workers or similar
        const worker = new Worker(
          URL.createObjectURL(new Blob([this.workerScript], { type: 'application/javascript' }))
        );
        
        worker.onmessage = (e) => {
          const { type, taskId: responseTaskId, progress, result, error } = e.data;
          
          if (responseTaskId !== taskId) return;
          
          switch (type) {
            case 'progress':
              onProgress?.(progress);
              break;
            case 'complete':
              worker.terminate();
              this.workers.delete(taskId);
              resolve(result);
              break;
            case 'error':
              worker.terminate();
              this.workers.delete(taskId);
              reject(new Error(error));
              break;
          }
        };
        
        worker.onerror = (error) => {
          worker.terminate();
          this.workers.delete(taskId);
          reject(error);
        };
        
        this.workers.set(taskId, worker);
        
        // Start processing
        worker.postMessage({ taskId, uri, options });
        
      } catch (error) {
        reject(new Error('Worker creation failed: ' + error));
      }
    });
  }

  public terminateWorker(taskId: string): void {
    const worker = this.workers.get(taskId);
    if (worker) {
      worker.terminate();
      this.workers.delete(taskId);
    }
  }

  public terminateAllWorkers(): void {
    this.workers.forEach((worker, taskId) => {
      worker.terminate();
    });
    this.workers.clear();
  }

  private generateTaskId(): string {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Background task integration
class BackgroundTaskManager {
  private activeTasks: Map<string, any> = new Map();
  private isBackgroundEnabled = false;

  public enableBackgroundProcessing(enabled: boolean): void {
    this.isBackgroundEnabled = enabled;
    
    if (enabled) {
      this.setupBackgroundHandlers();
    } else {
      this.cleanupBackgroundHandlers();
    }
  }

  private setupBackgroundHandlers(): void {
    // Setup background task handlers
    // This would integrate with expo-background-fetch or similar
    console.log('Background processing enabled');
  }

  private cleanupBackgroundHandlers(): void {
    // Cleanup background task handlers
    console.log('Background processing disabled');
  }

  public async executeInBackground<T>(
    taskName: string,
    task: () => Promise<T>
  ): Promise<T> {
    if (!this.isBackgroundEnabled) {
      return task();
    }

    const taskId = this.generateTaskId();
    
    try {
      // Register background task
      this.activeTasks.set(taskId, { name: taskName, startTime: Date.now() });
      
      const result = await task();
      
      this.activeTasks.delete(taskId);
      return result;
    } catch (error) {
      this.activeTasks.delete(taskId);
      throw error;
    }
  }

  private generateTaskId(): string {
    return `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export instances
export const nativeImageProcessor = new NativeImageProcessor();
export const workerManager = new WorkerManager();
export const backgroundTaskManager = new BackgroundTaskManager();

// Export types
export type {
  ProcessingOptions,
  ProcessingResult,
  ProcessingTask,
  NativeImageProcessorSpec
};
