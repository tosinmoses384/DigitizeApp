import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'undetermined';
  mediaLibrary: 'granted' | 'denied' | 'undetermined';
  lastChecked: Date;
}

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export class PermissionManager {
  private static instance: PermissionManager;
  private permissionCache: Map<string, { status: PermissionStatus; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  async requestCameraPermission(): Promise<PermissionResult> {
    try {
      const cacheKey = 'camera';
      const cached = this.getCachedPermission(cacheKey);
      
      if (cached && cached.status.camera === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted'
        };
      }

      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      
      const result: PermissionResult = {
        granted: status === 'granted',
        canAskAgain: canAskAgain !== false,
        status: status as 'granted' | 'denied' | 'undetermined'
      };

      // Update cache
      this.updateCache(cacheKey, {
        camera: result.status,
        mediaLibrary: 'undetermined',
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async requestMediaLibraryPermission(): Promise<PermissionResult> {
    try {
      const cacheKey = 'mediaLibrary';
      const cached = this.getCachedPermission(cacheKey);
      
      if (cached && cached.status.mediaLibrary === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted'
        };
      }

      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      const result: PermissionResult = {
        granted: status === 'granted',
        canAskAgain: canAskAgain !== false,
        status: status as 'granted' | 'denied' | 'undetermined'
      };

      // Update cache
      this.updateCache(cacheKey, {
        camera: 'undetermined',
        mediaLibrary: result.status,
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      console.error('Failed to request media library permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async checkCameraPermission(): Promise<PermissionResult> {
    try {
      const cacheKey = 'camera_check';
      const cached = this.getCachedPermission(cacheKey);
      
      if (cached) {
        return {
          granted: cached.status.camera === 'granted',
          canAskAgain: true,
          status: cached.status.camera
        };
      }

      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      const result: PermissionResult = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status as 'granted' | 'denied' | 'undetermined'
      };

      // Update cache
      this.updateCache(cacheKey, {
        camera: result.status,
        mediaLibrary: 'undetermined',
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async checkMediaLibraryPermission(): Promise<PermissionResult> {
    try {
      const cacheKey = 'mediaLibrary_check';
      const cached = this.getCachedPermission(cacheKey);
      
      if (cached) {
        return {
          granted: cached.status.mediaLibrary === 'granted',
          canAskAgain: true,
          status: cached.status.mediaLibrary
        };
      }

      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      
      const result: PermissionResult = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status as 'granted' | 'denied' | 'undetermined'
      };

      // Update cache
      this.updateCache(cacheKey, {
        camera: 'undetermined',
        mediaLibrary: result.status,
        lastChecked: new Date()
      });

      return result;
    } catch (error) {
      console.error('Failed to check media library permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
    }
  }

  async requestAllPermissions(): Promise<{
    camera: PermissionResult;
    mediaLibrary: PermissionResult;
  }> {
    const [cameraResult, mediaLibraryResult] = await Promise.allSettled([
      this.requestCameraPermission(),
      this.requestMediaLibraryPermission()
    ]);

    return {
      camera: cameraResult.status === 'fulfilled' ? cameraResult.value : {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      },
      mediaLibrary: mediaLibraryResult.status === 'fulfilled' ? mediaLibraryResult.value : {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      }
    };
  }

  async checkAllPermissions(): Promise<{
    camera: PermissionResult;
    mediaLibrary: PermissionResult;
  }> {
    const [cameraResult, mediaLibraryResult] = await Promise.allSettled([
      this.checkCameraPermission(),
      this.checkMediaLibraryPermission()
    ]);

    return {
      camera: cameraResult.status === 'fulfilled' ? cameraResult.value : {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      },
      mediaLibrary: mediaLibraryResult.status === 'fulfilled' ? mediaLibraryResult.value : {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      }
    };
  }

  getPermissionRequirementsByPlatform(): {
    ios: string[];
    android: string[];
  } {
    return {
      ios: [
        'NSCameraUsageDescription',
        'NSPhotoLibraryUsageDescription'
      ],
      android: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE'
      ]
    };
  }

  generatePermissionErrorMessage(permission: 'camera' | 'mediaLibrary'): string {
    const appName = 'DigitizeApp'; // You can make this configurable
    
    if (permission === 'camera') {
      return Platform.select({
        ios: `${appName} needs camera access to take photos. Please go to Settings > Privacy & Security > Camera and enable access for ${appName}.`,
        android: `${appName} needs camera permission to take photos. Please go to Settings > Apps > ${appName} > Permissions and enable Camera access.`,
        default: `Camera permission is required to take photos. Please enable it in your device settings.`
      }) || 'Camera permission required';
    } else {
      return Platform.select({
        ios: `${appName} needs photo library access to select images. Please go to Settings > Privacy & Security > Photos and enable access for ${appName}.`,
        android: `${appName} needs storage permission to access your photos. Please go to Settings > Apps > ${appName} > Permissions and enable Storage access.`,
        default: `Photo library permission is required to select images. Please enable it in your device settings.`
      }) || 'Photo library permission required';
    }
  }

  shouldShowPermissionRationale(permission: 'camera' | 'mediaLibrary'): boolean {
    // This would typically check if we should show educational UI before requesting permission
    // For now, we'll return true for first-time requests
    const cacheKey = `${permission}_rationale`;
    return !this.permissionCache.has(cacheKey);
  }

  private getCachedPermission(key: string): { status: PermissionStatus; timestamp: number } | null {
    const cached = this.permissionCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.permissionCache.delete(key);
      return null;
    }
    
    return cached;
  }

  private updateCache(key: string, status: PermissionStatus): void {
    this.permissionCache.set(key, {
      status,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.permissionCache.clear();
  }

  // For debugging and monitoring
  getCacheStats(): {
    totalEntries: number;
    cacheHitRate: number;
    lastCleared?: Date;
  } {
    return {
      totalEntries: this.permissionCache.size,
      cacheHitRate: 0, // Would need to track hits vs misses
      lastCleared: undefined // Would need to track last clear time
    };
  }
}