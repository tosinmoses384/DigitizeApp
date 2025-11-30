import React, { memo, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Pressable,
  Clipboard,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@hooks/use-i18n";
import { useShippingTracking } from "@hooks/use-shipping-tracking";
import VerticalStepper, { VerticalStepperStep } from "@components/VerticalStepper";
import LineLoader from "@components/LineLoader";

/**
 * OnlineTrackingModal Component
 * 
 * Modal displaying real-time tracking information for online/platform shipping.
 * Fetches dynamic tracking events from the API and displays a live tracking timeline,
 * courier info, tracking codes with external links, and delivery details.
 * 
 * @section Architecture Requirements - Modal component layer
 * @section Performance - Uses React.memo, useCallback, and useMemo for optimization
 * @section Accessibility - Includes proper accessibility labels and roles
 * @section API Integration - Fetches data from shipping tracking endpoint with real-time events
 */

interface OnlineTrackingModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  shippingStatusId: number;
  sellerName?: string;
  isSeller?: boolean;
}

const OnlineTrackingModal: React.FC<OnlineTrackingModalProps> = ({
  visible,
  onClose,
  orderId,
  shippingStatusId,
  sellerName = "Seller",
  isSeller = false,
}) => {
  const { t } = useI18n();

  /**
   * Fetch shipping tracking with dynamic events using React Query
   * Leverages caching and automatic refetching for real-time updates
   * @section Asynchronous Operations - Uses React Query with proper error handling
   */
  const {
    data: trackingResponse,
    isLoading,
    error: queryError,
    refetch,
  } = useShippingTracking(orderId, visible && !!orderId);

  const trackingData = trackingResponse?.data || null;
  const error = queryError ? t('trackParcel.errorFetchingDetails') : null;

  useEffect(() => {
    if (visible && orderId) {
      refetch();
    }
  }, [visible, orderId, refetch]);

  /**
   * Extract tracking code from API response
   * Priority: tracking codes array > tracking label codes > order ID
   */
  const trackingCode = useMemo(() => {
    if (trackingData?.trackingCodes && trackingData.trackingCodes.length > 0) {
      return trackingData.trackingCodes[0];
    }
    if (trackingData?.shippingLabel?.trackingCodes && 
        trackingData.shippingLabel.trackingCodes.length > 0) {
      return trackingData.shippingLabel.trackingCodes[0];
    }
    return orderId || "N/A";
  }, [trackingData, orderId]);

  /**
   * Extract tracking URL from API response
   */
  const trackingUrl = useMemo(() => {
    if (trackingData?.shippingLabel?.trackingUrls && 
        trackingData.shippingLabel.trackingUrls.length > 0) {
      return trackingData.shippingLabel.trackingUrls[0];
    }
    return null;
  }, [trackingData]);

  /**
   * Get courier/delivery service name from API response
   */
  const courierName = useMemo(() => {
    return trackingData?.shippingProvider || 
           trackingData?.shippingLabel?.courier || 
           "N/A";
  }, [trackingData]);

  /**
   * Format estimated delivery time from API response
   */
  const estimatedDeliveryTime = useMemo(() => {
    if (trackingData?.shippingService?.duration) {
      return trackingData.shippingService.duration;
    }
    
    if (trackingData?.estimatedDeliveryDate) {
      const date = new Date(trackingData.estimatedDeliveryDate);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    return "N/A";
  }, [trackingData]);

  /**
   * Get seller/buyer name from API response
   */
  const displayName = useMemo(() => {
    return trackingData?.sellerName || sellerName;
  }, [trackingData, sellerName]);

  /**
   * Extract tracking events from API response
   * These are dynamic events that come from the backend
   */
  const trackingEvents = useMemo(() => {
    return trackingData?.orderTracking?.trackingEvents || [];
  }, [trackingData]);


  /**
   * Check if package is delivered
   * Last event has happened and status indicates delivery
   */
  const isDelivered = useMemo(() => {
    if (trackingEvents.length === 0) return false;
    
    const lastEvent = trackingEvents[trackingEvents.length - 1];
    const allEventsCompleted = trackingEvents.every(e => e.hasHappened);
    const deliveryStatuses = ['delivered', 'completed', 'received'];
    const hasDeliveryStatus = deliveryStatuses.some(status => 
      lastEvent.status.toLowerCase().includes(status)
    );
    
    return allEventsCompleted || (lastEvent.hasHappened && hasDeliveryStatus);
  }, [trackingEvents]);

  /**
   * Copy tracking code to clipboard
   * @section User Interaction - Provides feedback on action
   */
  const handleCopyTrackingCode = useCallback(() => {
    Clipboard.setString(trackingCode);
    Alert.alert(
      t('trackParcel.copied'), 
      t('trackParcel.trackingCodeCopied')
    );
  }, [trackingCode, t]);

  /**
   * Open external tracking URL
   * @section User Interaction - Opens courier tracking page in browser
   */
  const handleOpenTrackingUrl = useCallback(async () => {
    if (!trackingUrl) {
      Alert.alert(
        t('trackParcel.noTrackingUrl'),
        t('trackParcel.noTrackingUrlDesc')
      );
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(trackingUrl);
      if (canOpen) {
        await Linking.openURL(trackingUrl);
      } else {
        Alert.alert(
          t('trackParcel.errorOpeningUrl'),
          t('trackParcel.invalidTrackingUrl')
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error opening tracking URL:", error);
      }
      Alert.alert(
        t('trackParcel.errorOpeningUrl'),
        t('trackParcel.tryAgainLater')
      );
    }
  }, [trackingUrl, t]);

  /**
   * Handle package received confirmation
   * @section User Interaction - Validates delivery status before confirmation
   */
  const handleGotPackage = useCallback(() => {
    if (!isDelivered) {
      Alert.alert(
        t('trackParcel.packageNotDeliveredYet'),
        t('trackParcel.confirmOnceDelivered')
      );
      return;
    }
    
    // TODO: Call API to confirm delivery
    Alert.alert(
      t('trackParcel.packageReceived'),
      t('trackParcel.thankYouConfirming')
    );
  }, [isDelivered, t]);

  /**
   * Handle report issue action
   */
  const handleReportIssue = useCallback(() => {
    // TODO: Navigate to report issue or open report flow
    Alert.alert(t('trackParcel.reportIssue'), t('trackParcel.reportIssueDesc'));
  }, [t]);

  /**
   * Generate dynamic tracking steps from API events
   * Converts backend tracking events to vertical stepper format
   * @section Performance - Memoized to prevent unnecessary recalculations
   */
  const trackingSteps: VerticalStepperStep[] = useMemo(() => {
    if (trackingEvents.length === 0) {
      return [];
    }

    return trackingEvents.map((event, index) => ({
      key: event.id || `step-${index}`,
      indicatorColor: event.hasHappened ? '#FF3B4A' : '#D3D6DA',
      renderContent: () => (
        <View>
          <Text 
            style={[
              styles.stepTitle,
              !event.hasHappened && styles.stepTitleInactive
            ]}
          >
            {event.title}
          </Text>
          <Text 
            style={[
              styles.stepDescription,
              !event.hasHappened && styles.stepDescriptionInactive
            ]}
          >
            {event.summary}
          </Text>
          {event.hasHappened && event.createdOn && (
            <Text style={styles.stepTimestamp}>
              {new Date(event.createdOn).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
      ),
    }));
  }, [trackingEvents]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('trackParcel.title')}</Text>
              <Pressable 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={24} color="#07090C" />
              </Pressable>
            </View>

            <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: 0 }] }>
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonLabel}><LineLoader /></View>
                  <View style={styles.skeletonValue}><LineLoader /></View>
                </View>
                <View style={styles.skeletonButton}><LineLoader /></View>
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonLabel}><LineLoader /></View>
                  <View style={styles.skeletonValue}><LineLoader /></View>
                </View>
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonLabel}><LineLoader /></View>
                  <View style={styles.skeletonValue}><LineLoader /></View>
                </View>
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonLabel}><LineLoader /></View>
                  <View style={styles.skeletonSmallValue}><LineLoader /></View>
                </View>
              </View>

              <View style={styles.skeletonCard}>
                <View style={[styles.skeletonTitleLine]}><LineLoader /></View>
                <View style={[styles.skeletonSubtitleLine]}><LineLoader /></View>
                <View style={styles.skeletonStepLine}><LineLoader /></View>
                <View style={styles.skeletonStepLine}><LineLoader /></View>
                <View style={styles.skeletonStepLine}><LineLoader /></View>
                <View style={styles.skeletonStepLine}><LineLoader /></View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }

  /**
   * Render error state
   */
  if (error || !trackingData) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B4A" />
            <Text style={styles.errorText}>{error || t('trackParcel.noData')}</Text>
            <Pressable 
              style={styles.retryButton} 
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text style={styles.retryButtonText}>{t('common.close')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('trackParcel.title')}</Text>
            <Pressable 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Ionicons name="close" size={24} color="#07090C" />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.mainContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          {/* Parcel Information Card */}
          <View style={styles.parcelInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('trackParcel.trackingCode')}</Text>
              <View style={styles.trackingCodeContainer}>
                <Text 
                  style={styles.trackingCodeValue} 
                  numberOfLines={1} 
                  ellipsizeMode="middle"
                >
                  {trackingCode}
                </Text>
                <Pressable 
                  style={styles.copyButton} 
                  onPress={handleCopyTrackingCode}
                  accessibilityRole="button"
                  accessibilityLabel={t('trackParcel.copyTrackingCode')}
                >
                  <Ionicons name="copy-outline" size={16} color="#FF3B4A" />
                </Pressable>
              </View>
            </View>

            {/* External Tracking Link */}
            {trackingUrl && (
              <Pressable 
                style={styles.trackingLinkButton}
                onPress={handleOpenTrackingUrl}
                accessibilityRole="button"
                accessibilityLabel={t('trackParcel.viewTrackingOnline')}
              >
                <View style={styles.trackingLinkContent}>
                  <Ionicons name="link-outline" size={18} color="#FF3B4A" />
                  <Text style={styles.trackingLinkText}>
                    {t('trackParcel.viewTrackingOnline')}
                  </Text>
                  <Ionicons name="open-outline" size={16} color="#FF3B4A" />
                </View>
              </Pressable>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {isSeller ? t('trackParcel.buyer') : t('trackParcel.seller')}
              </Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {displayName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('trackParcel.courier')}</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {courierName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('trackParcel.deliveringIn')}</Text>
              <Text style={styles.infoValue}>
                {estimatedDeliveryTime}
              </Text>
            </View>
          </View>

          {/* Tracking Details Card */}
          <View style={styles.trackingDetailsCard}>
            <Text style={styles.trackingDetailsTitle}>
              {t('trackParcel.trackingDetails')}
            </Text>
            <Text style={styles.trackingInstructions}>
              {t('trackParcel.trackingInstructions')}
            </Text>

            <VerticalStepper
              steps={trackingSteps}
              containerStyle={styles.stepperContainer}
            />

            {/* Action Buttons */}
            {!isSeller && (
              <View style={styles.actionButtonsContainer}>
                <Pressable 
                  style={[
                    styles.gotPackageButton,
                    !isDelivered && styles.gotPackageButtonDisabled
                  ]} 
                  onPress={handleGotPackage}
                  disabled={!isDelivered}
                  accessibilityRole="button"
                  accessibilityLabel={t('trackParcel.gotPackage')}
                  accessibilityState={{ disabled: !isDelivered }}
                >
                  <Text style={[
                    styles.gotPackageButtonText,
                    !isDelivered && styles.gotPackageButtonTextDisabled
                  ]}>
                    {t('trackParcel.gotPackage')}
                  </Text>
                </Pressable>

                <Pressable 
                  style={styles.reportIssueButton} 
                  onPress={handleReportIssue}
                  accessibilityRole="button"
                  accessibilityLabel={t('trackParcel.reportIssue')}
                >
                  <Text style={styles.reportIssueButtonText}>
                    {t('trackParcel.reportIssue')}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

/**
 * Styles following the coding guide
 * @section Styling - Uses StyleSheet.create for performance
 * @section Design System - Follows app color palette and typography
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#464F5D',
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skeletonLabel: {
    width: '40%',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonValue: {
    width: '45%',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonSmallValue: {
    width: '30%',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonButton: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE5E7',
    backgroundColor: '#FFF5F6',
  },
  skeletonTitleLine: {
    width: '60%',
    height: 18,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  skeletonSubtitleLine: {
    width: '100%',
    height: 16,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonStepLine: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9EAEB',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#464F5D',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAEB',
    minHeight: 56,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    color: '#07090C',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  parcelInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#464F5D',
    fontFamily: 'DMSans-Medium',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#464F5D',
    fontFamily: 'DMSans-Medium',
    textAlign: 'right',
    flex: 1,
  },
  trackingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: '65%',
  },
  trackingCodeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B4A',
    fontFamily: 'DMSans-Medium',
    flexShrink: 1,
  },
  copyButton: {
    padding: 4,
  },
  trackingLinkButton: {
    backgroundColor: '#FFF5F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE5E7',
  },
  trackingLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trackingLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B4A',
    fontFamily: 'DMSans-Medium',
  },
  trackingDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#07090C',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  trackingInstructions: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FF3B4A',
    fontFamily: 'DMSans-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  stepperContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#07090C',
    fontFamily: 'DMSans-Bold',
    marginBottom: 4,
  },
  stepTitleInactive: {
    color: '#99A1AB',
  },
  stepDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#464F5D',
    fontFamily: 'DMSans-Regular',
    lineHeight: 20,
  },
  stepDescriptionInactive: {
    color: '#99A1AB',
  },
  stepTimestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: '#99A1AB',
    fontFamily: 'DMSans-Regular',
    marginTop: 4,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  gotPackageButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotPackageButtonDisabled: {
    backgroundColor: '#E9EAEB',
    opacity: 0.6,
  },
  gotPackageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'DMSans-Medium',
  },
  gotPackageButtonTextDisabled: {
    color: '#99A1AB',
  },
  reportIssueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  reportIssueButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B4A',
    fontFamily: 'DMSans-Medium',
  },
});

export default memo(OnlineTrackingModal);

