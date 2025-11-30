import { useCallback, useEffect, useState, useRef } from "react";
import { useToast } from "react-native-toast-notifications";
import { 
  PAGINATION_CONFIG, 
  ContentType, 
  PaginationRequest, 
  PaginationResponse,
  PaginationConfig,
  DEFAULT_CACHE_STRATEGY,
  DEFAULT_ERROR_HANDLING
} from "@constants/PaginationConfig";

// Core pagination state interface
export interface PaginationState<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasNextPage: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageToken: string;
}

// Hook return interface
export interface UsePaginationReturn<T> {
  // State
  state: PaginationState<T>;
  
  // Actions
  loadInitial: (params?: Partial<PaginationRequest>) => Promise<void>;
  loadNext: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  
  // Data manipulation
  updateItem: (itemId: string, updates: Partial<T>) => void;
  removeItem: (itemId: string) => void;
  addItem: (item: T, position?: 'start' | 'end') => void;
}

// Hook configuration interface
export interface UsePaginationConfig<T> {
  contentType: ContentType;
  apiCall: (params: PaginationRequest) => Promise<any>;
  responseMapper: (response: any) => PaginationResponse<T>;
  errorMapper?: (error: any) => string;
  enableCache?: boolean;
  autoLoad?: boolean;
  dependencies?: any[];
}

/**
 * Universal Pagination Hook
 * Provides consistent pagination behavior across the application
 */
