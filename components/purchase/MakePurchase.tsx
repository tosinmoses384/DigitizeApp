import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";
import StackHeader from "../StackHeader";
import { router, useLocalSearchParams } from "expo-router";
import { Colors, SIZES } from "@constants/Colors";
import BuyerProtection from "../../app/BuyerProtection";
import OrderDeliveryOption from "../../app/OrderDeliveryOption";
import HomeIcon from "../../assets/images/svg/home-house.svg";
import EditIcon from "../../assets/images/svg/edit.svg";
import CustomButton from "@components/CustomButton";
import { useAppSelector } from "@redux/store";
import CustomToastNotification from "@helper/toast-message";
import { IDeliveryOptionWithFees } from "@services/features/orders/models";
import {
  IMakePurchaseProps,
  IBundleDetailsResponse,
} from "./MakePurchase.types";
import { usePurchaseFlow } from "@hooks/usePurchaseFlow";
import { usePaymentSheet } from "@hooks/usePaymentSheet";
import { useSellerCommunication } from "@hooks/useSellerCommunication";
import OrderSummary from "./OrderSummary";
import ShippingAddressCard from "./ShippingAddressCard";
import DeliveryDetailsCard from "./DeliveryDetailsCard";
import DeliveryOptionSelector from "./DeliveryOptionSelector";
import ItemImages from "./ItemImages";
import ContactDetailsModal from "./ContactDetailsModal";
import PurchaseSkeleton from "./PurchaseSkeleton";
import { DeliveryDetailsSkeleton } from "./SkeletonComponents";

