/**
 * Network Debugging Utility
 * 
 * This utility helps diagnose network issues in development builds.
 * Following the DigitizeApp coding guide: centralized utilities for debugging and monitoring.
 */

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  error?: string;
  timeout?: boolean;
}

class NetworkDebugger {
  private requests: Map<string, NetworkRequest> = new Map();
  private enabled: boolean = __DEV__;
  
  /**
   * Track the start of a network request
   */
  trackRequestStart(id: string, url: string, method: string): void {
    if (!this.enabled) return;
    
    const request: NetworkRequest = {
      id,
      url,
      method,
      startTime: Date.now(),
    };
    
    this.requests.set(id, request);
    console.log(`[NetworkDebugger] 🚀 ${method} ${url} started (ID: ${id})`);
  }
  
  /**
   * Track successful completion of a network request
   */
  trackRequestSuccess(id: string, status: number): void {
    if (!this.enabled) return;
    
    const request = this.requests.get(id);
    if (request) {
      request.endTime = Date.now();
      request.status = status;
      
      const duration = request.endTime - request.startTime;
      console.log(`[NetworkDebugger] ✅ ${request.method} ${request.url} completed in ${duration}ms (Status: ${status})`);
      
      // Warn about slow requests
      if (duration > 10000) {
        console.warn(`[NetworkDebugger] ⚠️ Slow request detected: ${request.method} ${request.url} took ${duration}ms`);
      }
    }
  }
  
  /**
   * Track failed network request
   */
  trackRequestError(id: string, error: string): void {
    if (!this.enabled) return;
    
    const request = this.requests.get(id);
    if (request) {
      request.endTime = Date.now();
      request.error = error;
      
      const duration = request.endTime - request.startTime;
      console.error(`[NetworkDebugger] ❌ ${request.method} ${request.url} failed after ${duration}ms: ${error}`);
    }
  }
  
  /**
   * Track request timeout
   */
  trackRequestTimeout(id: string): void {
    if (!this.enabled) return;
    
    const request = this.requests.get(id);
    if (request) {
      request.endTime = Date.now();
      request.timeout = true;
      
      const duration = request.endTime - request.startTime;
      console.error(`[NetworkDebugger] ⏰ ${request.method} ${request.url} timed out after ${duration}ms`);
    }
  }
  
  /**
   * Get summary of all pending requests
   */
  getPendingRequests(): NetworkRequest[] {
    const now = Date.now();
    const pendingRequests: NetworkRequest[] = [];
    
    this.requests.forEach((request) => {
      if (!request.endTime) {
        const duration = now - request.startTime;
        
        // Consider a request potentially hung if it's been running for more than 30 seconds
        if (duration > 30000) {
          pendingRequests.push({
            ...request,
            endTime: now // For duration calculation
          });
        }
      }
    });
    
    return pendingRequests;
  }
  
  /**
   * Log summary of pending requests
   */
  logPendingRequests(): void {
    if (!this.enabled) return;
    
    const pending = this.getPendingRequests();
    
    if (pending.length > 0) {
      console.warn(`[NetworkDebugger] 🔍 Found ${pending.length} potentially hung requests:`);
      pending.forEach((request) => {
        const duration = (request.endTime || Date.now()) - request.startTime;
        console.warn(`  - ${request.method} ${request.url} (${duration}ms)`);
      });
    } else {
      console.log('[NetworkDebugger] ✨ No hung requests detected');
    }
  }
  
  /**
   * Clear completed requests older than specified time
   */
  cleanup(olderThanMs: number = 300000): void { // Default 5 minutes
    const cutoff = Date.now() - olderThanMs;
    
    this.requests.forEach((request, id) => {
      if (request.endTime && request.endTime < cutoff) {
        this.requests.delete(id);
      }
    });
  }
  
  /**
   * Generate unique request ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const networkDebugger = new NetworkDebugger();

// Export helper function for easy integration
export const withNetworkDebugging = async <T>(
  operation: () => Promise<T>,
  url: string,
  method: string = 'UNKNOWN'
): Promise<T> => {
  const id = networkDebugger.generateRequestId();
  networkDebugger.trackRequestStart(id, url, method);
  
  try {
    const result = await operation();
    networkDebugger.trackRequestSuccess(id, 200); // Assume success if no error
    return result;
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      networkDebugger.trackRequestTimeout(id);
    } else {
      networkDebugger.trackRequestError(id, error.message || 'Unknown error');
    }
    throw error;
  }
};

// Development helper: Check for hung requests every minute
if (__DEV__) {
  setInterval(() => {
    networkDebugger.logPendingRequests();
    networkDebugger.cleanup();
  }, 60000); // Every minute
}
