/**
 * Unified Pagination Configuration System
 * Centralizes all pagination-related settings for consistent behavior across the app
 */

export const PAGINATION_CONFIG = {
  // Standard page sizes for different content types
  CONTENT_TYPES: {
    TIMELINE_POSTS: 15,      // Timeline posts (was inconsistent 12/20)
    MARKETPLACE_ITEMS: 12,   // Marketplace items
    USER_REVIEWS: 12,        // User reviews
    COMMENTS: 20,            // Comments
    MESSAGES: 20,            // Chat messages
    NOTIFICATIONS: 25,       // Notifications
    SEARCH_RESULTS: 15,      // Search results
  },
  
  // Performance optimizations
  PERFORMANCE: {
    PRELOAD_THRESHOLD: 0.8,    // Trigger next page at 80% scroll
    MAX_CACHE_PAGES: 3,        // Keep 3 pages in memory
    DEBOUNCE_MS: 300,          // Debounce scroll events
  },
  
  // Error handling
  ERROR_HANDLING: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    EXPONENTIAL_BACKOFF: true,
  }
} as const;

// Type definitions for type safety
export type ContentType = keyof typeof PAGINATION_CONFIG.CONTENT_TYPES;

export interface PaginationRequest {
  pageSize: number;
  pageToken?: string;
  filters?: Record<string, any>;
  sorting?: SortConfig;
}

export interface PaginationResponse<T> {
  data: T[];
  pageToken?: string;
  hasNextPage: boolean;
  totalCount?: number;
  metadata?: Record<string, any>;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CacheStrategy {
  ttl: number;                    // Time to live in milliseconds
  maxSize: number;               // Maximum cache size
  invalidationTriggers: string[]; // Events that clear cache
  prefetchStrategy: 'aggressive' | 'conservative' | 'adaptive';
}

export interface ErrorHandlingConfig {
  maxRetries: number;
  retryDelayMs: number;
  exponentialBackoff: boolean;
  fallbackToCache: boolean;
}

export interface PaginationConfig<T = any> {
  contentType: ContentType;
  apiContract: PaginationApiContract<T>;
  cacheStrategy?: CacheStrategy;
  errorHandling?: ErrorHandlingConfig;
}

export interface PaginationApiContract<T> {
  endpoint: string;
  method: 'GET' | 'POST';
  requestMapper: (params: PaginationRequest) => any;
  responseMapper: (response: any) => PaginationResponse<T>;
  errorMapper: (error: any) => string;
}

// Default cache strategy
export const DEFAULT_CACHE_STRATEGY: CacheStrategy = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  invalidationTriggers: ['user_action', 'data_update'],
  prefetchStrategy: 'conservative',
};

// Default error handling
export const DEFAULT_ERROR_HANDLING: ErrorHandlingConfig = {
  maxRetries: PAGINATION_CONFIG.ERROR_HANDLING.MAX_RETRIES,
  retryDelayMs: PAGINATION_CONFIG.ERROR_HANDLING.RETRY_DELAY_MS,
  exponentialBackoff: PAGINATION_CONFIG.ERROR_HANDLING.EXPONENTIAL_BACKOFF,
  fallbackToCache: true,
};
