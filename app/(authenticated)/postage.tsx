import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";

import ContentSwitch from "@components/ContentSwitch";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import { IGetDeliveryOptionsResponse } from "@services/features/orders/models";
import { getRandomColorCode } from "@utils/colorUtils";
import { capitalizeFirstLetter } from "@utils/stringUtils";
import { useUserProfile } from "@hooks/use-user-profile";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";

const PostageScreen = () => {
  const { t } = useI18n();
  const { postageAddress } = useAppSelector((state) => state.userProfileSlice);
  const [deliveryOptions, setDeliveryOptions] = useState<IGetDeliveryOptionsResponse[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [toastDetails, setToastDetails] = useState<{ message: string; type: string; duration: number } | null>(null);
  
  const { fetchShippingAddress } = useUserProfile();

  console.log("postageAddress", postageAddress);

  // Auto-clear toast after it's shown
  useEffect(() => {
    if (toastDetails) {
      const timer = setTimeout(() => {
        setToastDetails(null);
      }, toastDetails.duration + 500); // Clear slightly after animation completes

      return () => clearTimeout(timer);
    }
  }, [toastDetails]);

  // Fetch shipping address when component mounts
  useEffect(() => {
    fetchShippingAddress();
  }, []);

  // Fetch delivery options from API
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        setLoading(true);
        const response = await orderServices.getSellerOrderDeliveryOptions({
          pageSize: 40,
          pageToken: ""
        });

        console.log("Delivery options response:", response);
        
        if (response.data?.dataset && response.data.dataset.length > 0) {
          setDeliveryOptions(response.data.dataset);
          // Initialize selected options state based on isActive from API
          const initialSelectedState: {[key: string]: boolean} = {};
          response.data.dataset.forEach((option: IGetDeliveryOptionsResponse) => {
            initialSelectedState[`${option.providerId}_${option.serviceTypeId}`] = option.isActive;
          });
          setSelectedOptions(initialSelectedState);
        }
      } catch (error: any) {
        console.error("Error fetching delivery options:", error);
        
        // Show error toast
        let errorMessage = "Failed to load delivery options";
        
        if (error?.response) {
          const { status, data } = error.response;
          
          if (status === 404) {
            errorMessage = data?.message || data?.detail || "Delivery options not found";
          } else if (status === 400) {
            errorMessage = data?.message || data?.detail || "Invalid request";
          } else if (status === 401) {
            errorMessage = "Unauthorized. Please log in again.";
          } else if (status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = data?.message || data?.detail || errorMessage;
          }
        }
        
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryOptions();
  }, []);

  // Handle toggle delivery option
  const handleToggleDeliveryOption = async (serviceTypeId: number, providerId: string) => {
    const optionKey = `${providerId}_${serviceTypeId}`;
    
    try {
      // Optimistically update UI
      setSelectedOptions(prev => ({
        ...prev,
        [optionKey]: !prev[optionKey]
      }));

      // Call API to toggle the delivery option
      const response = await orderServices.toggleSellerOrderDeliveryOption(
        serviceTypeId,
        providerId
      );

      console.log("Toggle delivery option response:", response);
      
      // Check for success
      if (response?.status === 200 || response?.responseCode === "0" || response?.responseCode === 0) {
        setToastDetails({
          message: response?.message || "Delivery option updated successfully",
          type: "success",
          duration: 4000,
        });
      } else if (response?.status === 400 || response?.responseCode === 400 || response?.responseCode === "400") {
        // Handle 400 error returned as response (not thrown)
        const errorMessage = response?.message || response?.detail || "Invalid request";
        console.log("400 Error from response:", errorMessage);
        
        // Revert the optimistic update
        setSelectedOptions(prev => ({
          ...prev,
          [optionKey]: !prev[optionKey]
        }));
        
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      } else if (response?.status === 404 || response?.responseCode === 404 || response?.responseCode === "404") {
        // Handle 404 error returned as response
        const errorMessage = response?.message || response?.detail || "Delivery option not found";
        
        // Revert the optimistic update
        setSelectedOptions(prev => ({
          ...prev,
          [optionKey]: !prev[optionKey]
        }));
        
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      } else if ((response?.status && response.status >= 400) || (response?.responseCode && Number(response.responseCode) >= 400)) {
        // Handle any other error status returned as response
        const errorMessage = response?.message || response?.detail || "An error occurred";
        
        // Revert the optimistic update
        setSelectedOptions(prev => ({
          ...prev,
          [optionKey]: !prev[optionKey]
        }));
        
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error("Error toggling delivery option:", error);
      console.error("Error response:", error?.response);
      
      // Revert the optimistic update on error
      setSelectedOptions(prev => ({
        ...prev,
        [optionKey]: !prev[optionKey]
      }));
      
      // Show error toast
      let errorMessage = "An error occurred. Please try again.";
      
      if (error?.response) {
        const { status, data } = error.response;
        console.log("Error status:", status);
        console.log("Error data:", data);
        
        if (status === 404) {
          errorMessage = data?.message || data?.detail || "Delivery option not found";
        } else if (status === 400) {
          errorMessage = data?.message || data?.detail || "Invalid request";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || data?.detail || errorMessage;
        }
      }
      
      console.log("Setting toast with message:", errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    }
  };

  // Transform API data to component format
  const details = deliveryOptions.map((option) => {
    const optionKey = `${option.providerId}_${option.serviceTypeId}`;
    return {
      id: optionKey, // Use composite key to ensure uniqueness
      title: `${capitalizeFirstLetter(option.provider)} ${option.serviceType}`,
      colorCode: getRandomColorCode(option.providerId),
      subtitle: option.serviceDescription,
      switchValue: selectedOptions[optionKey] || false,
      handleSwitch: () => handleToggleDeliveryOption(option.serviceTypeId, option.providerId),
    };
  });

  return (
    <View style={styles.wrapper}>
      {toastDetails && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            left: 0,
            zIndex: 9999,
          }}
        >
          <CustomToastNotification
            message={toastDetails.message}
            type={toastDetails.type}
            autoHideDuration={toastDetails.duration as 3000}
          />
        </View>
      )}
      
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('postage.postage')}
          onPress={() => router.push('/settings')}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.addCarddTitlle}>{t('postage.myAddress')}</Text>

        <View style={styles.addCardViewView}>
          {postageAddress ? (
            <TitleAndChevronRight
              title={postageAddress?.contactName || "N/A"}
              middleText={postageAddress?.addressLine1 || "N/A"}
              bottomTitle={postageAddress?.addressLine2 || "N/A"}
              onPress={() => router.push("/AddPaymentAddress")}
            />
          ) : (
            <TitleAndChevronRight
              title={t('postage.myAddress')}
              middleText={t('postage.addYourShippingAddress')}
              bottomTitle=""
              onPress={() =>
                router.push('/AddPaymentAddress?redirectTo=profile')
              }
            />
          )}
        </View>
        <Text style={styles.addCarddTitlle}>{t('postage.deliveryOptions')}</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primaryBase} />
          </View>
        ) : details.length === 0 ? (
          <View style={styles.addCardViewView}>
            <Text style={styles.emptyText}>{t('postage.noDeliveryOptions')}</Text>
          </View>
        ) : (
          details?.map((list) => (
            <View style={styles.addCardViewView} key={list?.id}>
              <ContentSwitch
                title={
                  <View style={styles.contentContainer}>
                    <View
                      style={[
                        styles.contentColorCode,
                        { backgroundColor: list?.colorCode },
                      ]}
                    />
                    <View style={styles.contentInnerView}>
                      <Text style={styles.contentTitle}>{list?.title}</Text>
                      <Text style={styles.contentSubtitle}>{list?.subtitle}</Text>
                    </View>
                  </View>
                }
                handleSwitch={list.handleSwitch}
                switchValue={list?.switchValue}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default PostageScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  saveButtonView: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveText: {
    color: '#212C3D',
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
  },
  googleText: {
    color: '#6B727E',
    fontSize: 10,
    marginTop: 4,
  },
  addCardViewView: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  addCarddTitlle: {
    fontSize: 12,
    color: '#071827',
    fontFamily: 'DMSansMedium',
  },
  deleteText: {
    color: '#D4313E',
    fontSize: 12,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#AA2731',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  contentColorCode: {
    width: 24,
    height: 20,
    marginRight: 15,
    borderRadius: 4,
  },
  contentInnerView: {
    marginRight: 10,
    flex: 1,
  },
  contentTitle: {
    fontSize: 14,
    color: '#393939',
    fontFamily: 'DMSansMedium',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 10,
    color: '#5C6F7F',
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B727E",
    textAlign: "center",
    fontFamily: "DMSansMedium",
  },
});
