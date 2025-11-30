import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { Colors } from "@constants/Colors";
import CustomButton from "@components/CustomButton";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";

import { useToast } from "react-native-toast-notifications";
import StackHeader from "@components/StackHeader";
import { formatAmount } from "@helper/formatCash";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { Ionicons } from "@expo/vector-icons";
import BuyerProtection from "app/BuyerProtection";
import CustomToastNotification from "@helper/toast-message";
import {
  setCheckoutData,
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
interface IReviewBundleModal {
  onClose: any;
  isShow: boolean;
  details: any;
  actualTotalAmount: number;
  percentageAmount: number;
  currency: string;
  buyerFees: any;
  sellerId: any;
  handleSetBundleDetails: any;
  seller: any;
}
const ReviewBundleModal = ({
  onClose,
  isShow,
  percentageAmount,
  currency,
  actualTotalAmount,
  buyerFees,
  details,
  sellerId,
  seller,
  handleSetBundleDetails,
}: IReviewBundleModal) => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token }: any = useAppSelector((state) => state?.userProfileSlice);
  const [orderDetails, setOrderDetails]: any = useState([]);
  const [buyerLodaer, setBuyerLodaer] = useState(false);
  const [askBuyerLodaer, setAskBuyerLodaer] = useState(false);
  const [makeOfferLodaer, setMakeOfferLodaer] = useState(false);
  const [showBuyerProtection, setShowBuyerProtection] = useState(false);
  const [toastDetails, setToastDetails]: any = useState(null);
  const getPercentageAmount = (totalAmount: any, percentage: any) => {
    if (percentage === undefined || percentage === null) {
      return totalAmount;
    }

    if (typeof percentage !== "number" || percentage < 0 || percentage > 100) {
      return totalAmount; // Or handle invalid percentage as needed (e.g., throw an error)
    }

    const percentageAmount = (totalAmount * percentage) / 100;
    return percentageAmount;
  };

  useEffect(() => {
    if (buyerFees?.length) {
      const distructureData = buyerFees?.map((list: any, index: any) => {
        return {
          id: index + 11,
          title: list?.description,
          icon: <Ionicons name="information-circle" size={15} />,
          amt:
            list?.chargeType === "Percentage"
              ? getPercentageAmount(actualTotalAmount, list?.fee)
              : list?.fee,
          amount:
            list?.chargeType === "Percentage"
              ? formatAmount(
                  getPercentageAmount(actualTotalAmount, list?.fee),
                  currency
                )
              : formatAmount(list?.fee, currency),
        };
      });

      setOrderDetails([
        {
          id: 1,
          title: "Order",
          amt: actualTotalAmount,
          amount: `${formatAmount(actualTotalAmount, currency)}`,
        },
        ...distructureData,
        {
          id: 4,
          title: "Bundle discount",
          amt: -percentageAmount,
          amount: `-${formatAmount(percentageAmount, currency)}`,
          titleStyle: styles.orderBundleTitleRed,
          amountStyle: styles.orderBundleAmountRed,
        },
      ]);
    }
  }, [buyerFees]);

  const totalAmount = orderDetails.reduce(
    (sum: any, item: any) => sum + item.amt,
    0
  );

  const handleBuyItem = () => {
    setBuyerLodaer(true);
    setToastDetails(null);
    const getItemIds = details?.map((list: any) => list?.id);
    let data = {
      sellerUserId: sellerId,
      itemIds: getItemIds,
    };
    const userProfile = marketplaceServices.buyItemBundle(data, token);
    userProfile
      .then((res: any) => {
        setBuyerLodaer(false);
        if (res?.status === 200) {
          let data = res?.data;
          let checkoutData = {
            checkoutProvider: data?.checkoutProvider,
            ...data?.checkoutMetadata,
          };
          dispatch(setCheckoutData(checkoutData));
          onClose?.();
          return router.push(`/BundlePurchase/${res?.data?.id}`);
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }

        return setToastDetails({
          message: `${res?.detail || res?.Message}`,
          type: "error",
          duration: 4000,
        });
        // toast.show(`${res?.detail || res?.Message}`, {
        //   type: "danger",
        //   duration: 4000,
        // });
      })
      .catch((error: any) => {
        setBuyerLodaer(false);
      });
  };

  const handleAskSellerItem = () => {
    setAskBuyerLodaer(true);
    setToastDetails(null);
    const getItemIds = details?.map((list: any) => list?.id);
    let data = {
      sellerUserId: sellerId,
      itemIds: getItemIds,
    };
    const userProfile = marketplaceServices.askSellerItemBundle(data, token);
    userProfile
      .then((res: any) => {
        setAskBuyerLodaer(false);

        if (res?.status === 200) {
          onClose?.();
          dispatch(setCurrentChatName(details?.[0]?.sellerName));
          dispatch(setMetaData(res?.data?.metadata));
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
        // return toast.show(`${res?.detail || res?.Message}`, {
        //   type: "danger",
        //   duration: 4000,
        // });
      })
      .catch((error: any) => {
        setAskBuyerLodaer(false);
      });
  };

  const handleMakeOfferItem = () => {
    const getItemIds = details?.map((list: any) => list?.id);
    let data = {
      sellerUserId: sellerId,
      itemIds: getItemIds,
      offerPrice: totalAmount,
      actualTotalAmount,
    };

    handleSetBundleDetails(data);
  };

  return (
    <NewBottomModal isShow={isShow} onClose={onClose} maxHeight={"100%"}>
      {showBuyerProtection ? (
        <BuyerProtection onClose={() => setShowBuyerProtection(false)} />
      ) : (
        <View
          style={[
            {
              flex: 1,
              backgroundColor: Colors.light.background,
              // paddingHorizontal: 20,
              paddingVertical: 16,
              marginTop: Platform.OS == "android" ? 20 : 20,
            },
          ]}
        >
          <StackHeader
            isShowHeaderShadow
            title="Review Bundle"
            onPress={onClose}
          />
          {toastDetails && (
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          )}

          <View style={styles.body}>
            <View style={styles.imageListView}>
              <Text style={styles.imageListCount}>{details?.length} items</Text>
              <View style={styles.imagesContainer}>
                {details?.map((list: any) => (
                  <View key={list?.id} style={styles.imageContainer}>
                    <Image
                      source={{ uri: list?.image || list?.defaultImage }}
                      style={{ width: 48, height: 48, borderRadius: 4 }}
                    />
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.orderSummaryContainer}>
              <Text style={styles.orderSummaryTitle}>Order Summary</Text>
              {orderDetails?.map((list: any, index: number) => {
                return (
                  <View key={index} style={styles.orderSummaryListView}>
                    <View style={styles.orderTitleWrapper}>
                      <Text
                        style={list?.titleStyle || styles.orderSummaryListTitle}
                      >
                        {list?.title}
                      </Text>
                      {list?.icon && (
                        <TouchableOpacity
                          style={{ marginLeft: 4 }}
                          onPress={() => {
                            setShowBuyerProtection(true);
                            setToastDetails(null);
                          }}
                        >
                          {list?.icon}
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={list?.amountStyle || styles.orderSummaryListAmount}
                    >
                      {list?.amount}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.totalAmountView}>
                <Text style={styles.totalAmountTitle}>Total to pay</Text>
                <Text style={styles.totalAmount}>{`${formatAmount(
                  totalAmount,
                  currency
                )}`}</Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomView}>
            <View style={styles.buyBtnView}>
              <CustomButton
                title="Buy now"
                buttonStyle={styles.buyBtn}
                textStyle={styles.buyBtnText}
                onPress={handleBuyItem}
                loader={buyerLodaer}
                // showLoadingText
                // loadingStyle={styles.loader}
              />
            </View>
            <View style={styles.btnViews}>
              <View style={styles.btnAskSellerView}>
                <CustomButton
                  title="Ask Seller"
                  buttonStyle={styles.btnAskSeller}
                  textStyle={styles.btnAskSellerText}
                  onPress={handleAskSellerItem}
                  loader={askBuyerLodaer}
                  //   showLoadingText
                  //   loadingStyle={styles.loader}
                />
              </View>
              <View style={styles.btnMakeOfferView}>
                <CustomButton
                  title="Make an offer"
                  buttonStyle={styles.btnAskSeller}
                  textStyle={styles.btnAskSellerText}
                  onPress={handleMakeOfferItem}
                  loader={makeOfferLodaer}
                  //   showLoadingText
                  //   loadingStyle={styles.loader}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </NewBottomModal>
  );
};

export default ReviewBundleModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  bottomView: {
    paddingVertical: 16,
  },
  buyBtnView: {
    marginBottom: 12,
  },
  buyBtn: {
    backgroundColor: "#FF3B4A",
    // padding: 9,
    borderRadius: 8,
  },
  buyBtnText: {
    fontSize: 14,
    color: "white",
    width: "100%",
    textAlign: "center",
    fontFamily: "DMSansMedium",
  },
  btnViews: {
    flexDirection: "row",
  },
  btnAskSellerView: {
    width: "50%",
    paddingRight: 4,
  },
  btnMakeOfferView: {
    width: "50%",
    paddingLeft: 4,
  },
  btnAskSeller: {
    borderWidth: 1,
    borderColor: "#5C6F7F",
    // padding: 9,
    borderRadius: 8,
  },
  btnAskSellerText: {
    width: "100%",
    textAlign: "center",
    color: "#5C6F7F",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  orderSummaryContainer: {
    backgroundColor: "white",
    padding: 12,
  },
  orderSummaryTitle: {
    fontSize: 14,
    color: "#212B36",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  orderSummaryListView: {
    flexDirection: "row",
    marginBottom: 8,
  },
  orderTitleWrapper: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
  },
  orderSummaryListTitle: {
    fontSize: 14,
    color: "#212B36",
    textTransform: "capitalize",
    paddingRight: 5,
  },
  orderSummaryListAmount: {
    fontSize: 14,
    color: "#212B36",
    fontFamily: "DMSansMedium",
  },
  orderBundleTitleRed: {
    color: "#D4313E",
    fontSize: 14,
    flex: 1,
    textTransform: "capitalize",
  },
  orderBundleAmountRed: {
    fontSize: 18,
    color: "#D4313E",
    fontFamily: "DMSansMedium",
  },
  totalAmountView: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalAmountTitle: {
    flex: 1,
    color: "#232323",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  totalAmount: {
    color: "#232323",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  imageListView: {
    padding: 8,
    backgroundColor: "white",
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageListCount: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansMedium",
  },
  imageContainer: {
    width: 48,
    height: 48,
    marginLeft: 4,
  },
  imagesContainer: {
    flexDirection: "row",
  },
  loader: {
    textAlign: "center",
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
  },
});
