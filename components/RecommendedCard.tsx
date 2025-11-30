import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import React, { useState, useCallback } from "react";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { fontSz } from "../constants";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import LineLoader from "./LineLoader";
import { formatAmount } from "@helper/formatCash";
import { useRoute } from "@react-navigation/native";
import CustomButton from "./CustomButton";
import { useI18n } from "@hooks/use-i18n";
import { Ionicons } from "@expo/vector-icons";
import ImagePreviewModal from "@modals/ImagePreviewModal";

interface IRecommendedCard {
  imageSource: any;
  title: string;
  size?: string;
  price?: any;
  width?: any;
  marginRight?: any;
  isServerImage?: boolean;
  imageBackground?: any;
  isHidefavourite?: boolean;
  itemId?: string;
  isUserFavorite?: boolean;
  handleIsFavourite?: any;
  count?: any;
  loader?: boolean;
  onPress?: any;
  hideBuyButton?: boolean;
  dontRefetchAfterAddedToFav?: boolean;
  isAdd?: boolean;
  currency?: string;
  handleAdd?: () => void;
  isActive?: boolean;
  disableBundleBtn?: boolean;
  contentFit?: "contain" | "cover";
}
const RecommendedCard = React.memo(({
  imageSource,
  title,
  size,
  price,
  width,
  marginRight,
  isServerImage,
  imageBackground,
  isHidefavourite,
  itemId,
  isUserFavorite,
  handleIsFavourite,
  count,
  loader,
  onPress,
  hideBuyButton,
  dontRefetchAfterAddedToFav,
  isAdd,
  currency,
  isActive,
  handleAdd,
  disableBundleBtn,
  contentFit = "contain",
}: IRecommendedCard) => {
  // console.log("\n\n imageSource :>> \t\t", { imageSource, title }, "\n\n---");
  const { t } = useI18n();
  const toast = useToast();

  const [isHeartSelected, setIsHeartSelected] = useState(false);
  const [favLoader, setFavLoader] = useState(false);
  const [activeFavId, setActiveFavId] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [didLongPress, setDidLongPress] = useState(false);
  const dispatch = useAppDispatch();
  const route = useRoute();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setDidLongPress(false);
  }, []);

  const handleLongPress = useCallback(() => {
    if (imageSource) {
      setDidLongPress(true);
      setIsPreviewVisible(true);
    }
  }, [imageSource]);

  const handleHeartPress = () => {
    setIsHeartSelected(!isHeartSelected);
  };

  const handleFollowAndUnfollow = (selectedData: any) => {
    if (!token) {
      // dispatch(setShowModal(true));
      // return dispatch(setLoginModal(true));
      return;
    }

    setFavLoader(true);
    setActiveFavId(selectedData?.itemId);

    let data = {
      itemId: selectedData?.itemId,
    };

    let getNewServer = !selectedData?.isUserFavorite
      ? wardrobeServices.favouriteItem(data, token)
      : wardrobeServices.removeFavouriteItem(data, token);

    getNewServer
      .then((res: any) => {
        setActiveFavId("");
        setFavLoader(false);
        if (res?.status === 200) {
          // dispatch(setRefetchUserState(true));
          return handleIsFavourite(selectedData?.itemId);
        }
        if (res?.responseCode === 401) {
          return router.replace("/Onboarding");
        }
        return toast.show(`${res?.detail || res?.Message}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error: any) => {
        setActiveFavId("");
        setFavLoader(false);
      });
  };

  return (
    <View
      style={[
        styles.cardContainer,
        { width: width || 170 },
        { marginRight: marginRight || 10 },
      ]}
    >
      {loader ? (
        <View style={{ aspectRatio: 3 / 4, width: "100%" }}>
          <LineLoader />
        </View>
      ) : (
        <>
          <Pressable
            style={({ pressed }) => [
              pressed && {
                opacity: 0.8,
                backgroundColor: "rgba(255, 255, 255, .2)",
              },
              {
                width: width || 170,
                aspectRatio: 3 / 4,
                position: "absolute",

                zIndex: 1,
              },
            ]}
            onPress={
              onPress
                ? () => {
                  if (didLongPress) {
                    setDidLongPress(false);
                    return;
                  }
                  onPress();
                }
                : () => {
                  if (didLongPress) {
                    setDidLongPress(false);
                    return;
                  }
                  router.push(`/ItemDetails/${itemId}`);
                }
            }
            onLongPress={handleLongPress}
            delayLongPress={300}
          ></Pressable>
          <View style={styles.imageContainer}>
            <Image
              source={isServerImage ? { uri: imageSource } : imageSource}
              style={[styles.cardImage, imageBackground]}
              contentFit={"cover"}
              contentPosition={"top"}
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        </>
      )}

      {!isHidefavourite &&
        (token ? (
          itemId === activeFavId && favLoader ? (
            <TouchableOpacity style={styles.heartIconLoaderContainer}>
              <ActivityIndicator size={"small"} color={"#FF3B4A"} />
            </TouchableOpacity>
          ) : loader ? (
            ""
          ) : (
            <TouchableOpacity
              onPress={
                favLoader
                  ? () => { }
                  : () =>
                    handleFollowAndUnfollow({
                      itemId,
                      isUserFavorite,
                    })
              }
              style={styles.heartIconContainer}
            >
              {count > 0 && <Text style={styles.favCount}>{count}</Text>}

              <Image
                source={
                  isUserFavorite
                    ? require("../assets/images/svg/like2.png")
                    : require("../assets/images/svg/like.png")
                }
                style={styles.detailIcon}
                contentFit="contain"
                cachePolicy="memory"
              />
            </TouchableOpacity>
          )
        ) : (
          ""
        ))}
      {loader && (
        <View style={{ width: "100%" }}>
          <View style={{ height: 10, width: "100%", marginTop: 8 }}>
            <LineLoader />
          </View>

          <View
            style={{
              height: 10,
              width: "70%",
              marginTop: 8,
            }}
          >
            <LineLoader />
          </View>
        </View>
      )}

      {!loader && (
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {/* {truncateByCharacters(title, 25)} */}
            {title}
          </Text>
          {!isAdd && size && <Text style={styles.cardTitle2}>{size}</Text>}
          {!isAdd && price && (
            <View style={styles.cardPrice}>
              <Text style={styles.priceText}>
                {formatAmount(price || 0, currency)}
              </Text>
              {/* TouchableOpacity for the Buy Button */}
              {!hideBuyButton && (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => {
                    if (!profile) {
                      dispatch(setIsShownLoginModal(true));
                    } else {
                      router.push(`/ItemPurchase/${itemId}`);
                    }
                  }}
                >
                  <View style={styles.buyButtonContent}>
                    <Ionicons name="cart-outline" size={18} color="#fff" />
                    <Text style={styles.buyButtonText}>{t('marketplace.buy')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
          {isAdd && (
            <View>
              <View style={styles.amountAndSizeView}>
                <Text style={styles.sizeAddView}>{size}</Text>
                <Text style={styles.priceForAdd}>
                  {formatAmount(price || 0, currency)}
                </Text>
              </View>
              <View>
                <CustomButton
                  disabled={disableBundleBtn}
                  title={isActive ? "Remove" : "Add"}
                  onPress={handleAdd}
                  buttonStyle={
                    isActive
                      ? styles.activeAddBtn
                      : disableBundleBtn
                        ? styles.addDisableBtn
                        : styles.addBtn
                  }
                  textStyle={
                    isActive
                      ? styles.activeAddTextBtn
                      : disableBundleBtn
                        ? styles.addDisableTextBtn
                        : styles.addTextBtn
                  }
                />
              </View>
            </View>
          )}
        </View>
      )}
      <ImagePreviewModal
        isVisible={isPreviewVisible}
        onClose={handleClosePreview}
        uri={isServerImage ? imageSource : imageSource?.uri || ''}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.itemId === nextProps.itemId &&
    prevProps.isUserFavorite === nextProps.isUserFavorite &&
    prevProps.count === nextProps.count &&
    prevProps.imageSource === nextProps.imageSource &&
    prevProps.title === nextProps.title &&
    prevProps.price === nextProps.price &&
    prevProps.size === nextProps.size &&
    prevProps.loader === nextProps.loader &&
    prevProps.isActive === nextProps.isActive
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    // marginRight: 10,
    // width: 170,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4, // Instagram-style 3:4 ratio
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    alignSelf: "flex-start",
    width: "100%",
  },
  cardTitle: {
    fontFamily: "DMSansSemiBold",
    fontSize: fontSz(14),
    color: "#374151",
    textAlign: "left",
    marginTop: 4,
    justifyContent: "flex-start",
    textTransform: "capitalize",
  },
  cardTitle2: {
    fontFamily: "DMSansMedium",
    fontSize: 14,
    color: "#000000",
    width: "100%",
    textAlign: "left",
    marginTop: 4,
    justifyContent: "flex-start",
    textTransform: "uppercase",
  },

  cardPrice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  priceText: {
    fontFamily: "DMSansBold",
    fontSize: 12,
    color: "rgba(144, 149, 158, 1)",
  },
  heartIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 26,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  heartIconLoaderContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    borderRadius: 30,
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  favCount: {
    fontSize: 12,
    color: "rgba(107, 114, 126, 1)",
    marginLeft: 5,
  },
  detailIcon: {
    width: 29,
    height: 29,
  },
  buyButton: {
    backgroundColor: Colors.light.primaryBase,
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  amountAndSizeView: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
    marginBottom: 4,
  },
  priceForAdd: {
    fontFamily: "DMSansBold",
    fontSize: 12,
    color: "#212C3D",
    textAlign: "right",
    flex: 1,
  },
  sizeAddView: {
    fontFamily: "DMSansMedium",
    fontSize: 14,
    color: "#90959E",
    textTransform: "uppercase",
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "#212C3D",
    padding: 7,
    borderRadius: 12,
  },
  addDisableBtn: {
    borderWidth: 1,
    backgroundColor: "rgba(255, 216, 219, 1)",
    padding: 7,
    borderRadius: 12,
    borderColor: "rgba(255, 216, 219, 1)",
  },
  addTextBtn: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    color: "#212C3D",
    fontFamily: "DMSansMedium",
  },
  addDisableTextBtn: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    color: "#FF9DA4",
    fontFamily: "DMSansMedium",
  },
  activeAddBtn: {
    borderWidth: 1,
    borderColor: "#FF3B4A",
    padding: 7,
    borderRadius: 12,
  },
  activeAddTextBtn: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    color: "#FF3B4A",
    fontFamily: "DMSansMedium",
  },
});

RecommendedCard.displayName = "RecommendedCard";

export default RecommendedCard;
