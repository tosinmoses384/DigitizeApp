// Utility functions for ImageDescriptionModal

export const getErrorMessage = (error: any): { title: string; message: string; isRetryable: boolean } => {
  // Handle null/undefined responses
  if (error.message?.includes('No response received from server')) {
    return {
      title: 'Connection Error',
      message: 'No response from server. Please check your internet connection and try again.',
      isRetryable: true,
    };
  }
  
  // Network errors
  if (error.message?.toLowerCase().includes('network')) {
    return {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      isRetryable: true,
    };
  }
  
  // Timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return {
      title: 'Request Timed Out',
      message: 'The request took too long. Please try again.',
      isRetryable: true,
    };
  }
  
  // Server errors
  if (error.status >= 500) {
    return {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again later.',
      isRetryable: true,
    };
  }
  
  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return {
      title: 'Authentication Error',
      message: 'Your session has expired. Please log in again.',
      isRetryable: false,
    };
  }
  
  // Validation errors
  if (error.status === 400) {
    return {
      title: 'Invalid Data',
      message: error.detail || 'Some of the item data is invalid. Please check and try again.',
      isRetryable: true,
    };
  }
  
  // Default error
  return {
    title: 'Upload Failed',
    message: error.detail || error.message || 'An unexpected error occurred. Please try again.',
    isRetryable: true,
  };
};

export const validateImageData = (images: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  images.forEach((image, index) => {
    if (!image.imageUri) {
      errors.push(`Image ${index + 1}: Missing image file`);
    }
    
    // Only validate if not skipped
    if (!image.isSkipped && image.hasBeenEdited) {
      if (!image.selectedBrandId) {
        errors.push(`Image ${index + 1}: Brand is required`);
      }
      if (!image.selectedCategoryId) {
        errors.push(`Image ${index + 1}: Category is required`);
      }
      if (!image.selectedSizeId) {
        errors.push(`Image ${index + 1}: Size is required`);
      }
      if (!image.selectedColourId) {
        errors.push(`Image ${index + 1}: Color is required`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const createTimeoutPromise = (promise: Promise<any>, timeoutMs: number = 30000): Promise<any> => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};