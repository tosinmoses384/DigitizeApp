import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";

import RecommendedCard from "../../components/RecommendedCard";
import MyResponsiveGrid from "../../components/MyResponsiveGrid";
import SearchInput from "../../components/SearchInput";
import wardrobeServices from "../../services/features/wardrobe-service/wardrobeServices";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { useNavigation } from "@react-navigation/native";
import { setTemporaryAddItemToOutfit } from "../../redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import fileServerServices from "@services/features/file-server/fileServer";
import { removeImageBackground, canProcessImageForBackgroundRemoval } from "../../utils/backgroundRemovalUtils";

interface ISelectitems {
  onClose?: any;
  isEmbededInModal?: boolean;
}

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
}

const Selectitems = ({ onClose, isEmbededInModal }: ISelectitems) => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const [cardWidth, setCardWidth] = useState(172);
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems]: any = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const { temporaryAddItemToOutfitSlice }: any = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );
  const [pageToken, setPageToken] = useState("");
  const [imageLoader, setImageLoader] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);

  const getItems = () => {
    // setLoading(true);
    if (pageToken) {
      wardrobeServices
        .itemsQuery(token, searchValue, "12", profile?.id || '', pageToken || "", "")
        .then((res: any) => {
          // setLoading(false);

          let newData = res?.data?.dataset || [];

          setItems([...items, ...newData]);

          setPageToken(res?.data?.pageToken);

          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
        })
        .catch((error) => {
          // setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (token) {
      setPageToken("");
      setItems([]);
      setLoading(true);

      wardrobeServices
        ?.itemsQuery(token, searchValue, "12", profile?.id || '', "", "")
        .then((res: any) => {
          setLoading(false);

          setItems(res?.data?.dataset);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router?.push("/Onboarding");
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  }, [token, searchValue, profile?.id]);

  const addItemToOutfit = useCallback((item: any, imageUri: string, showToast?: ToastDetails, backgroundRemoved?: boolean) => {
    const getNewData = {
      ...item,
      itemImageUrls: [imageUri],
      backgroundRemoved: backgroundRemoved ?? false,
    };

    if (__DEV__) {
      console.log('[addItemToOutfit] Item data:', {
        itemId: item.id,
        imageUri,
        backgroundRemoved: backgroundRemoved ?? false,
        hasBackgroundRemovedProp: getNewData.backgroundRemoved,
      });
    }

    dispatch(
      setTemporaryAddItemToOutfit([
        ...temporaryAddItemToOutfitSlice,
        getNewData,
      ])
    );

    if (showToast) {
      setToastDetails(showToast);
      setTimeout(() => setToastDetails(null), 3000);
    }

    return isEmbededInModal ? onClose?.() : router.push('/collage');
  }, [dispatch, temporaryAddItemToOutfitSlice, isEmbededInModal, onClose]);

  const getImagesFromServer = async (
    resourceName: string,
    resourceId: string,
    item: any
  ) => {
    setImageLoader(true);
    setActiveItem(item?.id);
    setToastDetails(null);

    try {
      const originalImageUri = item?.itemImageUrls?.[0];

      if (originalImageUri && canProcessImageForBackgroundRemoval(originalImageUri)) {

        const backgroundRemovalResult = await removeImageBackground(originalImageUri, {
          trim: true,
          timeout: 20000
        });

        if (backgroundRemovalResult.backgroundRemoved && !backgroundRemovalResult.error) {
          setImageLoader(false);
          setActiveItem("");

          return addItemToOutfit(item, backgroundRemovalResult.uri, undefined, true);
        }
      }

      const res = await fileServerServices?.getTransparentOutfitPicture(token, resourceName, resourceId);

      if (res?.status === 200) {
        setImageLoader(false);
        setActiveItem("");

        const processedImageUri = (res?.data as any)?.data?.resourceUrl || (res?.data as any)?.resourceUrl;
        return addItemToOutfit(item, processedImageUri);
      } else {
        setImageLoader(false);
        setActiveItem("");

        return addItemToOutfit(
          item,
          originalImageUri,
          {
            message: "Added with original image - background removal unavailable",
            type: "info"
          }
        );
      }

    } catch {
      setImageLoader(false);
      setActiveItem("");

      const originalImageUri = item?.itemImageUrls?.[0];
      if (originalImageUri) {
        return addItemToOutfit(
          item,
          originalImageUri,
          {
            message: "Added with original image - background removal unavailable",
            type: "info"
          }
        );
      } else {
        setToastDetails({
          message: "Failed to add item - no image available",
          type: "error"
        });
        setTimeout(() => setToastDetails(null), 3000);
      }
    }
  };

  const extractFilenameFromUrl = (url: any) => {
    if (!url) {
      return ""; // Or handle the case of an empty/null URL as needed
    }
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const handleAddToOutfit = (item: any) => {
    const checkIfOutFitIsAdded = temporaryAddItemToOutfitSlice?.find(
      (list: any) => list?.id === item?.id
    );

    if (!checkIfOutFitIsAdded) {
      return getImagesFromServer(
        extractFilenameFromUrl(item?.itemImageUrls?.[0]),
        item?.requestId,
        item
      );
    }
    return isEmbededInModal ? onClose?.() : router.push('/collage');
  };

  const template = items?.map((item: any, index: number) => (
    <Pressable
      key={index}
      style={[styles.card, { width: cardWidth, position: "relative" }]}
      onPress={!imageLoader ? () => handleAddToOutfit(item) : () => { }}
    >
      {activeItem === item?.id && imageLoader && (
        <View
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            zIndex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} color={"#FF3B4A"} />
        </View>
      )}

      <RecommendedCard
        key={index}
        isServerImage
        title={item?.brandName}
        imageSource={item?.itemImageUrls?.[0]}
        width={"100%"}
        marginRight={0}
        isHidefavourite
        onPress={!imageLoader ? () => handleAddToOutfit(item) : () => { }}
      />
    </Pressable>
  ));

  const emptyTemplate = getEmptyStateCountLoader(8)?.map((_list, index: number) => {
    return (
      <View key={index} style={[styles.card, { width: cardWidth }]}>
        <RecommendedCard
          imageSource={""}
          size={""}
          title={""}
          price={""}
          width={"100%"}
          isServerImage
          itemId={""}
          loader
        />
      </View>
    );
  });

  return (
    <BottomSheetModalProvider>
      <KeyboardAvoidingView style={styles.wrapper}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingTop:
              Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            paddingHorizontal: 20,
          }}
        >
          <StackHeader
            title="Select item"
            onPress={
              isEmbededInModal
                ? () => onClose?.()
                : () => router.replace("/outfit")
            }
          />

          {toastDetails && (
            <View style={styles.toastContainer}>
              <View style={[
                styles.toast,
                toastDetails.type === "success" ? styles.toastSuccess :
                  toastDetails.type === "error" ? styles.toastError :
                    styles.toastInfo
              ]}>
                <Text style={styles.toastText}>{toastDetails.message}</Text>
              </View>
            </View>
          )}

          <View style={styles.searchView}>
            <SearchInput
              value={searchValue}
              onChangeText={(value: string) => setSearchValue(value)}
            />
          </View>
          {loading && !searchValue ? (
            <MyResponsiveGrid
              template={emptyTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          ) : (
            <ScrollView
              onScroll={getItems}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            >
              <MyResponsiveGrid
                template={template}
                getNumberOfRows={(data: number) => setCardWidth(data)}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModalProvider>
  );
};

export default Selectitems;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
  searchView: {
    marginBottom: 28,
  },
  toastContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastSuccess: {
    backgroundColor: "#D4EDDA",
  },
  toastError: {
    backgroundColor: "#F8D7DA",
  },
  toastInfo: {
    backgroundColor: "#D1ECF1",
  },
  toastText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#1C1C1E",
  },
});
