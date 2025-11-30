import { useState, useCallback, useEffect, useRef } from "react";
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';

const MAX_AUTO_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 15000;
const MANUAL_RETRY_CHECK_DURATION_MS = 1500;

interface UseOfflineModalParams {
  isOffline: boolean;
  isOfflineDebounced?: boolean;
  checkConnection?: () => Promise<boolean>;
}

interface UseOfflineModalReturn {
  dismissedOfflineModal: boolean;
  isCheckingConnection: boolean;
  retryCount: number;
  isAutoRetrying: boolean;
  handleOfflineRetry: () => Promise<void>;
  handleOfflineDismiss: () => void;
}

const calculateRetryDelay = (attempt: number): number => {
  const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
};

export const useOfflineModal = ({
  isOffline,
  isOfflineDebounced = false,
  checkConnection,
}: UseOfflineModalParams): UseOfflineModalReturn => {
  const [dismissedOfflineModal, setDismissedOfflineModal] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  
  const autoRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const clearAutoRetryTimer = useCallback(() => {
    if (autoRetryTimerRef.current) {
      clearTimeout(autoRetryTimerRef.current);
      autoRetryTimerRef.current = null;
    }
  }, []);

  const performConnectionCheck = useCallback(async (): Promise<boolean> => {
    if (checkConnection) {
      return checkConnection();
    }
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }, [checkConnection]);

  const handleOfflineRetry = useCallback(async () => {
    if (isCheckingConnection) return;
    
    setIsCheckingConnection(true);
    clearAutoRetryTimer();
    
    try {
      await new Promise(resolve => setTimeout(resolve, MANUAL_RETRY_CHECK_DURATION_MS));
      
      if (!isMountedRef.current) return;
      
      const isOnline = await performConnectionCheck();
      
      if (!isMountedRef.current) return;
      
      if (isOnline) {
        setDismissedOfflineModal(true);
        setRetryCount(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setRetryCount(prev => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      if (isMountedRef.current) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingConnection(false);
      }
    }
  }, [isCheckingConnection, performConnectionCheck, clearAutoRetryTimer]);

  const performAutoRetry = useCallback(async (attempt: number) => {
    if (!isMountedRef.current || !isOfflineDebounced || dismissedOfflineModal) return;
    
    setIsAutoRetrying(true);
    
    try {
      const isOnline = await performConnectionCheck();
      
      if (!isMountedRef.current) return;
      
      if (isOnline) {
        setDismissedOfflineModal(true);
        setRetryCount(0);
        setIsAutoRetrying(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }
      
      if (attempt < MAX_AUTO_RETRIES - 1) {
        const nextDelay = calculateRetryDelay(attempt + 1);
        autoRetryTimerRef.current = setTimeout(() => {
          performAutoRetry(attempt + 1);
        }, nextDelay);
      } else {
        setIsAutoRetrying(false);
      }
    } catch {
      if (isMountedRef.current) {
        setIsAutoRetrying(false);
      }
    }
  }, [isOfflineDebounced, dismissedOfflineModal, performConnectionCheck]);

  const handleOfflineDismiss = useCallback(() => {
    setDismissedOfflineModal(true);
    clearAutoRetryTimer();
  }, [clearAutoRetryTimer]);

  useEffect(() => {
    if (!isOffline) {
      setDismissedOfflineModal(false);
      setRetryCount(0);
      clearAutoRetryTimer();
      setIsAutoRetrying(false);
    }
  }, [isOffline, clearAutoRetryTimer]);

  useEffect(() => {
    if (isOfflineDebounced && !dismissedOfflineModal && !isAutoRetrying && !isCheckingConnection) {
      const initialDelay = calculateRetryDelay(0);
      autoRetryTimerRef.current = setTimeout(() => {
        performAutoRetry(0);
      }, initialDelay);
    }
    
    return () => {
      clearAutoRetryTimer();
    };
  }, [isOfflineDebounced, dismissedOfflineModal, isAutoRetrying, isCheckingConnection, performAutoRetry, clearAutoRetryTimer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAutoRetryTimer();
    };
  }, [clearAutoRetryTimer]);

  return {
    dismissedOfflineModal,
    isCheckingConnection,
    retryCount,
    isAutoRetrying,
    handleOfflineRetry,
    handleOfflineDismiss,
  };
};

