import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StackHeader from "@components/StackHeader";
import VerticalStepper, { VerticalStepperStep } from "@components/VerticalStepper";
import { useShippingStore, shippingSelectors } from "@stores/shippingStore";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import { useI18n } from "@hooks/use-i18n";

// Checkbox component with red circle and white checkmark
const CheckboxChecked = ({ style, onLayout }: { style: any; onLayout?: any }) => (
  <View style={[styles.checkboxContainer, style]} onLayout={onLayout}>
    <Ionicons name="checkmark" size={12} color="#fff" />
  </View>
);

// Dotted line component (dynamic length, brand-tint dots)
const DottedLine: React.FC<{ height: number; startOffset?: number }> = ({ height, startOffset = 0 }) => {
  const effectiveHeight = Math.max(0, (height || 0) - (startOffset || 0));
  const count = useMemo(() => Math.max(2, Math.round(effectiveHeight / 8)), [effectiveHeight]);
  return (
    <View style={[styles.dottedLineContainer, { height }, startOffset ? { paddingTop: startOffset } : null]}> 
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );
};

interface InboxSetShippingProps {}

const InboxSetShipping: React.FC<InboxSetShippingProps> = React.memo(() => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const orderId = (params.orderId as string);
  
  // Validate order ID is provided
  if (!orderId || orderId === 'default-order') {
    if (__DEV__) {
      console.error('Invalid or missing orderId in Inbox-set-shipping screen');
    }
  }

  const { 
    setCurrentOrder, 
    createOrder,
    clearError,
    getShippingDetails,
    submitShippingProvider,
    isSubmitting,
    isLoading,
    error: storeError 
  } = useShippingStore();
  
  const hasShippingProvider = useShippingStore(shippingSelectors.hasShippingProvider);
  const hasReturnAddress = useShippingStore(shippingSelectors.hasReturnAddress);
  const isComplete = useShippingStore(shippingSelectors.isComplete);
  const canProceedToNextStep = useShippingStore(shippingSelectors.canProceedToNextStep);

  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const [step1Height, setStep1Height] = useState<number>(0);
  const [step2Height, setStep2Height] = useState<number>(0);
  const [checkboxTopOffset, setCheckboxTopOffset] = useState<number>(0);
  const STEP_VERTICAL_GAP = 16;
  const DOTTED_TOP_OFFSET = useMemo(() => {
    const checkboxHeight = 20;
    const checkboxMarginTop = 2;
    const visualGap = 8;
    return checkboxTopOffset || checkboxHeight + checkboxMarginTop + visualGap;
  }, [checkboxTopOffset]);

  const dotted1Height = useMemo(() => Math.max(48, (step1Height || 0) + STEP_VERTICAL_GAP), [step1Height]);
  const dotted2Height = useMemo(() => Math.max(48, (step2Height || 0) + STEP_VERTICAL_GAP), [step2Height]);

  useEffect(() => {
    setCurrentOrder(orderId);
    clearError();
    
    const fetchShippingDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await getShippingDetails(orderId);
        setShippingDetails(details);
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to fetch shipping details:', error);
        }
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchShippingDetails();
  }, [orderId, setCurrentOrder, clearError, getShippingDetails]);

  const handleAddShippingProvider = useCallback(() => {
    router.push(`/chats/shipping-provider?orderId=${orderId}`);
  }, [orderId]);

  const handleSetReturnAddress = useCallback(() => {
    if (!canProceedToNextStep) return;
    router.push(`/chats/return-address?orderId=${orderId}`);
  }, [canProceedToNextStep, orderId]);

  const handleConfirmShipping = useCallback(async () => {
    if (!isComplete) return;
    
    try {
      await submitShippingProvider(orderId);
      
      if (__DEV__) {
        console.log("Shipping confirmed successfully for order:", orderId);
      }
      
      router.back();
    } catch (error) {
      if (__DEV__) {
        console.error("Failed to confirm shipping:", error);
      }
    }
  }, [isComplete, orderId, submitShippingProvider]);

  // Check store state when returning to this screen
  useFocusEffect(
    useCallback(() => {
      // Store state is automatically updated via selectors
      // No need for manual state checking
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <StackHeader
            title={t('shipping.title')}
            onPress={handleGoBack}
      />
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <View style={styles.buyerDetailsCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Buyer/Recipient Details</Text>
            </View>
            {loadingDetails ? (
              <View style={styles.cardBody}>
                <ActivityIndicator size="small" color="#FF3B4A" />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            ) : shippingDetails?.shipTo ? (
              <View style={styles.cardBody}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar} />
                  <View style={styles.buyerInfo}>
                    <Text style={styles.buyerName}>
                      {capitalizeFirstLetter(shippingDetails.shipTo.name || '')}
                    </Text>
                    <Text style={styles.buyerAddress}>
                      {capitalizeFirstLetter(shippingDetails.shipTo.address1 || '')}
                      {shippingDetails.shipTo.address2 ? `, ${shippingDetails.shipTo.address2}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.cardBody}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar} />
                  <View style={styles.buyerInfo}>
                    <Text style={styles.buyerName}>Buyer Information</Text>
                    <Text style={styles.buyerAddress}>Loading address...</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Shipping Instructions Header */}
        <View style={styles.instructionsHeader}>
          <Text style={styles.instructionsTitle} accessibilityRole="header">How to ship this product</Text>
          <Text style={styles.instructionsSubtitle}>
            Follow the steps below to ship your product
          </Text>
        </View>

        {/* Steps Card */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Steps to ship your product</Text>
          <VerticalStepper
            steps={[
              {
                key: 'provider',
                renderContent: () => (
                  <View>
                    <Text style={styles.stepTitle}>Find a Shipping Provider</Text>
                    <Text style={styles.stepDescription}>
                      <Text style={styles.stepDescriptionText}>
                        Find & pick a local delivery or courier service to deliver the product to the buyer.{'\n'}
                      </Text>
                      <Text style={styles.noteLabel}>Note</Text>
                      <Text style={styles.stepDescriptionText}>: Use a service that provides a </Text>
                      <Text style={styles.trackingLink} accessibilityRole="link">tracking number</Text>
                    </Text>
                    <View style={styles.actionContainer}>
                      {hasShippingProvider ? (
                        <>
                          <View style={styles.setPill} accessibilityLabel="Shipping provider details set">
                            <Text style={styles.setPillText}>Shipping Provider Details set</Text>
                          </View>
                          <Pressable 
                            style={styles.secondaryButton} 
                            onPress={handleAddShippingProvider}
                            accessibilityRole="button"
                            accessibilityLabel="Edit Shipping Provider Details"
                          >
                            <Text style={styles.secondaryButtonText}>Edit Shipping Provider Details</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable 
                          style={styles.primaryButton} 
                          onPress={handleAddShippingProvider}
                          accessibilityRole="button"
                          accessibilityLabel="Add Shipping Provider Details"
                        >
                          <Text style={styles.primaryButtonText}>Add Shipping Provider Details</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ),
              },
              {
                key: 'return',
                renderContent: () => (
                  <View>
                    <Text style={[styles.stepTitle, !canProceedToNextStep ? styles.textDisabled : undefined]}>Set Return Address</Text>
                    <Text style={[styles.stepDescriptionDisabled, !canProceedToNextStep ? styles.textDisabled : undefined]}>
                      Please set a return address to be used in the event of a dispute
                    </Text>
                    <View style={styles.actionContainer}>
                      {hasReturnAddress ? (
                        <>
                          <View style={styles.setPill} accessibilityLabel="Return address set">
                            <Text style={styles.setPillText}>Return Address set</Text>
                          </View>
                          <Pressable 
                            style={[styles.secondaryButton, !canProceedToNextStep ? styles.buttonDisabled : undefined]} 
                            onPress={handleSetReturnAddress}
                            accessibilityRole="button"
                            accessibilityLabel="Edit Return Address"
                          >
                            <Text style={[styles.secondaryButtonText, !canProceedToNextStep ? styles.textDisabled : undefined]}>Edit Return Address</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable 
                          style={[styles.secondaryButton, !canProceedToNextStep ? styles.buttonDisabled : undefined]} 
                          onPress={handleSetReturnAddress}
                          accessibilityRole="button"
                          accessibilityLabel="Set Return Address"
                        >
                          <Text style={[styles.secondaryButtonText, !canProceedToNextStep ? styles.textDisabled : undefined]}>Set Return Address</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ),
              },
              {
                key: 'confirm',
                renderContent: () => (
                  <View>
                    <Text style={[styles.stepTitle, !isComplete ? styles.textDisabled : undefined]}>Confirm Shipping</Text>
                    <Text style={[styles.stepDescriptionDisabled, !isComplete ? styles.textDisabled : undefined]}>
                      You need to confirm shipping to enable tracking of this shipping
                    </Text>
                    <View style={styles.actionContainer}>
                      <Pressable 
                        style={[styles.confirmButton, (!isComplete || isSubmitting) ? styles.confirmButtonDisabled : undefined]} 
                        onPress={handleConfirmShipping}
                        disabled={!isComplete || isSubmitting}
                        accessibilityRole="button"
                        accessibilityLabel="Confirm Shipping"
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.confirmButtonText}>Confirm Shipping</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ),
              },
            ]}
          />

          {/* Old inline implementation kept below temporarily for reference; will be removed after verifying Stepper */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

InboxSetShipping.displayName = 'InboxSetShipping';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  header: {
    backgroundColor: '#fff',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    height: 46,
  },
  time: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#071827',
    letterSpacing: 0.1,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '700',
    color: '#071827',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  buyerDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  cardContent: {
    backgroundColor: '#F6F7F7',
    borderRadius: 4,
    padding: 8,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#6B727E',
  },
  cardBody: {
    flexDirection: 'row',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#3EC1EA',
  },
  buyerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  buyerName: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#393939',
  },
  buyerAddress: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#637381',
  },
  instructionsHeader: {
    gap: 8,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
    color: '#071827',
  },
  instructionsSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#464F5D',
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EAEB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#6B727E',
  },
  stepsContainer: {
    flexDirection: 'column',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
    position: 'relative',
  },
  stepCheckbox: {
    marginTop: 2, // Align with title baseline
    zIndex: 2, // Ensure checkbox appears above dotted line
    position: 'relative', // Needed for z-index to work
  },
  stepContent: {
    flex: 1,
    gap: 8,
  },
  dottedLineAbsolute: {
    position: 'absolute',
    left: 10, // Center under the 20px checkbox
    width: 1,
    alignItems: 'center',
    zIndex: 1, // Behind the checkbox
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedLineContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD8DB',
  },
  disabledStep: {
    opacity: 0.4,
  },
  textDisabled: {
    opacity: 0.4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  stepTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#1E2226',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepDescriptionText: {
    color: '#6B727E',
    fontFamily: 'DMSans-Regular',
  },
  stepDescriptionDisabled: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B727E',
    fontFamily: 'DMSans-Regular',
  },
  noteLabel: {
    fontWeight: '700',
    color: '#6B727E',
    fontFamily: 'DMSans-Bold',
  },
  trackingLink: {
    textDecorationLine: 'underline',
    color: '#FF3B4A',
    fontFamily: 'DMSans-Regular',
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: '#212C3D',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 0,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#212C3D',
    fontFamily: 'DMSans-Medium',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#212C3D',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 0,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#212C3D',
    fontFamily: 'DMSans-Medium',
  },
  confirmButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 0,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#FF9DA7',
  },
  setPill: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EAEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F6F7F7',
  },
  setPillText: {
    color: '#99A1AB',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'DMSans-Medium',
  },
  actionContainer: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#6B727E",
    marginLeft: 8,
  },
});

export default InboxSetShipping;