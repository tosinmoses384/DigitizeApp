import BottomModal from "@components/BottomModal";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import CloseIcon from "../assets/images/svg/x-close.svg";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import NewBottomModal from "@components/NewBottomModal";
import AppTextInput from "@components/AppTextInput";
import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import ChatImageIcon from "../assets/images/svg/chat-image-icon.svg";
import {
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
import CustomToastNotification from "@helper/toast-message";

interface IMakeBundleOfferModal {
  onClose: any;
  isShow: boolean;
  itemDetails: any;
  onSuccess?: any;
  details?: any;
}
const MakeBundleOfferModal = ({
  onClose,
  isShow,
  itemDetails,
  onSuccess,
  details,
}: IMakeBundleOfferModal) => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token, profile }: any = useAppSelector(
    (state) => state?.userProfileSlice
  );
  const [toastDetails, setToastDetails]: any = useState(null);

  const [selectedOption, setSelectedOption]: any = useState(null);
  const [offerSet, setOfferSet]: any = useState(null);
  const [makeOfferLoader, setMakeOfferLoader]: any = useState(false);

  function calculateMinusPercentage(amount: any, percentage: any) {
    // Convert percentage to a decimal
    const percentageDecimal = percentage / 100;

    // Calculate the amount to subtract
    const amountToSubtract = amount * percentageDecimal;

    // Return the result of subtracting the calculated amount
    return amount - amountToSubtract;
  }

  const offerDetails = [
    {
      id: 1,
      title: formatAmount(
        itemDetails?.actualTotalAmount
          ? calculateMinusPercentage(
              parseInt(itemDetails?.actualTotalAmount),
              10
            )
          : 0,
        itemDetails?.currencySymbol
      ),
      offerPercentage: "10% Off",
      percentage: 10,
    },
    {
      id: 2,
      title: formatAmount(
        itemDetails?.actualTotalAmount
          ? calculateMinusPercentage(
              parseInt(itemDetails?.actualTotalAmount),
              15
            )
          : 0,
        itemDetails?.currencySymbol
      ),
      offerPercentage: "15% Off",
      percentage: 15,
    },
    {
      id: 3,
      title: "Custom",
      offerPercentage: "15% Off",
    },
  ];

  const addItemsValidationSchema = Yup?.object()?.shape({
    customPrice: offerSet
      ? Yup.string().optional()
      : Yup.string().required("Required"),
  });
  const customOfferFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      customPrice: "",
    },
    onSubmit: async (values: any) => {
      setMakeOfferLoader(true);
      setToastDetails(null);

      let data = {
        sellerUserId: itemDetails?.sellerUserId,
        itemIds: itemDetails?.itemIds,
        offerPrice: offerSet || values?.customPrice,
      };

      const userProfile = marketplaceServices.makeSellerOfferItemBundle(
        data,
        token
      );
      userProfile
        .then((res: any) => {
          setMakeOfferLoader(false);

          if (res?.status === 200) {
            onClose?.();
            onSuccess?.();
            dispatch(setCurrentChatName(details?.[0]?.sellerName));
            dispatch(setMetaData(res?.data?.conversationMetadata));
            return router.push(`/chats/${res?.conversationId}`);
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
          return setToastDetails({
            message: `${res?.detail || res?.Message}`,
            type: "error",
            duration: 4000,
          });
        })
        .catch((error: any) => {
          setMakeOfferLoader(false);
        });
    },
  });

  const totalOffer = offerSet || customOfferFormik?.values?.customPrice;
  useEffect(() => {
    if (selectedOption !== 3) {
      const getSelectedOffer = offerDetails[selectedOption - 1]?.percentage;
      setOfferSet(
        calculateMinusPercentage(
          parseInt(itemDetails?.actualTotalAmount),
          getSelectedOffer
        )
      );
    } else {
      setOfferSet(null);
    }
  }, [selectedOption]);

  //   <View style={styles.wrapperTop}>
  //             <View style={styles.offerImage}>
  //               {itemDetails?.itemDefaultImageUrl ? (
  //                 <Image
  //                   source={{ uri: itemDetails?.itemDefaultImageUrl }}
  //                   style={{ width: "100%", height: "100%", borderRadius: 12 }}
  //                 />
  //               ) : (
  //                 <ChatImageIcon />
  //               )}
  //             </View>
  //             <View style={styles.offerListDetails}>
  //               <Text style={styles.offerListTitle}>
  //                 {itemDetails?.itemName},
  //                 {itemDetails?.itemSizeId && (
  //                   <Text style={{ textTransform: "uppercase" }}>
  //                     {itemDetails?.itemSizeId}
  //                   </Text>
  //                 )}
  //               </Text>
  //               <Text style={styles.offerAmount}>
  //                 Price:
  //                 {formatAmount(
  //                   parseInt(itemDetails?.actualTotalAmount) || 0,
  //                   itemDetails?.currencySymbol
  //                 )}
  //               </Text>
  //               {/* <View style={styles.offerAmountDetailsView}>
  //                         <Text style={styles.offerAmountTotal}>
  //                           {formatAmount(metaData?.product_total || 0)}
  //                         </Text>
  //                         <UserVerify />
  //                         <Text style={styles.offerAmountTotalTitle}>
  //                           (Subtotal for buyer)
  //                         </Text>
  //                       </View> */}
  //             </View>
  //           </View>

  return (
    <NewBottomModal
      isShow={isShow}
      onClose={onClose}
      //   maxHeight={"100%"}
      contentStyle={{
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        width: "100%", // Or a specific width (e.g., '80%')
        flex: 1,
        paddingBottom: 30,
        paddingTop: 20,
      }}
    >
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
          },
        ]}
      >
        {toastDetails && (
          <View
            style={{ position: "absolute", right: 0, top: "-83%", left: 0 }}
          >
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}

        <View style={styles.closeViewContainer}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeContainer,
              pressed && { opacity: 0.5 },
            ]}
          >
            <CloseIcon width={17} height={17} />
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.offerListView}>
            {offerDetails?.map((list) => (
              <Pressable
                key={list?.id}
                style={
                  selectedOption === list?.id
                    ? styles.offerListActive
                    : styles.offerList
                }
                onPress={() => {
                  //   if (list?.id !== 3) {
                  setSelectedOption(list?.id);
                  customOfferFormik.setFieldValue("customPrice", "");
                  //     return;
                  //   }
                  //   customOfferFormik.setFieldValue("customPrice", "");
                }}
              >
                <Text style={styles.offerListCardTitle}>{list?.title}</Text>
                <Text style={styles.offerListCardPercentage}>
                  {list?.offerPercentage}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedOption === 3 && (
            <View
              style={{
                borderWidth:
                  customOfferFormik.submitCount > 0 &&
                  customOfferFormik.errors.customPrice
                    ? 0
                    : 1,
                borderColor: "#E9EAEB",
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <AppTextInput
                onChangeText={(value) =>
                  customOfferFormik.setFieldValue("customPrice", value)
                }
                keyboardType={"numeric"}
                value={customOfferFormik?.values?.customPrice}
                error={
                  customOfferFormik.submitCount > 0 &&
                  customOfferFormik.errors.customPrice
                }
                placeholder="Price"
                // label="Price"
                labelStyle={{ paddingHorizontal: 10 }}
              />
            </View>
          )}

          <View style={{ marginTop: 32 }}>
            <CustomButton
              title={`Offer ${
                totalOffer
                  ? formatAmount(
                      parseInt(totalOffer) || 0,
                      itemDetails?.currencySymbol
                    )
                  : ""
              }`}
              buttonStyle={
                !totalOffer ? styles.disableButtonWrapper : styles.offerBtn
              }
              textStyle={!totalOffer ? styles.disableText : styles.offerBtnText}
              onPress={customOfferFormik.handleSubmit}
              loader={makeOfferLoader}
              disabled={totalOffer ? false : true}
            />
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default MakeBundleOfferModal;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    flex: 1,
  },
  container: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7CC",
  },
  containerText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "DMSansMedium",
    color: "rgba(30, 34, 38, 1)",
  },
  closeViewContainer: {
    position: "relative",
    marginBottom: 11,
  },
  closeContainer: {
    position: "absolute",
    zIndex: 3,
    right: 10,
  },
  wrapperTop: {
    flexDirection: "row",
    marginBottom: 16,
  },
  offerImage: {
    height: 52,
    width: 52,
    backgroundColor: "#E9EAEB",
    borderRadius: 12,
    marginRight: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  offerListDetails: {
    flex: 1,
  },
  offerListView: {
    flexDirection: "row",
    gap: 8,
    marginTop: 30,
  },
  offerListTitle: {
    fontSize: 14,
    color: "#071827",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 12,
    color: "#5C6F7F",
    marginBottom: 4,
    fontFamily: "DMSansMedium",
  },
  offerListCardTitle: {
    color: "#07090C",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    marginBottom: 4,
  },
  offerListCardPercentage: {
    color: "#AA2731",
    fontSize: 10,
    fontFamily: "DMSansMedium",
  },
  offerBtn: {
    backgroundColor: "#FF3B4A",
    borderRadius: 8,
  },
  offerBtnText: {
    textAlign: "center",
    width: "100%",
    color: "white",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  offerListActive: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFBEC3",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#FFEBED",
  },
  offerList: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: 8,
    padding: 15,
  },
  disableButtonWrapper: {
    backgroundColor: "rgba(255, 216, 219, 1)",
    padding: 14,
    borderRadius: 12,

    display: "flex",
    justifyContent: "center",
  },
  disableText: {
    fontFamily: "DMSansMedium",
    fontSize: 12,
    color: "#FF9DA4",
    textAlign: "center",
    width: "100%",
  },
});
