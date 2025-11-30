import * as FileSystem from 'expo-file-system';
import { STORAGE_CONFIG } from '../config';
import { CacheInfo } from '../types';

export interface StorageFile {
  uri: string;
  filename: string;
  size: number;
  createdAt: Date;
  lastAccessed: Date;
}

export class StorageManager {
  private static instance: StorageManager;
  private cacheDirectory: string;
  private fileAccessLog: Map<string, Date> = new Map();

  private constructor() {
    this.cacheDirectory = `${FileSystem.cacheDirectory}${STORAGE_CONFIG.CACHE_DIRECTORY}/`;
    this.ensureCacheDirectoryExists();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async ensureCacheDirectoryExists(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create cache directory:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  async storeProcessedImage(originalUri: string, processedUri: string): Promise<string> {
    try {
      await this.ensureCacheDirectoryExists();
      
      // Generate unique filename with timestamp and hash
      const timestamp = Date.now();
      const hash = this.generateHash(originalUri);
      const extension = this.getFileExtension(processedUri);
      const filename = `${timestamp}_${hash}.${extension}`;
      const destinationUri = `${this.cacheDirectory}${filename}`;

      // Copy the processed image to cache directory
      await FileSystem.copyAsync({
        from: processedUri,
        to: destinationUri
      });

      // Log file access
      this.fileAccessLog.set(filename, new Date());

      // Trigger cleanup if cache is getting full
      await this.checkAndCleanupIfNeeded();

      return destinationUri;
    } catch (error) {
      console.error('Failed to store processed image:', error);
      throw new Error('Storage operation failed');
    }
  }

  async getStoredImage(filename: string): Promise<string | null> {
    try {
      const uri = `${this.cacheDirectory}${filename}`;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (fileInfo.exists) {
        // Update access log
        this.fileAccessLog.set(filename, new Date());
        return uri;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get stored image:', error);
      return null;
    }
  }

  async storeProcessedVideo(originalUri: string, processedUri: string): Promise<string> {
    try {
      await this.ensureCacheDirectoryExists();
      
      // Generate unique filename with timestamp and hash
      const timestamp = Date.now();
      const hash = this.generateHash(originalUri);
      const extension = this.getFileExtension(processedUri);
      const filename = `${timestamp}_${hash}.${extension}`;
      const destinationUri = `${this.cacheDirectory}${filename}`;
      
      // Copy the processed video to cache
      await FileSystem.copyAsync({
        from: processedUri,
        to: destinationUri
      });
      
      // Log file access
      this.fileAccessLog.set(destinationUri, new Date());
      
      return destinationUri;
    } catch (error) {
      console.error('Failed to store processed video:', error);
      throw new Error('Failed to store processed video');
    }
  }

  async getCacheInfo(): Promise<CacheInfo> {
    try {
      await this.ensureCacheDirectoryExists();
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      let totalSize = 0;
      let oldestFile: Date | undefined;
      let newestFile: Date | undefined;

      for (const filename of files) {
        try {
          const uri = `${this.cacheDirectory}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(uri);
          
          if (fileInfo.exists && fileInfo.size) {
            totalSize += fileInfo.size;
            
            const createdAt = new Date(fileInfo.modificationTime || 0);
            if (!oldestFile || createdAt < oldestFile) {
              oldestFile = createdAt;
            }
            if (!newestFile || createdAt > newestFile) {
              newestFile = createdAt;
            }
          }
        } catch (fileError) {
          console.warn(`Failed to get info for file ${filename}:`, fileError);
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile,
        newestFile
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {
        totalFiles: 0,
        totalSize: 0
      };
    }
  }

  async clearCache(olderThan?: Date): Promise<void> {
    try {
      await this.ensureCacheDirectoryExists();
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      let deletedCount = 0;
      const cutoffTime = olderThan || new Date(0); // Delete all if no date specified

      for (const filename of files) {
        try {
          const uri = `${this.cacheDirectory}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(uri);
          
          if (fileInfo.exists) {
            const fileAge = new Date(fileInfo.modificationTime || 0);
            
            if (fileAge < cutoffTime || !olderThan) {
              await FileSystem.deleteAsync(uri, { idempotent: true });
              this.fileAccessLog.delete(filename);
              deletedCount++;
            }
          }
        } catch (fileError) {
          console.warn(`Failed to delete file ${filename}:`, fileError);
        }
      }

      console.log(`Cache cleanup completed. Deleted ${deletedCount} files.`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw new Error('Cache cleanup failed');
    }
  }

  async checkAndCleanupIfNeeded(): Promise<void> {
    try {
      const cacheInfo = await this.getCacheInfo();
      
      // Check if cleanup is needed based on size or file count
      const needsCleanup = 
        cacheInfo.totalSize > STORAGE_CONFIG.MAX_CACHE_SIZE ||
        cacheInfo.totalFiles > STORAGE_CONFIG.MAX_CACHE_FILES;

      if (needsCleanup) {
        await this.performSmartCleanup();
      }
    } catch (error) {
      console.error('Failed to check and cleanup cache:', error);
    }
  }

  private async performSmartCleanup(): Promise<void> {
    try {
      await this.ensureCacheDirectoryExists();
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      // Get file info with access times
      const fileInfos: Array<{
        filename: string;
        uri: string;
        size: number;
        createdAt: Date;
        lastAccessed: Date;
        score: number; // Lower score = higher priority for deletion
      }> = [];

      for (const filename of files) {
        try {
          const uri = `${this.cacheDirectory}${filename}`;
          const fileInfo = await FileSystem.getInfoAsync(uri);
          
          if (fileInfo.exists && fileInfo.size) {
            const createdAt = new Date(fileInfo.modificationTime || 0);
            const lastAccessed = this.fileAccessLog.get(filename) || createdAt;
            
            // Calculate deletion priority score
            // Older files and less frequently accessed files have lower scores
            const ageScore = Date.now() - createdAt.getTime();
            const accessScore = Date.now() - lastAccessed.getTime();
            const score = (ageScore * 0.7) + (accessScore * 0.3);
            
            fileInfos.push({
              filename,
              uri,
              size: fileInfo.size,
              createdAt,
              lastAccessed,
              score
            });
          }
        } catch (fileError) {
          console.warn(`Failed to get info for file ${filename}:`, fileError);
        }
      }

      // Sort by score (lowest first = highest priority for deletion)
      fileInfos.sort((a, b) => a.score - b.score);

      // Delete files until we're under the limits
      let currentSize = fileInfos.reduce((sum, file) => sum + file.size, 0);
      let currentCount = fileInfos.length;
      let deletedCount = 0;

      for (const file of fileInfos) {
        if (currentSize <= STORAGE_CONFIG.MAX_CACHE_SIZE * 0.8 && 
            currentCount <= STORAGE_CONFIG.MAX_CACHE_FILES * 0.8) {
          break; // Keep 20% buffer
        }

        try {
          await FileSystem.deleteAsync(file.uri, { idempotent: true });
          this.fileAccessLog.delete(file.filename);
          currentSize -= file.size;
          currentCount--;
          deletedCount++;
        } catch (deleteError) {
          console.warn(`Failed to delete file ${file.filename}:`, deleteError);
        }
      }

      console.log(`Smart cleanup completed. Deleted ${deletedCount} files.`);
    } catch (error) {
      console.error('Failed to perform smart cleanup:', error);
    }
  }

  async performEmergencyCleanup(): Promise<void> {
    try {
      // Delete all but the 10 most recently accessed files
      await this.ensureCacheDirectoryExists();
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      const fileInfos: Array<{
        filename: string;
        uri: string;
        lastAccessed: Date;
      }> = [];

      for (const filename of files) {
        const uri = `${this.cacheDirectory}${filename}`;
        const lastAccessed = this.fileAccessLog.get(filename) || new Date(0);
        fileInfos.push({ filename, uri, lastAccessed });
      }

      // Sort by last accessed (most recent first)
      fileInfos.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());

      // Delete all but the first 10
      const filesToDelete = fileInfos.slice(10);
      
      for (const file of filesToDelete) {
        try {
          await FileSystem.deleteAsync(file.uri, { idempotent: true });
          this.fileAccessLog.delete(file.filename);
        } catch (deleteError) {
          console.warn(`Failed to delete file ${file.filename}:`, deleteError);
        }
      }

      console.log(`Emergency cleanup completed. Deleted ${filesToDelete.length} files.`);
    } catch (error) {
      console.error('Failed to perform emergency cleanup:', error);
    }
  }

  private generateHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private getFileExtension(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    return extension || 'jpg';
  }

  // Lifecycle methods for app state management
  async onAppStart(): Promise<void> {
    // Perform startup cleanup
    const oldDate = new Date(Date.now() - STORAGE_CONFIG.MAX_FILE_AGE);
    await this.clearCache(oldDate);
  }

  async onAppBackground(): Promise<void> {
    // Perform background cleanup if needed
    await this.checkAndCleanupIfNeeded();
  }

  async onLowStorage(): Promise<void> {
    // Perform emergency cleanup
    await this.performEmergencyCleanup();
  }

  // For debugging and monitoring
  getStorageStats(): {
    cacheDirectory: string;
    accessLogEntries: number;
    isInitialized: boolean;
  } {
    return {
      cacheDirectory: this.cacheDirectory,
      accessLogEntries: this.fileAccessLog.size,
      isInitialized: true
    };
  }
}