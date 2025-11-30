import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';

import StackHeader from '../../components/StackHeader';
import CustomButton from '../../components/CustomButton';
import ShippingTopCard from '../../components/ShippingTopCard';
import ShippingAddressCard from '../../components/ShippingAddressCard';
import ShippingContactCard from '../../components/ShippingContactCard';
import { useAppSelector } from '../../redux/store';
import { useShippingStore } from '../../stores/shippingStore';
import { capitalizeSentences, parseAddressForSubmission } from '../../utils/address-parser';
import { capitalizeFirstLetter } from '../../helper/capiterlize-first-letter';
import EditContactPhoneModal from './modals/edit-contact-phone-modal';
import EditReturnAddressModal from './modals/edit-return-address-modal';
import ShippingDropOffCard from '@components/ShippingDropOffCard';
import DropOffPointsListModal from './modals/drop-off-points-list-modal';
import { IDropOffPoint } from '@services/features/orders/models';
import { SkeletonBox } from '@components/purchase/SkeletonComponents';

const ConfirmShippingDetailsScreen = () => {
  const { orderId } = useLocalSearchParams<{
    orderId: string;
    requestId?: string;
    labelType?: 'printable' | 'digital';
  }>();
  
  const router = useRouter();
  const toast = useToast();
  const { profile } = useAppSelector((state) => state.userProfileSlice);

  // Zustand store
  const {
    shippingLabel,
    initializeShippingLabel,
    fetchShippingDetailsForLabel,
    submitShippingLabel,
    clearShippingLabel,
    updateShippingLabelContactPhone,
    updateShippingLabelReturnAddress,
    updateShippingLabelDropOffPoint,
  } = useShippingStore();

  // Local state for modals
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isDropOffListModalVisible, setIsDropOffListModalVisible] = useState(false);

  // Computed values using useMemo
  const shippingDetails = useMemo(() => shippingLabel.shippingDetails, [shippingLabel.shippingDetails]);

  // Initialize and fetch data on mount
  useEffect(() => {
    if (orderId) {
      initializeShippingLabel(orderId);
      fetchShippingDetailsForLabel(orderId).catch((error: any) => {
        toast.show(error?.message || 'Failed to load shipping details', {
          type: 'danger',
          duration: 4000,
        });
      });
    }

    // Cleanup on unmount
    return () => {
      clearShippingLabel();
    };
    // Dependencies are intentionally minimal to avoid re-running on every store change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Pre-populate drop-off point, contact phone, and return address when shipping details are loaded
  useEffect(() => {
    if (shippingDetails && !shippingLabel.dropOffPointId) {
      // Pre-populate drop-off point if shipFrom is a DropOffAddress
      if (shippingDetails.shipFrom?.type === 'DropOffAddress' && 
          shippingDetails.shipFrom.addressId && 
          shippingDetails.shipFrom.name) {
        updateShippingLabelDropOffPoint(
          shippingDetails.shipFrom.addressId, 
          shippingDetails.shipFrom.name
        );
      }
    }

    if (shippingDetails && !shippingLabel.updatedContactPhone) {
      // Pre-populate contact phone from top-level or shipFrom
      const phoneNumber = shippingDetails.contactPhoneNumber || shippingDetails.shipFrom?.phone;
      if (phoneNumber) {
        updateShippingLabelContactPhone(phoneNumber);
      }
    }

    if (shippingDetails && !shippingLabel.updatedReturnAddress && shippingDetails.shipFrom) {
      // Pre-populate return address from shipFrom
      const shipFrom = shippingDetails.shipFrom;
      const address1 = shipFrom.address1 || '';
      
      // Parse address1 to extract street number and street name using existing utility
      const { streetNumber, streetName } = parseAddressForSubmission(address1);
      
      // Use location name from API and capitalize to match dropdown format
      const location = capitalizeFirstLetter(shipFrom.location || '');
      // For countryId, prefer profile countryId, then API countryId
      const countryId = profile?.countryId || shipFrom.countryId || '';
      
      if (streetNumber && streetName && location && countryId) {
        updateShippingLabelReturnAddress({
          streetNumber,
          streetName,
          location,
          countryId,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingDetails]);

  const shippingProviderName = useMemo(() => {
    return shippingDetails?.shippingProvider || '24/7 InPost Locker | Shop Pick-up';
  }, [shippingDetails]);

  const returnAddressDisplay = useMemo(() => {
    if (shippingLabel.updatedReturnAddress) {
      const { streetNumber, streetName } = shippingLabel.updatedReturnAddress;
      return `${streetNumber} ${streetName}`.trim();
    }
    return shippingDetails?.shipFrom?.address1 || 'No return address provided';
  }, [shippingLabel.updatedReturnAddress, shippingDetails]);

  const returnAddressCity = useMemo(() => {
    if (shippingLabel.updatedReturnAddress?.location) {
      return shippingLabel.updatedReturnAddress.location;
    }
    // Combine address2 (city) and postcode for display
    const address2 = shippingDetails?.shipFrom?.address2 || '';
    const postcode = shippingDetails?.shipFrom?.postcode?.toUpperCase() || '';
    return address2 && postcode ? `${address2}, ${postcode}` : address2 || postcode;
  }, [shippingLabel.updatedReturnAddress, shippingDetails]);

  const returnAddressName = useMemo(() => {
    return capitalizeSentences(shippingDetails?.shipFrom?.name) || 
           `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
  }, [shippingDetails, profile]);

  const contactPhone = useMemo(() => {
    return shippingLabel.updatedContactPhone || 
           shippingDetails?.contactPhoneNumber ||
           shippingDetails?.shipFrom?.phone || 
           'No phone number provided';
  }, [shippingLabel.updatedContactPhone, shippingDetails]);

  const recipientName = useMemo(() => {
    return capitalizeSentences(shippingDetails?.shipTo?.name) || 'Recipient';
  }, [shippingDetails]);

  const recipientAddress = useMemo(() => {
    const address1 = capitalizeSentences(shippingDetails?.shipTo?.address1) || '';
    const address2 = capitalizeSentences(shippingDetails?.shipTo?.address2) || '';
    const postcode = shippingDetails?.shipTo?.postcode?.toUpperCase() || '';
    const location = capitalizeSentences(shippingDetails?.shipTo?.location) || '';
    
    if (!address1 && !address2 && !postcode) {
      return 'This address is automatically added to the shipping label.';
    }
    
    // Build address string with available components
    const addressParts = [address1, address2, location, postcode].filter(Boolean);
    return addressParts.join('\n');
  }, [shippingDetails]);

  const dropOffPointTitle = useMemo(() => {
    if (shippingLabel.dropOffPointName) {
      return `See drop-off points - ${shippingLabel.dropOffPointName}`;
    }
    return 'See drop-off points';
  }, [shippingLabel.dropOffPointName]);

  // Check if shipping label already exists
  const existingLabel = useMemo(() => {
    return shippingDetails?.shippingLabel;
  }, [shippingDetails]);

  const isLabelAlreadyCreated = useMemo(() => {
    return existingLabel?.status === 'Active' || !!existingLabel?.shippingLabelResourceUrl;
  }, [existingLabel]);

  // Event handlers using useCallback
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditContact = useCallback(() => {
    setIsContactModalVisible(true);
  }, []);

  const handleEditReturnAddress = useCallback(() => {
    setIsAddressModalVisible(true);
  }, []);

  const handleOpenDropOffList = useCallback(() => {
    setIsDropOffListModalVisible(true);
  }, []);

  const handleSelectDropOffPoint = useCallback((point: IDropOffPoint) => {
    // Update the store with the selected drop-off point
    if (point.id && point.name) {
      updateShippingLabelDropOffPoint(point.id, point.name);
    }
    // Close the modal
    setIsDropOffListModalVisible(false);
  }, [updateShippingLabelDropOffPoint]);

  const handleGetLabel = useCallback(async () => {
    try {
      // If label already exists, navigate back or show message
      if (isLabelAlreadyCreated) {
        toast.show('Shipping label already exists for this order', {
          type: 'info',
          duration: 3000,
        });
        router.back();
        return;
      }

      // Validation
      if (!shippingLabel.dropOffPointId) {
        toast.show('Please select a drop-off point', {
          type: 'warning',
          duration: 3000,
        });
        return;
      }

      if (!returnAddressDisplay || returnAddressDisplay === 'No return address provided') {
        toast.show('Please enter a return address', {
          type: 'warning',
          duration: 3000,
        });
        return;
      }

      if (!contactPhone || contactPhone === 'No phone number provided') {
        toast.show('Please enter a contact phone number', {
          type: 'warning',
          duration: 3000,
        });
        return;
      }

      // Submit the label
      await submitShippingLabel();

      toast.show('Shipping label created successfully', {
        type: 'success',
        duration: 3000,
      });

      // Navigate back to chat
      router.back();
    } catch (error: any) {
      toast.show(error?.message || 'Failed to create shipping label', {
        type: 'danger',
        duration: 4000,
      });
    }
  }, [shippingLabel, returnAddressDisplay, contactPhone, submitShippingLabel, router, toast, isLabelAlreadyCreated]);

  // Render skeleton loaders
  const renderSkeletonCards = useCallback(() => (
    <>
      {/* Shipping Provider Card Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.skeletonRow}>
          <SkeletonBox width={24} height={20} borderRadius={4} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="60%" height={16} marginBottom={4} />
            <SkeletonBox width="80%" height={12} />
          </View>
        </View>
      </View>

      {/* Drop-off Points Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.skeletonRow}>
          <SkeletonBox width={24} height={20} borderRadius={4} />
          <SkeletonBox width="50%" height={16} marginLeft={12} />
          <SkeletonBox width={20} height={20} borderRadius={4} marginLeft={8} />
        </View>
      </View>

      {/* Address Card Skeleton 1 */}
      <View style={styles.cardSkeleton}>
        <SkeletonBox width="40%" height={14} marginBottom={12} />
        <View style={styles.skeletonRow}>
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="70%" height={14} marginBottom={6} />
            <SkeletonBox width="90%" height={12} marginBottom={4} />
            <SkeletonBox width="60%" height={12} />
          </View>
        </View>
      </View>

      {/* Address Card Skeleton 2 */}
      <View style={styles.cardSkeleton}>
        <View style={styles.skeletonRow}>
          <SkeletonBox width="40%" height={14} />
          <SkeletonBox width={20} height={20} borderRadius={4} />
        </View>
        <View style={[styles.skeletonRow, { marginTop: 12 }]}>
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="70%" height={14} marginBottom={6} />
            <SkeletonBox width="90%" height={12} marginBottom={4} />
            <SkeletonBox width="60%" height={12} />
          </View>
        </View>
      </View>

      {/* Contact Card Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.skeletonRow}>
          <SkeletonBox width="40%" height={14} />
          <SkeletonBox width={20} height={20} borderRadius={4} />
        </View>
        <View style={[styles.skeletonRow, { marginTop: 12 }]}>
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="60%" height={14} />
          </View>
        </View>
      </View>
    </>
  ), []);

  // Loading state
  if (shippingLabel.isLoadingDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title="Get shipping label" onPress={handleBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderSkeletonCards()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Get shipping label" onPress={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shipping Provider Card */}
        <ShippingTopCard
          title={shippingProviderName}
          description="Selected and paid for by buyer"
        />

        {/* Drop-off Points */}
        <ShippingDropOffCard
          title={dropOffPointTitle}
          onPress={handleOpenDropOffList}
        /> 

        {/* Recipient's address - NO EDIT ICON */}
        <ShippingAddressCard
          title="Recipient's address"
          name={recipientName}
          address={recipientAddress}
          // onEdit prop NOT provided - no edit icon will show
        />

        {/* Your return address - WITH EDIT ICON */}
        <ShippingAddressCard
          title="Your return address"
          name={returnAddressName}
          address={returnAddressCity ? `${returnAddressDisplay}\n${returnAddressCity}` : returnAddressDisplay}
          onEdit={handleEditReturnAddress}
        />

        {/* Your contact details - WITH EDIT ICON */}
        <ShippingContactCard
          title="Your contact details"
          contact={contactPhone}
          onEdit={handleEditContact}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          We may need to share your email address with the shipping provider to complete this shipment.
        </Text>
        <CustomButton
          title={
            shippingLabel.isCreatingLabel 
              ? 'Creating label...' 
              : isLabelAlreadyCreated 
                ? 'Label already created' 
                : 'Get shipping label'
          }
          onPress={handleGetLabel}
          buttonStyle={[
            styles.continueButton,
            shippingLabel.isCreatingLabel && styles.continueButtonDisabled,
          ]}
          textStyle={styles.continueButtonText}
          disabled={shippingLabel.isCreatingLabel}
        />
      </View>

      {/* Edit Contact Phone Modal */}
      <EditContactPhoneModal
        isVisible={isContactModalVisible}
        onClose={() => setIsContactModalVisible(false)}
        initialPhone={contactPhone}
        onSave={(phone) => {
          updateShippingLabelContactPhone(phone);
          setIsContactModalVisible(false);
        }}
      />

      {/* Edit Return Address Modal */}
      <EditReturnAddressModal
        isVisible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        initialAddress={shippingLabel.updatedReturnAddress}
        onSave={(address) => {
          updateShippingLabelReturnAddress(address);
          setIsAddressModalVisible(false);
        }}
      />

      {/* Drop-off Points List Modal (contains detail modal) */}
      <DropOffPointsListModal
        visible={isDropOffListModalVisible}
        onClose={() => setIsDropOffListModalVisible(false)}
        orderId={orderId || ''}
        onSelectPoint={handleSelectDropOffPoint}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclaimer: {
    color: '#393939',
    fontSize: 11,
    fontFamily: 'DMSans',
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 5,
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#FFA8AE',
    opacity: 0.6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'DMSans',
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default React.memo(ConfirmShippingDetailsScreen);
