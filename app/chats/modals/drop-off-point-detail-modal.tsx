/**
 * Drop-off Point Detail Modal
 * 
 * Displays detailed information about a selected drop-off point including:
 * - Multiple addresses
 * - Business hours
 * - Contact information
 * - Action buttons for directions and calling
 * 
 * Following Coding.md guidelines:
 * - Functional component with TypeScript
 * - Performance optimizations with useCallback and React.memo
 * - Accessibility labels and roles
 * - StyleSheet.create for styling
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IDropOffPoint } from '@services/features/orders/models';
import { SkeletonBox } from '@components/purchase/SkeletonComponents';

interface DropOffPointDetailModalProps {
  visible: boolean;
  onClose: () => void;
  dropOffPoint: IDropOffPoint | null;
  onConfirm?: () => void;
}

interface BusinessHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

const DropOffPointDetailModal: React.FC<DropOffPointDetailModalProps> = ({
  visible,
  onClose,
  dropOffPoint,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Simulate loading state only on first open, not on content changes
  useEffect(() => {
    if (visible && dropOffPoint) {
      // Only show skeleton on first load or when modal reopens after being closed
      if (!hasLoadedOnce) {
        setIsLoading(true);
        // Short delay to show skeleton
        const timer = setTimeout(() => {
          setIsLoading(false);
          setHasLoadedOnce(true);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        // Modal is already open, just update content without loading state
        setIsLoading(false);
      }
    } else if (!visible) {
      // Reset when modal closes
      setHasLoadedOnce(false);
    }
  }, [visible, dropOffPoint, hasLoadedOnce]);

  // Parse business hours
  const businessHours = useMemo<BusinessHour[]>(() => {
    if (!dropOffPoint?.businessHours) return [];

    try {
      if (typeof dropOffPoint.businessHours === 'string') {
        const parsed = JSON.parse(dropOffPoint.businessHours);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return Array.isArray(dropOffPoint.businessHours)
        ? dropOffPoint.businessHours
        : [dropOffPoint.businessHours];
    } catch (error) {
      console.error('Error parsing business hours:', error);
      return [];
    }
  }, [dropOffPoint?.businessHours]);

  // Format business hours display
  const formatBusinessHours = useCallback(() => {
    if (businessHours.length === 0) return null;

    // Group hours by similar times
    const hoursMap: { [key: string]: string[] } = {};
    businessHours.forEach((hour) => {
      const timeRange = `${hour.openTime} - ${hour.closeTime}`;
      if (!hoursMap[timeRange]) {
        hoursMap[timeRange] = [];
      }
      hoursMap[timeRange].push(hour.dayOfWeek?.substring(0, 3) || '');
    });

    return Object.entries(hoursMap);
  }, [businessHours]);

  const formattedHours = useMemo(() => formatBusinessHours(), [formatBusinessHours]);

  const handleGetDirections = useCallback(() => {
    if (!dropOffPoint) return;

    const address = typeof dropOffPoint.address === 'string'
      ? dropOffPoint.address
      : (dropOffPoint.address?.address1 || '');
    const encodedAddress = encodeURIComponent(address);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
      });
    }
  }, [dropOffPoint]);

  const handleCall = useCallback(() => {
    if (!dropOffPoint?.phone) return;

    const phoneUrl = `tel:${dropOffPoint.phone}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      }
    });
  }, [dropOffPoint?.phone]);

  if (!dropOffPoint) return null;

  const renderSkeleton = () => (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#212B36" />
        </TouchableOpacity>
        <SkeletonBox width={150} height={18} />
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Address 1 Skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={80} height={16} marginBottom={8} />
          <SkeletonBox width="90%" height={14} marginBottom={4} />
          <SkeletonBox width="70%" height={14} />
        </View>

        {/* Address 2 Skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={80} height={16} marginBottom={8} />
          <SkeletonBox width="80%" height={14} />
        </View>

        {/* Business Hours Skeleton */}
        <View style={styles.section}>
          <SkeletonBox width={120} height={16} marginBottom={12} />
          <View style={styles.businessHoursGrid}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.hourTag}>
                <SkeletonBox width="100%" height={12} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons Skeleton */}
      <View style={styles.actionContainer}>
        <SkeletonBox width="75%" height={52} borderRadius={8} />
        <SkeletonBox width={52} height={52} borderRadius={8} />
      </View>
    </SafeAreaView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {isLoading ? renderSkeleton() : (
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color="#212B36" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{dropOffPoint.name}</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Address 1 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address1</Text>
              <Text style={styles.sectionContent}>
                {typeof dropOffPoint.address === 'string'
                  ? dropOffPoint.address
                  : (dropOffPoint.address?.address1 || 'N/A')}
              </Text>
            </View>

            {/* Address 2 */}
            {((typeof dropOffPoint.address === 'object' && dropOffPoint.address?.address2) || dropOffPoint.address2) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address2</Text>
                <Text style={styles.sectionContent}>
                  {typeof dropOffPoint.address === 'object'
                    ? dropOffPoint.address?.address2
                    : dropOffPoint.address2}
                </Text>
              </View>
            )}

            {/* Business Hours */}
            {formattedHours && formattedHours.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Hours</Text>
                <View style={styles.businessHoursGrid}>
                  {formattedHours.map(([timeRange, days], index) => (
                    <View key={index} style={styles.businessHourItem}>
                      {days.map((day, dayIndex) => (
                        <View key={dayIndex} style={styles.hourTag}>
                          <Text style={styles.hourText}>
                            {day}: {timeRange}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {onConfirm && (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={onConfirm}
                accessibilityRole="button"
                accessibilityLabel="Select this drop-off point"
              >
                <Text style={styles.selectButtonText}>Select This Location</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleGetDirections}
                accessibilityRole="button"
                accessibilityLabel="Get directions to this location"
              >
                <Ionicons name="location-outline" size={20} color="#FF6F61" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>

              {dropOffPoint.phone && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCall}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${dropOffPoint.phone}`}
                >
                  <Ionicons name="call-outline" size={24} color="#FF6F61" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#212B36',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: '#637381',
    lineHeight: 20,
  },
  businessHoursGrid: {
    gap: 8,
  },
  businessHourItem: {
    gap: 8,
  },
  hourTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  hourText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: '#212B36',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectButton: {
    backgroundColor: '#FF6F61',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FF6F61',
  },
  directionsButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#FF6F61',
  },
  callButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FF6F61',
  },
});

export default React.memo(DropOffPointDetailModal);

