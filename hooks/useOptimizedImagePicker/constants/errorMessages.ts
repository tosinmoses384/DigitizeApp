export const ERROR_MESSAGES = {
  // Permission errors
  CAMERA_PERMISSION_DENIED: 'Camera access is required to take photos',
  GALLERY_PERMISSION_DENIED: 'Photo library access is required to select images',
  PERMISSION_RATIONALE_CAMERA: 'This app needs camera permission to take photos for your posts',
  PERMISSION_RATIONALE_GALLERY: 'This app needs gallery access to let you choose photos from your library',

  // Selection errors
  USER_CANCELLED_SELECTION: 'Image selection was cancelled',
  NO_IMAGES_SELECTED: 'No images were selected',
  SELECTION_FAILED: 'Failed to select image',

  // Processing errors
  PROCESSING_FAILED: 'Failed to process image',
  COMPRESSION_FAILED: 'Failed to compress image',
  FORMAT_CONVERSION_FAILED: 'Failed to convert image format',
  BACKGROUND_REMOVAL_FAILED: 'Failed to remove background',
  RESIZE_FAILED: 'Failed to resize image',

  // File errors
  FILE_NOT_FOUND: 'Selected image file could not be found',
  FILE_TOO_LARGE: 'Selected image is too large',
  FILE_CORRUPTED: 'Selected image appears to be corrupted',
  UNSUPPORTED_FORMAT: 'Selected image format is not supported',
  INVALID_DIMENSIONS: 'Image dimensions are invalid',

  // Storage errors
  STORAGE_FULL: 'Device storage is full',
  STORAGE_PERMISSION_DENIED: 'Storage permission denied',
  CACHE_CREATION_FAILED: 'Failed to create cache directory',
  CACHE_CLEANUP_FAILED: 'Failed to cleanup cache',
  FILE_SAVE_FAILED: 'Failed to save processed image',

  // Memory errors
  MEMORY_INSUFFICIENT: 'Insufficient memory to process image',
  MEMORY_LIMIT_EXCEEDED: 'Image processing exceeded memory limits',

  // Network errors (for future extensions)
  NETWORK_ERROR: 'Network error occurred',
  UPLOAD_FAILED: 'Failed to upload image',
  DOWNLOAD_FAILED: 'Failed to download image',

  // Generic errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  TIMEOUT_ERROR: 'Operation timed out',
  CANCELLED_ERROR: 'Operation was cancelled'
} as const;

export const ERROR_RECOVERY_SUGGESTIONS = {
  CAMERA_PERMISSION_DENIED: [
    'Go to Settings > Privacy & Security > Camera and enable access',
    'Restart the app after granting permission'
  ],
  GALLERY_PERMISSION_DENIED: [
    'Go to Settings > Privacy & Security > Photos and enable access',
    'Restart the app after granting permission'
  ],
  USER_CANCELLED_SELECTION: [
    'Try selecting an image again'
  ],
  FILE_TOO_LARGE: [
    'Select a smaller image',
    'Use a different compression setting',
    'Try taking a new photo with lower resolution'
  ],
  UNSUPPORTED_FORMAT: [
    'Select a JPEG or PNG image',
    'Convert the image to a supported format',
    'Try taking a new photo'
  ],
  MEMORY_INSUFFICIENT: [
    'Close other apps to free memory',
    'Restart the app',
    'Select a smaller image'
  ],
  STORAGE_FULL: [
    'Free up device storage space',
    'Delete unnecessary files',
    'Clear app cache'
  ],
  PROCESSING_FAILED: [
    'Try again',
    'Select a different image',
    'Restart the app if the problem persists'
  ]
} as const;

export const SUCCESS_MESSAGES = {
  IMAGE_PROCESSED: 'Image processed successfully',
  BACKGROUND_REMOVED: 'Background removed successfully',
  CACHE_CLEARED: 'Cache cleared successfully',
  SETTINGS_UPDATED: 'Settings updated successfully'
} as const;

export const PROGRESS_MESSAGES = {
  SELECTING_IMAGE: 'Selecting image...',
  PROCESSING_IMAGE: 'Processing image...',
  REMOVING_BACKGROUND: 'Removing background...',
  COMPRESSING_IMAGE: 'Compressing image...',
  OPTIMIZING_FORMAT: 'Optimizing format...',
  SAVING_IMAGE: 'Saving image...',
  FINALIZING: 'Finalizing...'
} as const;