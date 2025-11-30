import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfflineModalProps {
  isVisible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  isRetrying?: boolean;
  isAutoRetrying?: boolean;
  retryCount?: number;
  title?: string;
  message?: string;
}

const { width } = Dimensions.get('window');

const getRetryButtonText = (
  isRetrying: boolean,
  isAutoRetrying: boolean,
  retryCount: number
): string => {
  if (isRetrying) return 'Checking...';
  if (isAutoRetrying) return 'Reconnecting...';
  if (retryCount > 0) return `Try Again (${retryCount})`;
  return 'Try Again';
};

const OfflineModalComponent: React.FC<OfflineModalProps> = ({
  isVisible,
  onRetry,
  onDismiss,
  showRetryButton = true,
  showDismissButton = true,
  isRetrying = false,
  isAutoRetrying = false,
  retryCount = 0,
  title = "You're Offline",
  message = "No internet connection available. Please check your network settings and try again to continue using the app.",
}) => {
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const isButtonDisabled = isRetrying || isAutoRetrying;
  const buttonText = getRetryButtonText(isRetrying, isAutoRetrying, retryCount);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="wifi-outline" 
              size={60} 
              color="#FF6B6B" 
            />
            <View style={styles.offlineIndicator}>
              <View style={styles.offlineDot} />
            </View>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          
          <Text style={styles.message}>
            {message}
          </Text>

          {isAutoRetrying && (
            <View style={styles.autoRetryContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.autoRetryText}>
                Attempting to reconnect automatically...
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {showRetryButton && (
              <TouchableOpacity 
                style={[styles.retryButton, isButtonDisabled && styles.retryButtonDisabled]} 
                onPress={handleRetry}
                activeOpacity={0.8}
                disabled={isButtonDisabled}
                accessibilityRole="button"
                accessibilityLabel="Try to reconnect"
              >
                {isButtonDisabled ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="refresh" size={20} color="white" />
                )}
                <Text style={styles.retryButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            )}
            
            {showDismissButton && (
              <TouchableOpacity 
                style={styles.dismissButton} 
                onPress={handleDismiss}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Dismiss offline notification"
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OfflineModal = React.memo(OfflineModalComponent);

OfflineModal.displayName = 'OfflineModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: width * 0.9,
    minHeight: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  offlineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
  },
  title: {
    fontSize: 24,
    fontFamily: 'DMSansBold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'DMSansRegular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonDisabled: {
    backgroundColor: '#80BDFF',
    opacity: 0.7,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DMSansBold',
  },
  dismissButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dismissButtonText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'DMSansBold',
  },
  autoRetryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  autoRetryText: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#007AFF',
  },
});

export default OfflineModal;
