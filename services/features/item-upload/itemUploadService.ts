import { Platform } from 'react-native';
import fileServerServices from '../file-server/fileServer';
import wardrobeServices from '../wardrobe-service/wardrobeServices';
import { generateGUID } from '../../../helper/guid-number';

export interface ImageUploadData {
  asset: {
    uri: string;
    mimeType: string;
  };
  clientRequestId: string;
  imageData: {
    imageUri: string;
    type: string;
  };
}

export interface UploadedImageResult {
  imageUri: string;
  type: string;
  clientRequestId: string;
  uploaded: boolean;
  uploadResult: any;
}

export interface UploadResult {
  success: boolean;
  uploadedImages?: UploadedImageResult[];
  failedUploads?: any[];
  allRequestIds?: string[];
  error?: string;
}

export interface ItemSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
  shouldNavigateToWardrobe?: boolean;
  shouldNavigateToOnboarding?: boolean;
}

/**
 * Uploads multiple images to the file server
 * @param assets - Array of image assets from ImagePicker
 * @param token - Authentication token
 * @returns Promise<UploadResult>
 */
export const uploadMultipleImages = async (
  assets: any[],
  token: string
): Promise<UploadResult> => {
  try {
    console.log("=== itemUploadService: uploadMultipleImages ===");
    console.log("Assets received:", assets.length);
    assets.forEach((asset, idx) => {
      console.log(`Asset ${idx + 1}:`, {
        uri: asset.uri,
        mimeType: asset.mimeType,
        isRemote: asset.uri?.startsWith('http'),
        hasFileScheme: asset.uri?.startsWith('file://'),
        uriLength: asset.uri?.length
      });
    });
    
    // Prepare upload data with unique client request IDs
    const uploadData: ImageUploadData[] = assets.map((asset, index) => {
      const clientRequestId = generateGUID();
      
      console.log(`Prepared upload data ${index + 1}:`, {
        clientRequestId,
        imageUri: asset.uri,
        type: asset.mimeType
      });
      
      return {
        asset,
        clientRequestId,
        imageData: {
          imageUri: asset.uri,
          type: asset.mimeType,
        }
      };
    });

    // Create upload promises for all images
    const uploadPromises = uploadData.map(async ({ imageData, clientRequestId }) => {
      const platform = Platform.OS === "android" ? true : false;
      const result = await fileServerServices.itemImageUpload(
        [imageData], 
        platform, 
        clientRequestId,
        token
      );
      
      return {
        ...result,
        clientRequestId
      };
    });
    
    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    console.log("=== Upload Results ===");
    console.log("Total results:", uploadResults.length);
    uploadResults.forEach((result, idx) => {
      console.log(`Result ${idx + 1}:`, {
        status: result?.status,
        responseCode: result?.responseCode,
        message: result?.message,
        hasData: !!result?.data,
        dataLength: Array.isArray(result?.data) ? result?.data.length : 'N/A',
        clientRequestId: result?.clientRequestId
      });
    });
    
    // Check if all uploads were successful
    const allSuccessful = uploadResults.every(res => res?.status === 200);
    console.log("All successful?", allSuccessful);
    
    if (allSuccessful) {
      // Store uploaded image data for metadata editing
      const uploadedImages: UploadedImageResult[] = uploadData.map((data, index) => ({
        imageUri: data.asset.uri,
        type: data.asset.mimeType,
        clientRequestId: data.clientRequestId,
        uploaded: true,
        uploadResult: uploadResults[index],
      }));
      
      // Collect all request IDs from uploaded images
      const allRequestIds = uploadedImages.map(img => img.clientRequestId);
      
      return {
        success: true,
        uploadedImages,
        allRequestIds
      };
    } else {
      // Handle partial failures
      const failedUploads = uploadResults.filter(res => res?.status !== 200);
      
      return {
        success: false,
        failedUploads,
        error: `Failed to upload ${failedUploads.length} image(s). Please try again.`
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: "Failed to upload images. Please try again."
    };
  }
};

/**
 * Uploads a single image from camera
 * @param asset - Single image asset from camera
 * @param token - Authentication token
 * @returns Promise<UploadResult>
 */
export const uploadSingleImage = async (
  asset: any,
  token: string
): Promise<UploadResult> => {
  try {
    const clientRequestId = generateGUID();
    
    const imageData = {
      imageUri: asset.uri,
      type: asset.mimeType,
    };
    
    const platform = Platform.OS === "android" ? true : false;
    const uploadResult = await fileServerServices.itemImageUpload(
      [imageData], 
      platform, 
      clientRequestId,
      token
    );
    
    if (uploadResult?.status === 200) {
      const uploadedImage: UploadedImageResult = {
        imageUri: asset.uri,
        type: asset.mimeType,
        clientRequestId: clientRequestId,
        uploaded: true,
        uploadResult: uploadResult,
      };
      
      return {
        success: true,
        uploadedImages: [uploadedImage],
        allRequestIds: [clientRequestId]
      };
    } else {
      return {
        success: false,
        error: "Failed to upload image. Please try again."
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: "Failed to upload image. Please try again."
    };
  }
};

/**
 * Submits multiple items to the backend server with retry logic
 * @param requestIds - Array of request IDs from uploaded images
 * @param token - Authentication token
 * @param seasonId - Optional season ID
 * @param retryCount - Current retry attempt (internal use)
 * @returns Promise<ItemSubmissionResult>
 */
export const submitMultipleItemsToServer = async (
  requestIds: string[],
  token: string,
  seasonId?: string,
  retryCount: number = 0
): Promise<ItemSubmissionResult> => {
  const MAX_RETRIES = 2;
  
  try {
    const itemsPayload = requestIds.map(requestId => ({
      requestId: requestId,
      brandId: undefined,
      categoryId: undefined,
      sizeId: undefined,
      colourIds: undefined,
      seasonId: seasonId || undefined
    }));
    
    if (__DEV__) {
      console.log(`📤 Submitting ${itemsPayload.length} items to server (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`);
    }
    
    const res = await wardrobeServices?.submitMultipleItems(itemsPayload, token);
    
    if (res?.status === 200) {
      if (__DEV__) {
        console.log('✅ Items submitted successfully');
      }
      return {
        success: true,
        message: res?.detail || res?.message || 'Items uploaded successfully',
        shouldNavigateToWardrobe: true
      };
    }

    if (res?.responseCode === 401) {
      return {
        success: false,
        error: "Authentication failed",
        shouldNavigateToOnboarding: true
      };
    }

    return {
      success: false,
      error: res?.detail || res?.message || 'Upload failed'
    };
    
  } catch (error: any) {
    const isNetworkError = error?.message?.includes('Network Error') || 
                          error?.code === 'ECONNABORTED' ||
                          error?.code === 'ETIMEDOUT';
    
    if (__DEV__) {
      console.error('❌ Item submission error:', {
        message: error?.message,
        code: error?.code,
        isNetworkError,
        retryCount,
        willRetry: isNetworkError && retryCount < MAX_RETRIES
      });
    }
    
    if (isNetworkError && retryCount < MAX_RETRIES) {
      const delayMs = 1000 * Math.pow(2, retryCount);
      if (__DEV__) {
        console.log(`🔄 Retrying in ${delayMs}ms... (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return submitMultipleItemsToServer(requestIds, token, seasonId, retryCount + 1);
    }
    
    return {
      success: false,
      error: isNetworkError 
        ? "Network error. Please check your connection and try again."
        : "An error occurred. Please try again later."
    };
  }
};

/**
 * Complete workflow: Upload images and submit to server
 * @param assets - Array of image assets
 * @param token - Authentication token
 * @returns Promise<{ uploadResult: UploadResult; submissionResult?: ItemSubmissionResult }>
 */
export const uploadImagesAndSubmit = async (
  assets: any[],
  token: string
): Promise<{ uploadResult: UploadResult; submissionResult?: ItemSubmissionResult }> => {
  // First upload all images
  const uploadResult = await uploadMultipleImages(assets, token);
  
  if (!uploadResult.success || !uploadResult.allRequestIds) {
    return { uploadResult };
  }
  
  // Then submit to server (without seasonId - metadata will be added in description modal)
  const submissionResult = await submitMultipleItemsToServer(uploadResult.allRequestIds, token);
  
  return { uploadResult, submissionResult };
};

/**
 * Complete workflow for single camera image: Upload and submit to server
 * @param asset - Single image asset from camera
 * @param token - Authentication token
 * @returns Promise<{ uploadResult: UploadResult; submissionResult?: ItemSubmissionResult }>
 */
export const uploadSingleImageAndSubmit = async (
  asset: any,
  token: string
): Promise<{ uploadResult: UploadResult; submissionResult?: ItemSubmissionResult }> => {
  // First upload the image
  const uploadResult = await uploadSingleImage(asset, token);
  
  if (!uploadResult.success || !uploadResult.allRequestIds) {
    return { uploadResult };
  }
  
  // Then submit to server
  const submissionResult = await submitMultipleItemsToServer(uploadResult.allRequestIds, token);
  
  return { uploadResult, submissionResult };
};
