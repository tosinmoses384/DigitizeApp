import * as FileSystem from 'expo-file-system';

export interface PreparedImageAsset {
  uri: string;
  mimeType: string;
  isDownloaded?: boolean;
  originalUri?: string;
}

const getMimeTypeFromExtension = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'heic': 'image/heic',
    'heif': 'image/heif',
  };
  
  return mimeTypes[extension || ''] || 'image/jpeg';
};

const isRemoteUri = (uri: string): boolean => {
  return uri.startsWith('http://') || uri.startsWith('https://');
};

const generateCacheFileName = (originalUri: string): string => {
  const timestamp = Date.now();
  
  const urlWithoutQuery = originalUri.split('?')[0];
  const pathParts = urlWithoutQuery.split('/');
  const lastPart = pathParts[pathParts.length - 1] || 'image';
  
  const hasValidExtension = /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(lastPart);
  
  if (hasValidExtension) {
    const extension = lastPart.split('.').pop()?.toLowerCase() || 'jpg';
    const hash = lastPart.split('.')[0] || String(timestamp);
    return `${hash}_${timestamp}.${extension}`;
  } else {
    const randomHash = Math.random().toString(36).substring(7);
    return `image_${randomHash}_${timestamp}.jpg`;
  }
};

const getMimeTypeFromHeaders = (headers: Record<string, string> | undefined): string | null => {
  if (!headers) return null;
  
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (contentType && contentType.startsWith('image/')) {
    return contentType.split(';')[0];
  }
  
  return null;
};

const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  
  return mimeToExtension[mimeType] || 'jpg';
};

export const prepareImageAssetForUpload = async (
  imageUri: string
): Promise<PreparedImageAsset> => {
  console.log("=== prepareImageAssetForUpload ===");
  console.log("Input URI:", imageUri);
  
  if (!isRemoteUri(imageUri)) {
    console.log("Local file detected, using as-is");
    const mimeType = getMimeTypeFromExtension(imageUri);
    return {
      uri: imageUri,
      mimeType,
      isDownloaded: false,
    };
  }
  
  console.log("Remote URL detected, downloading to cache...");
  
  try {
    let cacheFileName = generateCacheFileName(imageUri);
    let localUri = `${FileSystem.cacheDirectory}${cacheFileName}`;
    
    console.log("Downloading from:", imageUri);
    console.log("Initial cache path:", localUri);
    
    const downloadResult = await FileSystem.downloadAsync(imageUri, localUri);
    
    if (downloadResult.status === 200) {
      let mimeType = getMimeTypeFromHeaders(downloadResult.headers);
      
      if (mimeType) {
        const correctExtension = getExtensionFromMimeType(mimeType);
        const currentExtension = cacheFileName.split('.').pop();
        
        if (currentExtension !== correctExtension) {
          const newFileName = cacheFileName.replace(/\.[^.]+$/, `.${correctExtension}`);
          const newLocalUri = `${FileSystem.cacheDirectory}${newFileName}`;
          
          console.log(`Renaming file to match MIME type: ${cacheFileName} -> ${newFileName}`);
          await FileSystem.moveAsync({
            from: downloadResult.uri,
            to: newLocalUri,
          });
          
          localUri = newLocalUri;
        } else {
          localUri = downloadResult.uri;
        }
      } else {
        mimeType = getMimeTypeFromExtension(imageUri);
        localUri = downloadResult.uri;
      }
      
      console.log("Download successful!");
      console.log("Local URI:", localUri);
      console.log("MIME type:", mimeType);
      
      return {
        uri: localUri,
        mimeType,
        isDownloaded: true,
        originalUri: imageUri,
      };
    } else {
      console.error("Download failed with status:", downloadResult.status);
      throw new Error(`Failed to download image: HTTP ${downloadResult.status}`);
    }
  } catch (error) {
    console.error("Error downloading remote image:", error);
    throw new Error(
      `Failed to prepare image for upload: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const prepareMultipleImagesForUpload = async (
  imageUris: string[]
): Promise<PreparedImageAsset[]> => {
  console.log("=== prepareMultipleImagesForUpload ===");
  console.log("Total images to prepare:", imageUris.length);
  
  const results = await Promise.all(
    imageUris.map((uri, index) => 
      prepareImageAssetForUpload(uri)
        .then(result => {
          console.log(`Image ${index + 1} prepared successfully`);
          return result;
        })
        .catch(error => {
          console.error(`Image ${index + 1} failed:`, error);
          throw error;
        })
    )
  );
  
  console.log("All images prepared successfully");
  return results;
};

export const cleanupCachedImages = async (uris: string[]): Promise<void> => {
  console.log("=== cleanupCachedImages ===");
  console.log("Cleaning up", uris.length, "cached images");
  
  await Promise.all(
    uris.map(async (uri) => {
      if (uri.startsWith(FileSystem.cacheDirectory || '')) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
          console.log("Deleted:", uri);
        } catch (error) {
          console.warn("Failed to delete cached image:", uri, error);
        }
      }
    })
  );
};

