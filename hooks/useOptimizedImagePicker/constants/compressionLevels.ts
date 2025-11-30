export const COMPRESSION_LEVELS = {
  MINIMAL: {
    quality: 0.95,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    description: 'Highest quality with minimal compression'
  },
  STANDARD: {
    quality: 0.85,
    maxFileSize: 1024 * 1024, // 1MB
    description: 'Balanced quality and file size'
  },
  AGGRESSIVE: {
    quality: 0.75,
    maxFileSize: 512 * 1024, // 512KB
    description: 'Lower quality for smaller file size'
  },
  MAXIMUM: {
    quality: 0.65,
    maxFileSize: 256 * 1024, // 256KB
    description: 'Highest compression for storage optimization'
  }
} as const;

export const RESOLUTION_PRESETS = {
  THUMBNAIL: { width: 256, height: 256 },
  PROFILE: { width: 512, height: 512 },
  STANDARD: { width: 1080, height: 1080 },
  HD: { width: 1920, height: 1080 },
  ORIGINAL: { width: -1, height: -1 } // Special case for no resize
} as const;

export const FORMAT_PRIORITIES = {
  COMPATIBILITY: ['jpeg', 'png', 'webp'] as const,
  SIZE_OPTIMIZED: ['webp', 'jpeg', 'png'] as const,
  QUALITY: ['png', 'jpeg', 'webp'] as const
} as const;

export const PROCESSING_TIMEOUTS = {
  QUICK: 5000, // 5 seconds
  NORMAL: 15000, // 15 seconds
  HEAVY: 30000, // 30 seconds
  BACKGROUND: 60000 // 60 seconds
} as const;