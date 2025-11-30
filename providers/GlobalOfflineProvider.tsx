import React from 'react';
import { useNetworkStatus } from '@hooks/use-network-status';
import { useOfflineModal } from '@hooks/use-offline-modal';
import OfflineModal from '@components/OfflineModal';
import { useI18n } from '@hooks/use-i18n';

interface GlobalOfflineProviderProps {
  children: React.ReactNode;
}

const GlobalOfflineProviderComponent: React.FC<GlobalOfflineProviderProps> = ({ children }) => {
  const { t } = useI18n();
  const { isOffline, isOfflineDebounced, checkConnection } = useNetworkStatus();
  const { 
    dismissedOfflineModal, 
    isCheckingConnection, 
    retryCount,
    isAutoRetrying,
    handleOfflineRetry, 
    handleOfflineDismiss 
  } = useOfflineModal({ 
    isOffline, 
    isOfflineDebounced,
    checkConnection,
  });

  return (
    <>
      {children}
      <OfflineModal
        isVisible={isOfflineDebounced && !dismissedOfflineModal}
        onRetry={handleOfflineRetry}
        onDismiss={handleOfflineDismiss}
        showRetryButton={true}
        showDismissButton={true}
        isRetrying={isCheckingConnection}
        isAutoRetrying={isAutoRetrying}
        retryCount={retryCount}
        title={t('chat.youreOffline')}
        message={t('chat.offlineMessage')}
      />
    </>
  );
};

const GlobalOfflineProvider = React.memo(GlobalOfflineProviderComponent);

GlobalOfflineProvider.displayName = 'GlobalOfflineProvider';

export default GlobalOfflineProvider;

