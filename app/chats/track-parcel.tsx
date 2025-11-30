import React, { useCallback, useEffect, useMemo } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  StatusBar,
  Clipboard,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StackHeader from "@components/StackHeader";
import VerticalStepper, { VerticalStepperStep } from "@components/VerticalStepper";
import LineLoader from "@components/LineLoader";
import { useI18n } from "@hooks/use-i18n";
import { useShippingTracking } from "@hooks/use-shipping-tracking";

const TrackParcel: React.FC = React.memo(() => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const orderId = (params.orderId as string) || "";
  
  // Fetch dynamic tracking data
  const {
    data: trackingResponse,
    isLoading,
    error: queryError,
    refetch,
  } = useShippingTracking(orderId, !!orderId);

  const trackingData = trackingResponse?.data || null;
  const error = queryError ? t('trackParcel.errorFetchingDetails') : null;

  useEffect(() => {
    if (orderId) {
      refetch();
    }
  }, [orderId, refetch]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  // Extract tracking code
  const trackingCode = useMemo(() => {
    if (trackingData?.trackingCodes && trackingData.trackingCodes.length > 0) {
      return trackingData.trackingCodes[0];
    }
    if (trackingData?.shippingLabel?.trackingCodes && 
        trackingData.shippingLabel.trackingCodes.length > 0) {
      return trackingData.shippingLabel.trackingCodes[0];
    }
    return (params.requestId as string) || orderId || "N/A";
  }, [trackingData, params.requestId, orderId]);

  // Extract tracking URL
  const trackingUrl = useMemo(() => {
    if (trackingData?.shippingLabel?.trackingUrls && 
        trackingData.shippingLabel.trackingUrls.length > 0) {
      return trackingData.shippingLabel.trackingUrls[0];
    }
    return null;
  }, [trackingData]);

  // Get courier name
  const courierName = useMemo(() => {
    return trackingData?.shippingProvider || 
           trackingData?.shippingLabel?.courier || 
           (params.courierName as string) || "N/A";
  }, [trackingData, params.courierName]);

  // Format estimated delivery time
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
    
    return (params.estimatedDeliveryTime as string) || "N/A";
  }, [trackingData, params.estimatedDeliveryTime]);

  // Get seller name
  const sellerName = useMemo(() => {
    return trackingData?.sellerName || (params.sellerName as string) || "Seller";
  }, [trackingData, params.sellerName]);

  // Extract tracking events
  const trackingEvents = useMemo(() => {
    return trackingData?.orderTracking?.trackingEvents || [];
  }, [trackingData]);

  // Check if package is delivered
  const isDelivered = useMemo(() => {
    // If we have events, use them to determine status
    if (trackingEvents.length > 0) {
      const lastEvent = trackingEvents[trackingEvents.length - 1];
      const allEventsCompleted = trackingEvents.every(e => e.hasHappened);
      const deliveryStatuses = ['delivered', 'completed', 'received'];
      const hasDeliveryStatus = deliveryStatuses.some(status => 
        lastEvent.status.toLowerCase().includes(status)
      );
      
      return allEventsCompleted || (lastEvent.hasHappened && hasDeliveryStatus);
    }
    
    // Fallback to params if no events (backward compatibility)
    const shippingStatusId = params.shippingStatusId as string;
    if (shippingStatusId) {
      const statusId = parseInt(shippingStatusId, 10);
      return statusId >= 4;
    }
    
    return false;
  }, [trackingEvents, params.shippingStatusId]);

  const handleCopyTrackingCode = useCallback(() => {
    Clipboard.setString(trackingCode);
    Alert.alert(t('trackParcel.copied'), t('trackParcel.trackingCodeCopied'));
  }, [trackingCode, t]);

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

  const handleGotPackage = useCallback(() => {
    if (!isDelivered) {
      Alert.alert(
        t('trackParcel.packageNotDeliveredYet'), 
        t('trackParcel.confirmOnceDelivered')
      );
      return;
    }
    // TODO: Handle package received confirmation (API call)
    Alert.alert(t('trackParcel.packageReceived'), t('trackParcel.thankYouConfirming'));
  }, [isDelivered, t]);

  const handleReportIssue = useCallback(() => {
    // TODO: Navigate to report issue page
    router.push("/chats/report-issue");
  }, []);

  const trackingSteps: VerticalStepperStep[] = useMemo(() => {
    if (trackingEvents.length > 0) {
      return trackingEvents.map((event, index) => ({
        key: event.id || `step-${index}`,
        indicatorColor: event.hasHappened ? '#FF3B4A' : '#D3D6DA',
        renderContent: () => (
          <View>
            <Text style={[
              styles.stepTitle,
              !event.hasHappened && styles.stepTitleInactive
            ]}>
              {event.title}
            </Text>
            <Text style={[
              styles.stepDescription,
              !event.hasHappened && styles.stepDescriptionInactive
            ]}>
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
    }

    // Fallback for legacy/manual data if no events from API
    const shippingStatusId = (params.shippingStatusId as string) || "2";
    const currentStepIndex = (() => {
      const statusId = parseInt(shippingStatusId, 10);
      if (statusId >= 4) return 2; // Delivered
      if (statusId >= 3) return 1; // In Transit
      if (statusId >= 2) return 0; // Shipped
      return 0; // Default to shipped
    })();

    return [
      {
        key: 'shipped',
        indicatorColor: currentStepIndex >= 0 ? '#FF3B4A' : '#D3D6DA',
        renderContent: () => (
          <View>
            <Text style={[
              styles.stepTitle,
              currentStepIndex < 0 && styles.stepTitleInactive
            ]}>
              {t('trackParcel.orderShipped')}
            </Text>
            <Text style={[
              styles.stepDescription,
              currentStepIndex < 0 && styles.stepDescriptionInactive
            ]}>
              {t('trackParcel.orderShippedDesc')}
            </Text>
          </View>
        ),
      },
      {
        key: 'transit',
        indicatorColor: currentStepIndex >= 1 ? '#FF3B4A' : '#D3D6DA',
        renderContent: () => (
          <View>
            <Text style={[
              styles.stepTitle,
              currentStepIndex < 1 && styles.stepTitleInactive
            ]}>
              {t('trackParcel.inTransit')}
            </Text>
            <Text style={[
              styles.stepDescription,
              currentStepIndex < 1 && styles.stepDescriptionInactive
            ]}>
              {t('trackParcel.inTransitDesc')}
            </Text>
          </View>
        ),
      },
      {
        key: 'delivered',
        indicatorColor: currentStepIndex >= 2 ? '#FF3B4A' : '#D3D6DA',
        renderContent: () => (
          <View>
            <Text style={[
              styles.stepTitle,
              currentStepIndex < 2 && styles.stepTitleInactive
            ]}>
              {t('trackParcel.delivered')}
            </Text>
            <Text style={[
              styles.stepDescription,
              currentStepIndex < 2 && styles.stepDescriptionInactive
            ]}>
              {t('trackParcel.deliveredDesc')}
            </Text>
          </View>
        ),
      },
    ];
  }, [trackingEvents, params.shippingStatusId, t]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <StackHeader
          title={t('trackParcel.title')}
          onPress={handleGoBack}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonCard}>
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
              <View style={styles.skeletonValue}><LineLoader /></View>
            </View>
          </View>
          
          <View style={styles.skeletonCard}>
             <View style={styles.skeletonTitleLine}><LineLoader /></View>
             <View style={styles.skeletonStepLine}><LineLoader /></View>
             <View style={styles.skeletonStepLine}><LineLoader /></View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !trackingData && !params.requestId) { // Only show error if no fallback data
     return (
      <SafeAreaView style={styles.container}>
        <StackHeader title={t('trackParcel.title')} onPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B4A" />
          <Text style={styles.errorText}>{error || t('trackParcel.noData')}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>{t('common.retry') || "Retry"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <StackHeader
        title={t('trackParcel.title')}
        onPress={handleGoBack}
      />
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Parcel Information Card */}
        <View style={styles.parcelInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('trackParcel.trackingCode')}</Text>
            <View style={styles.trackingCodeContainer}>
              <Text style={styles.trackingCodeValue} numberOfLines={1} ellipsizeMode="middle">
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
            <Text style={styles.infoLabel}>{t('trackParcel.seller')}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {sellerName}
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
          <Text style={styles.trackingDetailsTitle}>{t('trackParcel.trackingDetails')}</Text>
          <Text style={styles.trackingInstructions}>
            {t('trackParcel.trackingInstructions')}
          </Text>
          
          <VerticalStepper
            steps={trackingSteps}
            containerStyle={styles.stepperContainer}
          />
          
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
              <Text style={styles.reportIssueButtonText}>{t('trackParcel.reportIssue')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

TrackParcel.displayName = 'TrackParcel';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
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
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    justifyContent: 'space-between',
    gap: 16,
  },
  skeletonLabel: {
    width: '30%',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonValue: {
    width: '40%',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonTitleLine: {
    width: '60%',
    height: 20,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonStepLine: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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

export default TrackParcel;


