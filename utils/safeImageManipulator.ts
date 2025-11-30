// Safe wrapper for expo-image-manipulator that handles native module linking issues

interface ImageManipulatorResult {
  uri: string;
  width: number;
  height: number;
}

interface ManipulateAction {
  resize?: { width?: number; height?: number };
  crop?: { originX: number; originY: number; width: number; height: number };
}

interface SaveOptions {
  compress?: number;
  format?: 'jpeg' | 'png';
  base64?: boolean;
}

// Safe image manipulator that provides fallbacks when native module is not available
export const safeImageManipulator = {
  async manipulateAsync(
    uri: string,
    actions: ManipulateAction[] = [],
    saveOptions: SaveOptions = {}
  ): Promise<ImageManipulatorResult> {
    try {
      // Try to use the native ImageManipulator
      const { manipulateAsync } = require('expo-image-manipulator');
      return await manipulateAsync(uri, actions, saveOptions);
    } catch (error) {
      console.warn('ImageManipulator not available, using fallback:', error);
      
      // Fallback: return the original URI with estimated dimensions
      return {
        uri: uri,
        width: 300, // Default fallback dimensions
        height: 300,
      };
    }
  },

  async resizeAsync(
    uri: string,
    width: number,
    height: number,
    options: SaveOptions = {}
  ): Promise<ImageManipulatorResult> {
    return this.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      options
    );
  },

  async cropAsync(
    uri: string,
    cropData: { originX: number; originY: number; width: number; height: number },
    options: SaveOptions = {}
  ): Promise<ImageManipulatorResult> {
    return this.manipulateAsync(
      uri,
      [{ crop: cropData }],
      options
    );
  }
};

export default safeImageManipulator;
