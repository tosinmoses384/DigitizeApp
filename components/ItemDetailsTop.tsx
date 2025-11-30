import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import ShareIcon from "../assets/images/svg/share.svg";
import { formatAmount } from "@helper/formatCash";
import { starTemplate } from "@helper/starTemplate";
import CustomButton from "./CustomButton";
import { truncateByCharacters } from "@helper/truncateText";
import { getInitials } from "@helper/getInitials";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useAppDispatch, useAppSelector } from "@redux/store";
import {
  setSellerId,
  setBrandValue,
  setPageTitle,
} from "@redux/slice/filters/filterSlice";
import {
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useToast } from "react-native-toast-notifications";
import ShareModal from "modals/ShareModal";
import { useI18n } from "../hooks/use-i18n";

interface IItemDetailsTop {
  itemDetails: any;
  isSellerSameAsBuyer: boolean;
  isContentOnly?: boolean;
  openViewer?: (index: number) => void;
}
const { width } = Dimensions.get("window");

const HEADER_HEIGHT = 410;

const ItemDetailsTop = ({
  itemDetails,
  isSellerSameAsBuyer,
  isContentOnly,
  openViewer,
}: IItemDetailsTop) => {
  const { t } = useI18n();
  const { itemId }: any = useLocalSearchParams();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef: any = useRef(null);
  const images = itemDetails?.itemImageUrls || [];
  const [askSellerLoader, setAskSellerLoader] = useState(false);
  const [favLoader, setFavLoader] = useState(false);
  const [isUserFavorite, setIsUserFavorite] = useState(false);
  const [isShowShareLink, setIsShowShareLink] = useState(false);

  const sellerRating = useMemo(() => {
    const raw = Number(itemDetails?.sellerInfo?.ratings ?? 0);
    if (!Number.isFinite(raw)) return 0;
    const clamped = Math.max(0, Math.min(5, Math.round(raw)));
    return clamped;
  }, [itemDetails?.sellerInfo?.ratings]);

  const reviewCount = useMemo(() => {
    const count = Number(itemDetails?.sellerInfo?.reviewsReceivedCount ?? 0);
    return Number.isFinite(count) ? count : 0;
  }, [itemDetails?.sellerInfo?.reviewsReceivedCount]);

  // Image navigation helpers removed as they were unused

  // Scroll helper removed (unused)

  const askSeller = () => {
    setAskSellerLoader(true);
    marketplaceServices
      ?.askSeller(token, profile?.countryId, itemDetails?.itemId)
      .then((res: any) => {
        setAskSellerLoader(false);
        if (res?.data?.conversationId) {
          dispatch(setMetaData(res?.data?.metadata));
          dispatch(setCurrentChatName(itemDetails?.sellerInfo?.name));
          return router.push(`/chats/${res?.data?.conversationId}`);
          // return ("conversation>>", res?.data?.conversationId);
        }
        // ("res>>>", res);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setAskSellerLoader(false);
      });
  };

  const handleRouteTopage = () => {
    if (!token) {
      return router.push("/Onboarding");
    }
    dispatch(setMetaData(null));
    if (itemDetails?.buyerConversation) {
      dispatch(setMetaData(itemDetails?.buyerConversation?.metadata));
      dispatch(setCurrentChatName(itemDetails?.sellerInfo?.name));
      return router.push(`/chats/${itemDetails?.buyerConversation?.id}`);
    }
    askSeller();
    // push(data?.link);
    return;
  };

  const handleRouteToSeller = () => {
    dispatch(setSellerId(itemDetails?.sellerInfo?.id));

    router.push("/SellerProfile");
  };

  const handleBrandClick = () => {
    if (!itemDetails?.itemBrand) return;
    
    // Navigate to filter page
    router.push("/filterPage");
    
    // Set the brand filter in Redux (similar to Search.tsx implementation)
    dispatch(setPageTitle(itemDetails?.itemBrand));
    dispatch(setBrandValue({ 
      value: itemDetails?.itemBrand, 
      id: itemDetails?.itemBrandId || itemDetails?.itemBrand // Use brandId if available, fallback to brand name
    }));
  };

  useEffect(() => {
    if (itemDetails) {
      setIsUserFavorite(itemDetails?.isItemFavourited);
    }
  }, [itemDetails]);

  const handleFollowAndUnfollow = () => {
    // if (!profile) {
    //   dispatch(setShowModal(true));
    //   return dispatch(setLoginModal(true));
    // }

    setFavLoader(true);

    let data = {
      itemId: itemDetails?.itemId,
    };

    let getNewServer = !isUserFavorite
      ? wardrobeServices.favouriteItem(data, token)
      : wardrobeServices.removeFavouriteItem(data, token);

    getNewServer
      .then((res: any) => {
        setFavLoader(false);
        if (res?.status === 200) {
          return setIsUserFavorite(!isUserFavorite);
        }
        if (res?.responseCode === 401) {
          return router.push("/");
        }
        return toast.show(`${res?.detail || res?.Message}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error) => {
        setFavLoader(false);
      });
  };

  const renderShareLink = () => isShowShareLink && (
    <ShareModal
      onClose={() => setIsShowShareLink(false)}
      isShow={isShowShareLink}
      shareType="item"
      itemData={{ id: itemId, title: itemDetails?.itemName, seller: { firstName: itemDetails?.sellerInfo?.name } }}
    />
  )

  if (isContentOnly) {
    return (
      <View>
        <View style={styles.bodyView}>
          <View style={styles.userSectionCard}>
            <Pressable
              style={styles.userImageCover}
              onPress={handleRouteToSeller}
            >
              {itemDetails?.sellerInfo?.profileImageUrl ? (
                <Image
                  source={{ uri: itemDetails?.sellerInfo?.profileImageUrl }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 48,
                  }}
                  contentFit="cover"
                />
              ) : (
                <Text>
                  {getInitials(itemDetails?.sellerInfo?.name || "")}
                </Text>
              )}
            </Pressable>
            <Pressable
              style={styles.sellerNameAndRating}
              onPress={handleRouteToSeller}
            >
              <Text style={styles.sellerName}>
                {truncateByCharacters(itemDetails?.sellerInfo?.name || "", 30)}
              </Text>
              <View style={styles.reviewsContainer}>
                {starTemplate(sellerRating)}
                <Text style={styles.reviewText}>{reviewCount} {t('marketplace.reviews')}</Text>
              </View>
            </Pressable>
            {!itemDetails?.isSellerHolidayModeActivated &&
              !isSellerSameAsBuyer && (
                <View style={styles.buttonContainer}>
                  <CustomButton
                    loader={askSellerLoader}
                    title={t('marketplace.askSeller')}
                    buttonStyle={styles.askSeller}
                    textStyle={styles.askSellerBtnText}
                    onPress={handleRouteTopage}
                  />
                </View>
              )}
          </View>
          <Text style={styles.itemName}>{itemDetails?.itemName}</Text>
          <View style={styles.sizeConditionAndBrand}>
            <Text
              style={styles.size}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`${itemDetails?.itemSizeId}`}</Text>

            <View style={styles.conditonDot}></View>
            <Text
              style={styles.sizeCondition}
            >{`${itemDetails?.itemCondition}`}</Text>
            <View style={styles.conditonDot}></View>

            <Pressable onPress={handleBrandClick}>
              <Text
                style={[styles.brand, styles.clickableBrand]}
              >{`${itemDetails?.itemBrand}`}</Text>
            </Pressable>
          </View>
          <Text style={styles.price}>
            {formatAmount(
              itemDetails?.itemPrice || 0,
              itemDetails?.currencySymbol
            )}
          </Text>
          <Text style={styles.description}>
            {itemDetails?.itemDescription}
          </Text>
          {itemDetails?.isSellerBundleDiscountAvailable && (
            <View style={styles.bundleCard}>
              <View style={styles.content}>
                <Text style={styles.bundleCardContentTop}>{t('marketplace.shopBundles')}</Text>
                <Text style={styles.bundleCardContentBottom}>
                  {itemDetails?.sellerBundleDiscountMessage}
                </Text>
              </View>

              {!isSellerSameAsBuyer && (
                <View style={styles.bundleBtnView}>
                  <CustomButton
                    title={t('marketplace.createBundle')}
                    buttonStyle={styles.bundleBtn}
                    textStyle={styles.bundleBtnText}
                    onPress={() =>
                      router.push(
                        `/BuildBundle/${itemDetails?.sellerInfo?.id}`
                      )
                    }
                  />
                </View>
              )}
            </View>
          )}
        </View>
        {renderShareLink()}
      </View>
    );
  }

  // Removed unused image load handler and related undefined vars

  return (
    <View style={[styles.imageWrapper, { position: "absolute", height: HEADER_HEIGHT }]}>
      <View style={styles.imageActionView}>
        <View style={styles.backIconView}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.shareBtn,
            ]}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              color={"rgba(70, 79, 84, 1)"}
              size={20}
            />
          </Pressable>
        </View>
        <View style={{ marginRight: 6 }}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.shareBtn,
            ]}
            onPress={() => setIsShowShareLink(true)}
          >
            <ShareIcon width={14} height={14} />
          </Pressable>
        </View>
        <View>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.shareBtn,
            ]}
            onPress={favLoader ? () => {} : handleFollowAndUnfollow}
          >
            {favLoader ? (
              <ActivityIndicator size={"small"} color={"#FF3B4A"} />
            ) : (
              <Image
                source={
                  isUserFavorite
                    ? require("../assets/images/svg/like2.png")
                    : require("../assets/images/svg/like.png")
                }
                style={styles.detailIcon}
                contentFit="contain"
              />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(newIndex);
        }}
        contentContainerStyle={{ width: width * images.length }}
      >
        {images?.map((image: any, index: number) => (
          <View key={index}>
            <Image
              source={{ uri: image }}
              style={{ width: width, height: HEADER_HEIGHT }}
              contentFit="cover"
              contentPosition={{ top: 0 }}
            />
            <View style={styles.imageCountContainer} pointerEvents="none">
              <Text style={styles.imageCountText}>
                {currentIndex + 1 + "/" + images?.length}
              </Text>
              <Ionicons name="camera" size={15} color={"white"} />
            </View>
          </View>
        ))}
      </ScrollView>
      {renderShareLink()}
    </View>
  );
};

export default ItemDetailsTop;

const styles = StyleSheet.create({
  imageWrapper: {
    height: HEADER_HEIGHT,
    position: "relative",
    backgroundColor: "transparent",
  },
  imageActionView: {
    position: "absolute",
    top: 46,
    width: "100%",
    zIndex: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
  },
  backIconView: {
    flex: 1,
  },
  shareBtn: {
    width: 28,
    height: 28,
    backgroundColor: "white",
    borderRadius: 28,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.5,
  },
  bodyView: {
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  userSectionCard: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 8,
  },
  userImageCover: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(237, 242, 247, 0.8)",
    borderRadius: 48,
    marginRight: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCountContainer: {
    position: "absolute",
    zIndex: 1,
    // top: "80%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: "100%",
    display: "flex",
    alignItems: "flex-end",
  },
  imageCountText: {
    fontSize: 11,
    marginRight: 4,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  sellerNameAndRating: {
    flex: 1,
  },
  buttonContainer: {
    width: "30%",
    marginLeft: 5,
  },
  sellerName: {
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    color: "rgba(30, 34, 38, 1)",
    textTransform: "capitalize",
    marginBottom: 5,
  },
  reviewsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewText: {
    fontSize: 10,
    color: "rgba(30, 34, 38, 1)",
    fontFamily: "DMSansMedium",
  },

  askSeller: {
    width: "100%",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(92, 111, 127, 1)",
    paddingVertical: 8,
  },
  askSellerBtnText: {
    fontSize: 12,
    width: "100%",
    textAlign: "center",
    color: "rgba(92, 111, 127, 1)",
  },
  itemName: {
    textTransform: "capitalize",
    marginBottom: 4,
    color: "rgba(7, 24, 39, 1)",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  sizeConditionAndBrand: {
    flexDirection: "row",
    fontSize: 12,
    fontWeight: "500",
    alignItems: "center",
    flex: 1,
  },
  sizeCondition: {
    fontSize: 12,
    color: "rgba(54, 61, 64, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
    marginRight: 4,
  },
  size: {
    fontSize: 12,
    color: "rgba(54, 61, 64, 1)",
    fontFamily: "DMSansBold",
    textTransform: "uppercase",
    marginRight: 4,
  },
  brand: {
    fontSize: 12,
    color: "rgba(212, 49, 62, 1)",
    textTransform: "capitalize",
  },
  clickableBrand: {
  },
  price: {
    fontSize: 14,
    color: "rgba(212, 49, 62, 1)",
    fontWeight: "700",
    marginTop: 41,
    marginBottom: 8,
  },
  description: {
    color: "rgba(35, 35, 35, 1)",
    fontSize: 12,
    textTransform: "capitalize",
    marginBottom: 16,
  },
  bundleCard: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  bundleBtnView: {},
  bundleBtn: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 74, 1)",
  },
  bundleBtnText: {
    fontSize: 14,
    color: "rgba(255, 59, 74, 1)",
    fontFamily: "DMSansSemiBold",
  },
  bundleCardContentTop: {
    color: "rgba(30, 34, 38, 1)",
    fontSize: 12,
    marginBottom: 1,
    fontFamily: "DMSansMedium",
  },
  bundleCardContentBottom: {
    color: "rgba(92, 111, 127, 1)",
    fontSize: 10,
  },
  conditonDot: {
    width: 5,
    height: 5,
    backgroundColor: "#1E2226",
    borderRadius: "100%",
    marginLeft: 4,
    marginRight: 4,
  },
  detailIcon: {
    width: 29,
    height: 29,
  },
});
