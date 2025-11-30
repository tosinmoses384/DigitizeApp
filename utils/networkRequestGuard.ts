import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const DEFAULT_TIMEOUT_MS = 30000;
const NETWORK_CHECK_INTERVAL_MS = 5000;

interface PendingRequest {
  id: string;
  startTime: number;
  abortController: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
}

class NetworkRequestGuard {
  private static instance: NetworkRequestGuard;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private isNetworkAvailable = true;
  private appState: AppStateStatus = 'active';
  private networkCheckIntervalId: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.setupNetworkListener();
    this.setupAppStateListener();
    this.startPeriodicCleanup();
  }

  static getInstance(): NetworkRequestGuard {
    if (!NetworkRequestGuard.instance) {
      NetworkRequestGuard.instance = new NetworkRequestGuard();
    }
    return NetworkRequestGuard.instance;
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isNetworkAvailable;
      this.isNetworkAvailable = !!(state.isConnected && state.isInternetReachable);

      if (wasOffline && this.isNetworkAvailable) {
        if (__DEV__) {
          console.log('🌐 Network restored - cleaning up stale requests');
        }
        this.abortStaleRequests();
      }
    });
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground = this.appState === 'background' || this.appState === 'inactive';
      const isNowActive = nextState === 'active';

      if (wasBackground && isNowActive) {
        if (__DEV__) {
          console.log('📱 App foregrounded - cleaning up stale requests');
        }
        this.abortStaleRequests();
      }

      this.appState = nextState;
    });
  }

  private startPeriodicCleanup(): void {
    this.networkCheckIntervalId = setInterval(() => {
      this.cleanupTimedOutRequests();
    }, NETWORK_CHECK_INTERVAL_MS);
  }

  private cleanupTimedOutRequests(): void {
    const now = Date.now();
    const timedOut: string[] = [];

    this.pendingRequests.forEach((request, id) => {
      if (now - request.startTime > DEFAULT_TIMEOUT_MS) {
        timedOut.push(id);
      }
    });

    timedOut.forEach((id) => {
      const request = this.pendingRequests.get(id);
      if (request) {
        if (__DEV__) {
          console.warn(`⏰ Request ${id} timed out after ${DEFAULT_TIMEOUT_MS}ms - aborting`);
        }
        try {
          request.abortController.abort();
        } catch {}
        clearTimeout(request.timeoutId);
        this.pendingRequests.delete(id);
      }
    });
  }

  private abortStaleRequests(): void {
    const STALE_THRESHOLD_MS = 15000;
    const now = Date.now();
    const stale: string[] = [];

    this.pendingRequests.forEach((request, id) => {
      if (now - request.startTime > STALE_THRESHOLD_MS) {
        stale.push(id);
      }
    });

    stale.forEach((id) => {
      const request = this.pendingRequests.get(id);
      if (request) {
        if (__DEV__) {
          console.warn(`🔄 Aborting stale request ${id}`);
        }
        try {
          request.abortController.abort();
        } catch {}
        clearTimeout(request.timeoutId);
        this.pendingRequests.delete(id);
      }
    });
  }

  registerRequest(
    id: string,
    abortController: AbortController,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): void {
    const existingRequest = this.pendingRequests.get(id);
    if (existingRequest) {
      try {
        existingRequest.abortController.abort();
      } catch {}
      clearTimeout(existingRequest.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      const request = this.pendingRequests.get(id);
      if (request) {
        if (__DEV__) {
          console.warn(`⏰ Request ${id} hit timeout (${timeoutMs}ms) - aborting`);
        }
        try {
          request.abortController.abort();
        } catch {}
        this.pendingRequests.delete(id);
      }
    }, timeoutMs);

    this.pendingRequests.set(id, {
      id,
      startTime: Date.now(),
      abortController,
      timeoutId,
    });
  }

  unregisterRequest(id: string): void {
    const request = this.pendingRequests.get(id);
    if (request) {
      clearTimeout(request.timeoutId);
      this.pendingRequests.delete(id);
    }
  }

  isNetworkOnline(): boolean {
    return this.isNetworkAvailable;
  }

  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }

  abortAllRequests(): void {
    this.pendingRequests.forEach((request) => {
      try {
        request.abortController.abort();
      } catch {}
      clearTimeout(request.timeoutId);
    });
    this.pendingRequests.clear();
  }

  destroy(): void {
    if (this.networkCheckIntervalId) {
      clearInterval(this.networkCheckIntervalId);
    }
    this.abortAllRequests();
  }
}

export default NetworkRequestGuard.getInstance();

