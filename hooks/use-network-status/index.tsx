import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const OFFLINE_DEBOUNCE_MS = 8000;

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isLoading: boolean;
}

interface UseNetworkStatusReturn extends NetworkState {
  isOffline: boolean;
  isOfflineDebounced: boolean;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isLoading: true,
  });
  
  const [isOfflineDebounced, setIsOfflineDebounced] = useState(false);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOnlineTimeRef = useRef<number>(Date.now());

  const isCurrentlyOffline = !networkState.isConnected || networkState.isInternetReachable === false;

  const clearOfflineTimer = useCallback(() => {
    if (offlineTimerRef.current) {
      clearTimeout(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    const isOnline = state.isConnected === true && state.isInternetReachable !== false;
    return isOnline;
  }, []);

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    if (__DEV__) {
      console.log('📡 Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    }

    const isOnline = state.isConnected === true && state.isInternetReachable !== false;

    setNetworkState({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isLoading: false,
    });

    if (isOnline) {
      clearOfflineTimer();
      setIsOfflineDebounced(false);
      lastOnlineTimeRef.current = Date.now();
    } else {
      if (!offlineTimerRef.current) {
        offlineTimerRef.current = setTimeout(() => {
          setIsOfflineDebounced(true);
          offlineTimerRef.current = null;
        }, OFFLINE_DEBOUNCE_MS);
      }
    }
  }, [clearOfflineTimer]);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      handleNetworkChange(state);
    });

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
      clearOfflineTimer();
    };
  }, [handleNetworkChange, clearOfflineTimer]);

  return {
    ...networkState,
    isOffline: isCurrentlyOffline,
    isOfflineDebounced,
    checkConnection,
  };
};
