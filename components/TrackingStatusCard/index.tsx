import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import { useI18n } from "@hooks/use-i18n";

interface TrackingStatusCardProps {
  shippingStatusId: number;
  isSeller: boolean;
  courierName?: string;
  shippingProvider?: string;
  estimatedDeliveryTime?: string;
  trackingCode?: string;
  shippingStatus?: string;
  onTrackingPress: () => void;
}

const TrackingStatusCard = ({
  shippingStatusId,
  isSeller,
  courierName,
  shippingProvider,
  estimatedDeliveryTime,
  trackingCode,
  shippingStatus,
  onTrackingPress,
}: TrackingStatusCardProps) => {
  const { t } = useI18n();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getStatusText = useCallback(() => {
    const normalizedStatus = typeof shippingStatus === 'string' ? shippingStatus.trim() : '';
    if (normalizedStatus) {
      return normalizedStatus;
    }
    if (shippingStatusId === 3) {
      return t('tracking.inTransit');
    }
    return t('tracking.orderShipped');
  }, [shippingStatus, shippingStatusId, t]);

  const getDescription = useCallback(() => {
    if (isSeller) {
      return t('tracking.sellerDescription');
    }
    return t('tracking.buyerDescription');
  }, [isSeller, t]);

  const getTruncatedDescription = useCallback(() => {
    const fullDescription = getDescription();
    const maxLength = 80;
    if (fullDescription.length <= maxLength) {
      return fullDescription;
    }
    return fullDescription.substring(0, maxLength) + '...';
  }, [getDescription]);

  const displayCourier = courierName || shippingProvider;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{getStatusText()}</Text>
        
        <Text style={styles.description}>
          {isExpanded ? getDescription() : getTruncatedDescription()}
        </Text>
        
        {getDescription().length > 80 && (
          <Pressable 
            style={({ pressed }) => [
              styles.viewMoreButton,
              pressed && styles.viewMoreButtonPressed,
            ]} 
            onPress={() => setIsExpanded(!isExpanded)}
            accessibilityLabel={isExpanded ? "View less" : "View more"}
            accessibilityRole="button"
          >
            <Text style={styles.viewMoreText}>
              {isExpanded ? "View less" : "View more"}
            </Text>
          </Pressable>
        )}
        
        {isExpanded && (
          <>
            {displayCourier && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('tracking.courier')}:</Text>
                <Text style={styles.infoValue}>{displayCourier}</Text>
              </View>
            )}
            
            {estimatedDeliveryTime && estimatedDeliveryTime !== "N/A" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('tracking.estimatedDelivery')}:</Text>
                <Text style={styles.infoValue}>{estimatedDeliveryTime}</Text>
              </View>
            )}
            
            {trackingCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('tracking.trackingNumber')}:</Text>
                <Text style={styles.infoValue}>{trackingCode}</Text>
              </View>
            )}
          </>
        )}
        
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]} 
          onPress={onTrackingPress}
          accessibilityLabel={t('tracking.viewTrackingAccessibility')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {t('tracking.trackingInformation')}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F6F7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EAEB',
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    color: '#07090C',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#464F5D',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: '#6B7280',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#07090C',
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderColor: '#212C3D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(33, 44, 61, 0.05)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#212C3D',
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  viewMoreButtonPressed: {
    opacity: 0.7,
  },
  viewMoreText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#FF3B4A',
    textDecorationLine: 'underline',
  },
});

export default memo(TrackingStatusCard, (prevProps, nextProps) => {
  return (
    prevProps.shippingStatusId === nextProps.shippingStatusId &&
    prevProps.isSeller === nextProps.isSeller &&
    prevProps.courierName === nextProps.courierName &&
    prevProps.shippingProvider === nextProps.shippingProvider &&
    prevProps.estimatedDeliveryTime === nextProps.estimatedDeliveryTime &&
    prevProps.trackingCode === nextProps.trackingCode &&
    prevProps.shippingStatus === nextProps.shippingStatus
  );
});