export function usePagination<T extends { id: string }>(
  config: UsePaginationConfig<T>
): UsePaginationReturn<T> {
  const toast = useToast();
  const retryCountRef = useRef(0);
  const cacheRef = useRef<Map<string, PaginationResponse<T>>>(new Map());
  
  // Get page size from configuration
  const pageSize = PAGINATION_CONFIG.CONTENT_TYPES[config.contentType];
  
  // Initial state
  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasNextPage: false,
    currentPage: 0,
    totalItems: 0,
    pageSize,
    pageToken: "",
  });

  // Default error mapper
  const defaultErrorMapper = useCallback((error: any): string => {
    if (error?.response?.status === 401) return "Authentication required";
    if (error?.response?.status === 403) return "Access denied";
    if (error?.response?.status === 404) return "Content not found";
    if (error?.response?.status >= 500) return "Server error. Please try again.";
    return error?.message || "An unexpected error occurred";
  }, []);

  const errorMapper = config.errorMapper || defaultErrorMapper;

  // Cache key generator
  const generateCacheKey = useCallback((params: PaginationRequest): string => {
    return `${config.contentType}_${JSON.stringify(params)}`;
  }, [config.contentType]);

  // Retry logic with exponential backoff
  const executeWithRetry = useCallback(async <R>(
    operation: () => Promise<R>,
    maxRetries: number = DEFAULT_ERROR_HANDLING.maxRetries
  ): Promise<R> => {
    try {
      const result = await operation();
      retryCountRef.current = 0; // Reset retry count on success
      return result;
    } catch (error) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = DEFAULT_ERROR_HANDLING.retryDelayMs * 
          (DEFAULT_ERROR_HANDLING.exponentialBackoff ? Math.pow(2, retryCountRef.current - 1) : 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(operation, maxRetries);
      }
      throw error;
    }
  }, []);

  // Load initial data
  const loadInitial = useCallback(async (params: Partial<PaginationRequest> = {}) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      pageToken: "",
      currentPage: 0 
    }));

    try {
      const requestParams: PaginationRequest = {
        pageSize,
        pageToken: "",
        ...params,
      };

      // Check cache first
      const cacheKey = generateCacheKey(requestParams);
      if (config.enableCache && cacheRef.current.has(cacheKey)) {
        const cachedResponse = cacheRef.current.get(cacheKey)!;
        setState(prev => ({
          ...prev,
          data: cachedResponse.data,
          hasNextPage: cachedResponse.hasNextPage,
          pageToken: cachedResponse.pageToken || "",
          totalItems: cachedResponse.totalCount || cachedResponse.data.length,
          loading: false,
          currentPage: 1,
        }));
        return;
      }

      const response = await executeWithRetry(() => config.apiCall(requestParams));
      const mappedResponse = config.responseMapper(response);

      // Cache the response
      if (config.enableCache) {
        cacheRef.current.set(cacheKey, mappedResponse);
        
        // Implement cache size limit
        if (cacheRef.current.size > DEFAULT_CACHE_STRATEGY.maxSize) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) {
            cacheRef.current.delete(firstKey);
          }
        }
      }

      setState(prev => ({
        ...prev,
        data: mappedResponse.data,
        hasNextPage: mappedResponse.hasNextPage,
        pageToken: mappedResponse.pageToken || "",
        totalItems: mappedResponse.totalCount || mappedResponse.data.length,
        loading: false,
        error: null,
        currentPage: 1,
      }));

    } catch (error: any) {
      const errorMessage = errorMapper(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      
      console.error(`[usePagination] Error loading initial ${config.contentType}:`, error);
      if (toast) {
        toast.show(errorMessage, { type: "danger", duration: 4000 });
      }
    }
  }, [pageSize, config, generateCacheKey, executeWithRetry, errorMapper, toast]);

  // Load next page
  const loadNext = useCallback(async () => {
    if (!state.hasNextPage || state.loadingMore || !state.pageToken) {
      return;
    }

    setState(prev => ({ ...prev, loadingMore: true, error: null }));

    try {
      const requestParams: PaginationRequest = {
        pageSize,
        pageToken: state.pageToken,
      };

      const response = await executeWithRetry(() => config.apiCall(requestParams));
      const mappedResponse = config.responseMapper(response);

      setState(prev => ({
        ...prev,
        data: [...prev.data, ...mappedResponse.data],
        hasNextPage: mappedResponse.hasNextPage,
        pageToken: mappedResponse.pageToken || "",
        totalItems: mappedResponse.totalCount || prev.totalItems + mappedResponse.data.length,
        loadingMore: false,
        error: null,
        currentPage: prev.currentPage + 1,
      }));

    } catch (error: any) {
      const errorMessage = errorMapper(error);
      setState(prev => ({ 
        ...prev, 
        loadingMore: false, 
        error: errorMessage 
      }));
      
      console.error(`[usePagination] Error loading more ${config.contentType}:`, error);
      if (toast) {
        toast.show(errorMessage, { type: "danger", duration: 4000 });
      }
    }
  }, [state.hasNextPage, state.loadingMore, state.pageToken, pageSize, config, executeWithRetry, errorMapper, toast]);

  // Refresh data
  const refresh = useCallback(async () => {
    // Clear cache for this content type
    if (config.enableCache) {
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(config.contentType)) {
          cacheRef.current.delete(key);
        }
      }
    }
    
    await loadInitial();
  }, [loadInitial, config.enableCache, config.contentType]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasNextPage: false,
      currentPage: 0,
      totalItems: 0,
      pageSize,
      pageToken: "",
    });
    retryCountRef.current = 0;
  }, [pageSize]);

  // Update item in list
  const updateItem = useCallback((itemId: string, updates: Partial<T>) => {
    setState(prev => ({
      ...prev,
      data: prev.data.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  // Remove item from list
  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      data: prev.data.filter(item => item.id !== itemId),
      totalItems: prev.totalItems - 1,
    }));
  }, []);

  // Add item to list
  const addItem = useCallback((item: T, position: 'start' | 'end' = 'end') => {
    setState(prev => ({
      ...prev,
      data: position === 'start' ? [item, ...prev.data] : [...prev.data, item],
      totalItems: prev.totalItems + 1,
    }));
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (config.autoLoad !== false) {
      loadInitial();
    }
  }, config.dependencies || []);

  return {
    state,
    loadInitial,
    loadNext,
    refresh,
    reset,
    updateItem,
    removeItem,
    addItem,
  };
}
