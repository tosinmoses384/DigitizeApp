import { formatAmount } from "@helper/formatCash";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import CustomButton from "@components/CustomButton";
import AppTextInput from "@components/AppTextInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import ChatImageIcon from "../../../assets/images/svg/chat-image-icon.svg";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useAppSelector } from "@redux/store";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";
interface IMakeOfferCard {
  metaData: any;
  isSeller: boolean;
  isShowOfferDetails: boolean;
  handleMakeOffer: any;
  onClose: any;
  refetch: any;
  chatItem: any;
}
const MakeOfferCard = ({
  metaData,
  isSeller,
  isShowOfferDetails,
  handleMakeOffer,
  onClose,
  refetch,
  chatItem,
}: IMakeOfferCard) => {
  const { t } = useI18n();
  const { profile, token } = useAppSelector(
    (state) => state?.userProfileSlice
  );
  const [selectedOption, setSelectedOption]: any = useState(null);
  const [offerSet, setOfferSet]: any = useState(null);
  const [makeOfferLodaer, setMakeOfferLodaer] = useState(false);
  const [makeReservationLodaer, setMakeReservationLodaer] = useState(false);

  const [toastDetails, setToastDetails]: any = useState(null);
  const recipientUserId = chatItem?.recipientUserId;
  // createdByUserId

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
        calculateMinusPercentage(
          parseInt(metaData?.product_amount),

          10
        ),
        metaData?.product_currency_symbol
      ),
      offerPercentage: t('makeOffer.percentOff', { percent: 10 }),
      percentage: 10,
    },
    {
      id: 2,
      title: formatAmount(
        calculateMinusPercentage(
          parseInt(metaData?.product_amount),

          15
        ),
        metaData?.product_currency_symbol
      ),
      offerPercentage: t('makeOffer.percentOff', { percent: 15 }),
      percentage: 15,
    },
    {
      id: 3,
      title: t('makeOffer.custom'),
      offerPercentage: "",
    },
  ];

 

  const handleBuyNow = () => {
    if (metaData?.purchase_type === "ItemPurchase") {
      return router.push(`/ItemPurchase/${metaData?.product_id}`);
    }

    return router.push(`/BundlePurchase/${metaData?.product_id}`);
  };

  const handleReserveOffer = () => {
    setToastDetails(null);
    const data: any = {
      itemId: metaData?.product_id,
      buyerId: recipientUserId,
      expiryDate: "",
    };

    setMakeReservationLodaer(true);

    const serverRequest =
      metaData?.purchase_type === "ItemPurchase"
        ? marketplaceServices?.makeSellerReservationOffer(token, data)
        : marketplaceServices?.makeChatBundleOffer(
            token,
            metaData?.product_id,
            data
          );

    serverRequest
      .then((res: any) => {
        setMakeReservationLodaer(false);

        if (res?.status === 200) {
          refetch?.();
          return onClose?.();
        }

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        return setToastDetails({
          message: `${res?.detail || res?.Message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error: any) => {
        setMakeReservationLodaer(false);
      });
  };

  const makeOfferBtn = (
    <CustomButton
      title={t('makeOffer.makeAnOffer')}
      buttonStyle={styles.btnMakeOffer}
      textStyle={styles.btnMakeOfferText}
      onPress={handleMakeOffer}
    />
  );

  const buyBtn = (
    <CustomButton
      title={t('makeOffer.buy')}
      buttonStyle={styles.btnBuy}
      textStyle={styles.btnBuyText}
      onPress={handleBuyNow}
    />
  );

  const reverseBtn = (
    <CustomButton
      title={t('makeOffer.reserve')}
      buttonStyle={styles.btnReserve}
      textStyle={styles.btnReserveText}
      onPress={handleReserveOffer}
      loader={makeReservationLodaer}
      showLoadingText
      loadingStyle={{ textAlign: "center", width: "100%" }}
    />
  );

  const addItemsValidationSchema = Yup?.object()?.shape({
    customPrice: Yup.string().required(t('makeOffer.required')),
  });

  const customOfferFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      customPrice: "",
    },
    onSubmit: async (values: any) => {
      setToastDetails(null);
      const data: any =
        metaData?.purchase_type !== "ItemPurchase"
          ? {
              offerPrice: offerSet || values?.customPrice,
              buyerId: recipientUserId,
            }
          : {
              offerPrice: offerSet || values?.customPrice,
              buyerId: recipientUserId,
            };

      setMakeOfferLodaer(true);

      const serverRequest =
        metaData?.purchase_type === "ItemPurchase"
          ? marketplaceServices?.makeSellerAndBuyerOffer(
              token,
              profile?.countryId,
              metaData?.product_id,
              data
            )
          : marketplaceServices?.makeChatBundleOffer(
              token,
              metaData?.product_id,
              data
            );

      serverRequest
        .then((res: any) => {
          setMakeOfferLodaer(false);

          if (res?.status === 200) {
            refetch?.();
            return onClose?.();
          }

          if (res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
          return setToastDetails({
            message: `${res?.detail || res?.Message}`,
            type: "error",
            duration: 4000,
          });
        })
        .catch((error: any) => {
          setMakeOfferLodaer(false);
        });
    },
  });

  const totalOffer = offerSet || customOfferFormik?.values?.customPrice;
  useEffect(() => {
    if (selectedOption !== 3) {
      const getSelectedOffer = offerDetails[selectedOption - 1]?.percentage;
      setOfferSet(
        calculateMinusPercentage(
          parseInt(metaData?.product_amount),
          getSelectedOffer
        )
      );
    } else {
      setOfferSet(null);
    }
  }, [selectedOption]);

  return (
    // <></>

    <View style={styles.wrapper}>
      {toastDetails && (
        <View style={{ position: "absolute", right: 0, top: "-20%", left: 0 }}>
          <CustomToastNotification
            message={toastDetails?.message}
            type={toastDetails?.type}
            autoHideDuration={toastDetails?.duration}
          />
        </View>
      )}
      <View style={styles.wrapperTop}>
        <View style={styles.offerImage}>
          {metaData?.product_image_url ? (
            <Image
              source={{ uri: metaData?.product_image_url }}
              style={{ width: "100%", height: "100%", borderRadius: 12 }}
            />
          ) : (
            <ChatImageIcon />
          )}
        </View>
        <View style={styles.offerListDetails}>
          <Text style={styles.offerListTitle}>
            {metaData?.product_name}, {metaData?.product_size}
          </Text>
          <Text style={styles.offerAmount}>
            {t('makeOffer.priceLabel')}
            {formatAmount(
              parseInt(metaData?.product_amount) || 0,
              metaData?.product_currency_symbol
            )}
          </Text>
         
        </View>
      </View>
      {metaData?.is_available !== "True" && (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>
            {t('makeOffer.itemUnavailable')}
          </Text>
        </View>
      )}
      {metaData?.is_available === "True" &&
        (!isShowOfferDetails ? (
          <View style={styles.btns}>
            <View style={styles.btnViewLeft}>
              {isSeller ? reverseBtn : makeOfferBtn}
            </View>
            <View style={styles.btnViewRight}>
              {isSeller ? makeOfferBtn : buyBtn}
            </View>
          </View>
        ) : (
          <View>
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
                    setSelectedOption(list?.id);
                    if (list?.id !== 3) {
                      customOfferFormik.setFieldValue(
                        "customPrice",
                        metaData?.product_amount || 0
                      );
                      return;
                    }
                    customOfferFormik.setFieldValue("customPrice", "");
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
                  placeholder={t('makeOffer.price')}
                  // label="Price"
                  labelStyle={{ paddingHorizontal: 10 }}
                />
              </View>
            )}

            <View style={{ marginTop: 32 }}>
              <CustomButton
                title={`${t('makeOffer.offer')} ${
                  totalOffer
                    ? formatAmount(
                        parseInt(totalOffer),
                        metaData?.product_currency_symbol
                      )
                    : ""
                }`}
                buttonStyle={
                  !totalOffer ? styles.disableButtonWrapper : styles.offerBtn
                }
                textStyle={
                  !totalOffer ? styles.disableText : styles.offerBtnText
                }
                onPress={customOfferFormik.handleSubmit}
                disabled={totalOffer ? false : true}
                loader={makeOfferLodaer}
              />
            </View>
          </View>
        ))}
    </View>
  );
};

export default MakeOfferCard;

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
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
    alignItems: "center",
    justifyContent: "center",
  },
  offerListDetails: {
    flex: 1,
  },
  offerAmountDetailsView: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerAmountTotal: {
    color: "#AA2731",
    fontSize: 12,
    marginRight: 4,
    fontFamily: "DMSansMedium",
  },
  offerAmountTotalTitle: {
    color: "#AA2731",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "DMSansMedium",
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
  btns: {
    flexDirection: "row",
  },
  btnViewLeft: {
    width: "50%",
    marginRight: 4,
  },
  btnMakeOffer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#FF3B4A",
    borderRadius: 12,
    padding: 9,
  },
  btnViewRight: {
    width: "50%",
    marginLeft: 4,
  },
  btnMakeOfferText: {
    color: "#FF3B4A",
    textAlign: "center",
    width: "100%",
    fontSize: 14,
  },
  btnBuyText: {
    color: "white",
    textAlign: "center",
    width: "100%",
    fontSize: 14,
  },
  btnBuy: {
    backgroundColor: "#FF3B4A",
    width: "100%",
    borderWidth: 1,
    borderColor: "#FF3B4A",
    borderRadius: 12,
    padding: 9,
  },
  btnReserve: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#212C3D",
    borderRadius: 12,
    padding: 9,
  },
  btnReserveText: {
    color: "#212C3D",
    textAlign: "center",
    width: "100%",
    fontSize: 14,
  },
  offerListView: {
    flexDirection: "row",
    gap: 8,
  },
  offerList: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: 8,
    padding: 15,
  },
  offerListActive: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFBEC3",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#FFEBED",
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
  unavailableContainer: {
    backgroundColor: "#FFEBED",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFBEC3",
  },
  unavailableText: {
    color: "#AA2731",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textAlign: "center",
  },
});