const MakePurchase = ({
  itemDetails,
  isBundle,
  buyerPaymentDetails,
  deliveryOptions: propDeliveryOptions,
  defaultDeliveryOption,
  currency,
  contact,
  hideTotal,
}: IMakePurchaseProps) => {
  // Type guard to check if itemDetails is a bundle
  const bundleDetails = isBundle
    ? (itemDetails as IBundleDetailsResponse)
    : null;
  
  const { postageAddress, profile, token, checkoutData } = useAppSelector(
    (state) => state?.userProfileSlice
  );
  
  const { itemId, offer_id } = useLocalSearchParams<{
    itemId: string;
    offer_id?: string;
  }>();
  
  // State
  const [showBuyerProtection, setShowBuyerProtection] = useState(false);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(1);
  const [selectedDeliveryOption, setSelectedDeliveryOption] =
    useState<IDeliveryOptionWithFees | null>(null);
  const [contactDetails, setContactDetails] = useState({
    phoneNumber: contact?.phoneNumber || "",
    countryCode: "234",
  });
  const [toastDetails, setToastDetails] = useState<{
    message: string;
    type: string;
    duration?: number;
  } | null>(null);
  const [isDisplayBundlePayment, setIsDisplayBundlePayment] = useState(false);
  const [isDisplayPayment, setIsDisplayPayment] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Custom hooks
  const purchaseFlow = usePurchaseFlow({
    token: token || '',
    countryId: profile?.countryId || '',
    itemId: itemId || '',
    offerId: offer_id,
  });

  const sellerCommunication = useSellerCommunication({
    token: token || '',
    countryId: profile?.countryId || '',
    itemDetails,
  });

  const paymentSheet = usePaymentSheet({
    checkoutData,
    profile,
    itemId: itemId || '',
    onPaymentSuccess: () => {
      setIsDisplayPayment(false);
      setIsDisplayBundlePayment(false);
      if (isBundle) {
        router.push('/inbox');
      } else {
        sellerCommunication.askSeller();
      }
    },
    onPaymentError: (error: string) => {
      setIsDisplayBundlePayment(false);
      setIsDisplayPayment(false);
      if (error) {
        setToastDetails({
          message: error,
          type: 'error',
          duration: 4000,
        });
      }
    },
  });

  // Memoized values
  const deliveryOptions = useMemo(
    () => [
      {
        id: 1,
        title: "Ship to home",
        icon: <HomeIcon />,
      },
    ],
    []
  );

  const contactAndPaymentDetails = useMemo(
    () => [
      {
        id: 1,
        title: "Your contact details",
        value: contactDetails.phoneNumber ? (
          <View>
            <Text style={styles.phoneNumber}>{contactDetails.phoneNumber}</Text>
          </View>
        ) : (
          <Text style={styles.phoneNumber}></Text>
        ),
      },
    ],
    [contactDetails.phoneNumber]
  );

  // Handler for saving contact details
  const handleSaveContact = useCallback((phoneNumber: string, countryCode: string) => {
    setContactDetails({ phoneNumber, countryCode });
    setToastDetails({
      message: "Contact details updated successfully",
      type: "success",
      duration: 3000,
    });
  }, []);

  const totalAmount = useMemo(
    () =>
      buyerPaymentDetails?.reduce(
        (sum: number, item: any) => sum + (item?.amount || 0),
        0
      ) || 0,
    [buyerPaymentDetails]
  );

  // Initialize contact details from prop
  useEffect(() => {
    if (contact?.phoneNumber) {
      setContactDetails({
        phoneNumber: contact.phoneNumber,
        countryCode: "234",
      });
    }
  }, [contact]);

  // Initialize selected delivery option
  useEffect(() => {
    if (propDeliveryOptions && propDeliveryOptions.length > 0) {
      if (defaultDeliveryOption) {
        const matchingOption = propDeliveryOptions.find(
          (opt) =>
            opt.providerId === defaultDeliveryOption.providerId &&
            opt.serviceTypeId === defaultDeliveryOption.serviceTypeId
        );
        setSelectedDeliveryOption(matchingOption || propDeliveryOptions[0]);
      } else {
        setSelectedDeliveryOption(propDeliveryOptions[0]);
      }
    }
  }, [propDeliveryOptions, defaultDeliveryOption]);

  // Handle loading state based on data availability
  useEffect(() => {
    const hasRequiredData =
      itemDetails &&
      buyerPaymentDetails &&
      buyerPaymentDetails.length > 0;
      // Removed postageAddress requirement - it can be null initially

    if (hasRequiredData) {
      // Add a small delay to show skeleton briefly for better UX
      const timer = setTimeout(() => {
        setIsDataLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [itemDetails, buyerPaymentDetails]);

  // Initialize payment sheet when checkout data is ready
  useEffect(() => {
    const shouldInitialize =
      (isBundle && isDisplayBundlePayment && checkoutData?.customer_id) ||
      (!isBundle && isDisplayPayment && checkoutData?.customer_id);

    if (shouldInitialize) {
      paymentSheet.initializePaymentSheet().then((success) => {
        if (success) {
          paymentSheet.openPaymentSheet();
        }
      });
    }
  }, [
    isBundle,
    checkoutData,
    isDisplayBundlePayment,
    isDisplayPayment,
    paymentSheet,
  ]);

  // Callbacks
  const handlePurchase = useCallback(async () => {
    setToastDetails(null);
    
    // Validate required fields
    if (!selectedDeliveryOption?.providerId) {
      setToastDetails({
        message: "Please select a delivery option",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    if (!postageAddress?.id) {
      setToastDetails({
        message: "Please add a shipping address",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    if (!contactDetails.phoneNumber) {
      setToastDetails({
        message: "Please add your contact number",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    const result = await purchaseFlow.handleItemPurchase({
      shippingProviderId: selectedDeliveryOption.providerId,
      shippingServiceTypeId: String(selectedDeliveryOption.serviceTypeId),
      buyerAddressId: postageAddress.id,
      buyerContactNumber: `+${contactDetails.countryCode}${contactDetails.phoneNumber}`,
    });

    if (result.success) {
      setIsDisplayPayment(true);
    } else if (result.error && !result.unauthorized) {
      setToastDetails({
        message: result.error,
        type: "error",
        duration: 4000,
      });
    }
  }, [purchaseFlow, selectedDeliveryOption, postageAddress, contactDetails]);

  const handleBundlePurchase = useCallback(async () => {
    setToastDetails(null);
    
    // Validate required fields
    if (!selectedDeliveryOption?.providerId) {
      setToastDetails({
        message: "Please select a delivery option",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    if (!postageAddress?.id) {
      setToastDetails({
        message: "Please add a shipping address",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    if (!contactDetails.phoneNumber) {
      setToastDetails({
        message: "Please add your contact number",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    // Get seller ID from item details
    const sellerUserId = bundleDetails?.buyerConversation?.sellerUserId || 
                         bundleDetails?.sellerInfo?.id || '';
    
    if (!sellerUserId) {
      setToastDetails({
        message: "Unable to identify seller",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    // Extract item IDs from bundle items
    const itemIds = bundleDetails?.items?.map(item => item.itemId).filter(Boolean) as string[] || [];
    
    if (itemIds.length === 0) {
      setToastDetails({
        message: "No items found in bundle",
        type: "error",
        duration: 4000,
      });
      return;
    }
    
    const result = await purchaseFlow.handleBundlePurchase({
      sellerUserId,
      itemIds,
      shippingProviderId: selectedDeliveryOption.providerId,
      shippingServiceTypeId: String(selectedDeliveryOption.serviceTypeId),
      buyerAddressId: postageAddress.id,
      buyerContactNumber: `+${contactDetails.countryCode}${contactDetails.phoneNumber}`,
    });

    if (result.success) {
      setIsDisplayBundlePayment(true);
    } else if (result.error && !result.unauthorized) {
      setToastDetails({
        message: result.error,
        type: "error",
        duration: 4000,
      });
    }
  }, [purchaseFlow, bundleDetails, selectedDeliveryOption, postageAddress, contactDetails]);

  console.log('checkoutData', totalAmount);

  const handlePayAction = useCallback(() => {
    if (checkoutData) {
      setToastDetails(null);
      if (isBundle) {
        setIsDisplayBundlePayment(true);
      } else {
        setIsDisplayPayment(true);
      }
    } else {
      if (isBundle) {
        handleBundlePurchase();
      } else {
        handlePurchase();
      }
    }
  }, [checkoutData, isBundle, handleBundlePurchase, handlePurchase]);

  return showBuyerProtection ? (
    <BuyerProtection onClose={() => setShowBuyerProtection(false)} />
  ) : showDeliveryOptions ? (
    <OrderDeliveryOption
      deliveryOptions={propDeliveryOptions || []}
      selectedOption={selectedDeliveryOption}
      currency={currency}
      onClose={() => setShowDeliveryOptions(false)}
      onSelect={(option) => setSelectedDeliveryOption(option)}
    />
  ) : (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 16,
        }}
      >
      <StackHeader title="" onPress={() => router.back()} />
      
      {isDataLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <PurchaseSkeleton />
        </ScrollView>
      ) : (
        <>
      {toastDetails && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            left: 0,
          }}
        >
          <CustomToastNotification
            message={toastDetails?.message}
            type={toastDetails?.type}
            autoHideDuration={(toastDetails?.duration as 3000) || 3000}
          />
        </View>
      )}


      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ flex: 1, marginBottom: 30 }}>
          <ItemImages
            isBundle={!!isBundle}
            itemImageUrl={itemDetails?.itemDefaultImageUrl}
            bundleItems={bundleDetails?.items}
          />

          <OrderSummary
            items={buyerPaymentDetails || []}
            totalAmount={totalAmount}
            currencySymbol={itemDetails?.currencySymbol || ''}
            showTotal={!hideTotal}
            onIconPress={() => setShowBuyerProtection(true)}
          />

          <View style={styles.deliveryOptionView}>
            <Text style={styles.orderSummaryTitle}>Delivery Options</Text>
            <DeliveryOptionSelector
              options={deliveryOptions}
              selectedId={deliveryOption}
              onSelect={setDeliveryOption}
            />
            <ShippingAddressCard
              contactName={postageAddress?.contactName}
              addressLine1={postageAddress?.addressLine1}
              addressLine2={postageAddress?.addressLine2}
            />
          </View>

          {selectedDeliveryOption ? (
            <DeliveryDetailsCard
              deliveryOption={selectedDeliveryOption}
              currencySymbol={
                currency?.currencySymbol || itemDetails?.currencySymbol || ''
              }
              onPress={() => setShowDeliveryOptions(true)}
            />
          ) : propDeliveryOptions && propDeliveryOptions.length === 0 ? null : (
            <DeliveryDetailsSkeleton />
          )}

          {contactAndPaymentDetails.map((list) => (
            <View key={list.id} style={styles.contactAndPaymentDetailsView}>
              <Text style={styles.contactAndPaymentDetailsTitle}>
                {list.title}
              </Text>
              <View style={styles.contactAndPaymentDetailsBottom}>
                <View style={styles.contactAndPaymentDetailsBottomValueView}>
                  {list.value}
                </View>
                <Pressable
                  onPress={() => setShowContactModal(true)}
                  style={({ pressed }) => [
                    pressed && styles.editIconPressed,
                  ]}
                >
                  <EditIcon />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

        <View style={styles.buttomView}>
          <CustomButton
            title="Pay"
            buttonStyle={styles.makePurchaseBtn}
            textStyle={styles.makePurchaseBtnText}
            onPress={handlePayAction}
            loader={purchaseFlow.loading || sellerCommunication.loading}
          />
        </View>
        </>
      )}
      </View>

      <ContactDetailsModal
        isShow={showContactModal}
        onClose={() => setShowContactModal(false)}
        initialPhoneNumber={contactDetails.phoneNumber}
        initialCountryCode={contactDetails.countryCode}
        onSave={handleSaveContact}
      />
    </>
  );
};

const styles = StyleSheet.create({
  orderSummaryTitle: {
    fontSize: 14,
    color: "#212B36",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  deliveryOptionView: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
  },
  contactAndPaymentDetailsView: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 8,
    borderRadius: 8,
  },
  contactAndPaymentDetailsBottom: {
    flexDirection: "row",
    marginTop: 8,
  },
  contactAndPaymentDetailsBottomValueView: {
    flex: 1,
  },
  contactAndPaymentDetailsTitle: {
    color: "#212B36",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  phoneNumber: {
    fontSize: 12,
    color: "#393939",
    fontFamily: "DMSansSemiBold",
  },
  editIconPressed: {
    opacity: 0.6,
  },
  buttomView: {
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: "white",
  },
  makePurchaseBtn: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  makePurchaseBtnText: {
    color: "white",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
  },
});

export default MakePurchase;
