import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TagItemModal from "@modals/tagItem/TagItemModal";
import {
  clearTagedItems,
  setTagedDetails,
  setTagedItems,
} from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { setWardrobeType } from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import TaggedItemsDisplay from "../../components/TaggedItemsDisplay";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { ResizeMode, Video } from "expo-av";
import fileServerServices from "@services/features/file-server/fileServer";
import { generateGUID } from "@helper/guid-number";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";
import timelineServices from "@services/features/timeline-service/timelineServices";
import axios from "axios";
import { TaggedItem as ServiceTaggedItem } from "@services/features/wardrobe-service/types";
import { useStoryUploadStore } from "@stores/storyUploadStore";

interface IUploadStatusModal {
  isShow: boolean;
  onClose: any;
  fileDetails: any;
  refetch: any;
  loader: boolean;
}
const UploadStatusModal = ({
  isShow,
  onClose,
  fileDetails,
  refetch,
  loader,
}: IUploadStatusModal) => {
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [isShowTag, setIsShowTag] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const videoRef: any = useRef(null);
  const [imageLoader, setImageLoader] = useState(false);
  const [toastDetails, setToastDetails]: any = useState(null);

  const { tagedItemDetails, tagedItems } = useAppSelector(
    (state) => state?.outfitEditDetailsSlice,
  );
  const { wardrobeType } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice,
  );

  const [originalWardrobeType, setOriginalWardrobeType] = useState<
    string | null
  >(null);

  const {
    isImageAlreadyUploaded,
    setImageUploaded,
    setStoryCreating,
    setStoryCreated,
    setUploadError,
    incrementRetryCount,
    resetRetryCount,
    clearCurrentUpload,
    currentUpload,
    cleanupOldUploads,
    triggerStoryRefresh,
  } = useStoryUploadStore();

  // Create a combined array that includes both new tagged items and old single item for backward compatibility
  const allTaggedItems = useMemo(() => {
    const items = [...(tagedItems || [])];

    // If we have the old single item and it's not already in the new array, add it
    if (
      tagedItemDetails &&
      !items.find((item) => item.id === tagedItemDetails.id)
    ) {
      items.push({
        id: tagedItemDetails.id,
        name:
          tagedItemDetails.brandName || tagedItemDetails.name || "Unknown Item",
        imageUrl:
          tagedItemDetails.imageUrl ||
          tagedItemDetails.image ||
          tagedItemDetails.itemDefaultImageUrl ||
          "",
        amount: tagedItemDetails.amount || 0,
        currencySymbol: tagedItemDetails.currencySymbol || "₦",
        type: tagedItemDetails.type || "item",
      });
    }

    return items;
  }, [tagedItems, tagedItemDetails]);

  useEffect(() => {
    if (isShow && originalWardrobeType === null) {
      setOriginalWardrobeType(wardrobeType);
    }
  }, [isShow, wardrobeType, originalWardrobeType]);

  useEffect(() => {
    if (isShow) {
      cleanupOldUploads();
    }
  }, [isShow, cleanupOldUploads]);

  const handleModalClose = () => {
    if (allTaggedItems.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have selected items that will be lost if you close now.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              dispatch(clearTagedItems());
              dispatch(setTagedDetails(null));
              if (originalWardrobeType !== null) {
                dispatch(setWardrobeType(originalWardrobeType));
              }
              setOriginalWardrobeType(null);
              setIsShowTag(false);
              onClose();
            },
          },
        ],
      );
    } else {
      if (originalWardrobeType !== null) {
        dispatch(setWardrobeType(originalWardrobeType));
      }
      setOriginalWardrobeType(null);
      setIsShowTag(false);
      onClose();
    }
  };

  const handleSuccessfulCompletion = () => {
    if (originalWardrobeType !== null) {
      dispatch(setWardrobeType(originalWardrobeType));
    }
    setOriginalWardrobeType(null);
    setIsShowTag(false);
    onClose();
  };

  const handleTagModalNext = (selectedItems: ServiceTaggedItem[]) => {
    const reduxTaggedItems = selectedItems
      .filter(item => item.id && item.name) // Filter out invalid items
      .map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl || '',
        amount: item.amount || 0,
        currencySymbol: item.currencySymbol || '₦',
        type: (item.type || 'item') as 'item' | 'outfit', // Ensure type is always defined
      }));
    
    dispatch(setTagedItems(reduxTaggedItems));
    setIsShowTag(false);
  };

  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.didJustFinish && videoRef.current) {
      ("Video finished, restarting...");

      // setPlayBack?.();
      await videoRef.current.setPositionAsync(0); // Reset video position
      // await videoRef.current.playAsync(); // Restart playback
      setIsPause(false);
    }
  };

  const postNewStory = useCallback(async (resData: any, getGuid: string) => {
    const tagIds = allTaggedItems.map((item) => item.id);

    const data = {
      requestId: getGuid,
      storyType: resData?.contentType?.includes?.("image") ? "Image" : "Video",
      caption: "",
      tagIds: tagIds,
    };

    setStoryCreating(getGuid, fileDetails?.[0]?.uri);

    try {
      const res = await timelineServices.postStories(data, token);
      setImageLoader(false);

      if (res?.status === 200) {
        setStoryCreated(getGuid);
        resetRetryCount();
        triggerStoryRefresh();
        refetch?.();
        dispatch(setTagedDetails(null));
        dispatch(clearTagedItems());
        handleSuccessfulCompletion();
        return;
      }

      if (res?.responseCode === "401" || res?.responseCode === 401) {
        clearCurrentUpload();
        router.push("/Onboarding");
        return;
      }

      const errorMessage = res?.detail || res?.message || "Failed to create story";
      setUploadError(errorMessage);
      
      const canRetry = (currentUpload?.retryCount || 0) < 3;
      setToastDetails({
        message: canRetry 
          ? `${errorMessage}. Tap "Add to story" to retry.`
          : `${errorMessage}. Maximum retries reached.`,
        type: "error",
        duration: 4000,
      });
    } catch (error: any) {
      setImageLoader(false);
      const errorMessage = error?.message || "Network error. Please try again.";
      setUploadError(errorMessage);
      
      const canRetry = (currentUpload?.retryCount || 0) < 3;
      setToastDetails({
        message: canRetry
          ? `${errorMessage} Tap "Add to story" to retry.`
          : `${errorMessage} Maximum retries reached.`,
        type: "error",
        duration: 4000,
      });
    }
  }, [
    allTaggedItems,
    fileDetails,
    token,
    setStoryCreating,
    setStoryCreated,
    setUploadError,
    resetRetryCount,
    currentUpload,
    refetch,
    dispatch,
    onClose,
    clearCurrentUpload,
    triggerStoryRefresh,
  ]);

  const uploadImageToServer = useCallback(async () => {
    setToastDetails(null);
    
    const fileUri = fileDetails?.[0]?.uri;
    const existingUpload = isImageAlreadyUploaded(fileUri);

    if (existingUpload && currentUpload?.isImageUploaded) {
      setImageLoader(true);
      setToastDetails({
        message: "Image already uploaded. Creating story...",
        type: "info",
        duration: 2000,
      });

      const resData = {
        contentType: existingUpload.contentType,
      };
      
      await postNewStory(resData, existingUpload.requestId);
      return;
    }

    const getGuid = generateGUID();
    setImageLoader(true);

    const plartform = Platform.OS === "android";
    
    try {
      const res = await fileServerServices.postStoryImageUpload(
        [fileDetails?.[0]], 
        plartform, 
        getGuid, 
        token
      );

      if (res?.status === 200) {
        const responseData = res?.data as any;
        const contentType = responseData?.ContentType || fileDetails?.[0]?.mimeType;
        setImageUploaded(
          getGuid,
          fileUri,
          fileDetails?.[0]?.mimeType,
          contentType
        );
        
        const resData = {
          contentType: contentType,
        };
        
        await postNewStory(resData, getGuid);
        return;
      }

      if (res?.responseCode === 401) {
        clearCurrentUpload();
        setImageLoader(false);
        router.push("/Onboarding");
        return;
      }

      setImageLoader(false);
      const errorMessage = res?.detail || res?.message || "Failed to upload image";
      setUploadError(errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    } catch (error: any) {
      setImageLoader(false);
      const errorMessage = error?.message || "Network error during image upload";
      setUploadError(errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    }
  }, [
    fileDetails,
    token,
    isImageAlreadyUploaded,
    currentUpload,
    setImageUploaded,
    postNewStory,
    setUploadError,
    clearCurrentUpload,
  ]);

  const handleUpload = useCallback(() => {
    if (currentUpload?.retryCount && currentUpload.retryCount > 0) {
      incrementRetryCount();
    }
    uploadImageToServer();
  }, [uploadImageToServer, currentUpload, incrementRetryCount]);

  const handleUploadVideo = useCallback(async () => {
    setToastDetails(null);
    
    const fileUri = fileDetails?.[0]?.uri;
    const existingUpload = isImageAlreadyUploaded(fileUri);

    if (existingUpload && currentUpload?.isImageUploaded) {
      setImageLoader(true);
      setToastDetails({
        message: "Video already uploaded. Creating story...",
        type: "info",
        duration: 2000,
      });

      const resData = {
        contentType: existingUpload.contentType,
      };
      
      await postNewStory(resData, existingUpload.requestId);
      return;
    }

    const getGuid = generateGUID();
    setImageLoader(true);

    const data = {
      resourceName: fileDetails?.[0]?.fileName,
      contentType: fileDetails?.[0]?.mimeType,
      fileSize: fileDetails?.[0]?.fileSize,
    };

    try {
      const res = await fileServerServices.uploadLink(data, token, getGuid);

      if (res?.status === 200) {
        setImageUploaded(
          getGuid,
          fileUri,
          fileDetails?.[0]?.mimeType,
          fileDetails?.[0]?.mimeType
        );
        
        await uploadToServer(res);
        return;
      }

      if (res?.responseCode === 401) {
        clearCurrentUpload();
        setImageLoader(false);
        router.push("/Onboarding");
        return;
      }

      setImageLoader(false);
      const errorMessage = res?.detail || res?.message || "Failed to upload video";
      setUploadError(errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    } catch (error: any) {
      setImageLoader(false);
      const errorMessage = error?.message || "Network error during video upload";
      setUploadError(errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    }
  }, [
    fileDetails,
    token,
    isImageAlreadyUploaded,
    currentUpload,
    setImageUploaded,
    postNewStory,
    setUploadError,
    clearCurrentUpload,
  ]);

  const getBlobFromUri = async (uri: string): Promise<Blob> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const uploadToServer = useCallback(async (data: any) => {
    const file = await getBlobFromUri(fileDetails?.[0]?.uri);

    try {
      const response = await axios.put(data?.data?.resourceUrl, file, {
        headers: {
          "Content-Type": fileDetails?.[0]?.mimeType,
        },
      });

      if (response.status === 200) {
        const resData = {
          contentType: fileDetails?.[0]?.mimeType,
        };
        await postNewStory(resData, data?.data?.requestId);
      } else {
        setImageLoader(false);
        const errorMessage = "Failed to upload video to server";
        setUploadError(errorMessage);
        setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      }
    } catch (error: any) {
      setImageLoader(false);
      const errorMessage = error?.message || "Failed to upload video";
      setUploadError(errorMessage);
      setToastDetails({
        message: errorMessage,
        type: "error",
        duration: 4000,
      });
    }
  }, [fileDetails, postNewStory, setUploadError]);

  // console.log("filesDetails", fileDetails?.[0]?.uri);

  // handleUploadVideo

  return (
    <NewBottomModal
      isShow={isShow}
      onClose={handleModalClose}
      maxHeight={"100%"}
      contentStyle={{
        backgroundColor: fileDetails?.[0]?.type === "video" ? "black" : "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 0,
        width: "100%", // Or a specific width (e.g., '80%')
        flex: 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar translucent={true} backgroundColor="transparent" />

        {toastDetails && (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: Platform.OS === "ios" ? 20 : 10,
              left: 0,
            }}
          >
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}

        {!isShowTag && (
          <View
            style={
              fileDetails?.[0]?.type === "video"
                ? {
                    flex: 1,
                    backgroundColor: "black",
                    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : 0,
                    position: "relative",
                  }
                : styles.body
            }
          >
            <View style={styles.overlay}>
              {fileDetails?.[0]?.type === "video" && (
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <Pressable
                    onPress={() => {
                      setIsPause(!isPause);
                    }}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    {isPause ? (
                      <Ionicons
                        name="pause"
                        color={"rgba(255, 255, 255, 1)"}
                        size={45}
                        style={{ opacity: 0.5 }}
                      />
                    ) : (
                      <Ionicons
                        name="play"
                        color={"rgba(255, 255, 255, 1)"}
                        size={45}
                        style={{ opacity: 0.5 }}
                      />
                    )}
                  </Pressable>
                </View>
              )}

              <View style={styles.rootHeader}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>Add to story</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.headerCloseIcon,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleModalClose}
                  >
                    <Ionicons
                      name="chevron-back"
                      color={"rgba(255, 255, 255, 1)"}
                      size={20}
                    />
                  </Pressable>
                </View>
              </View>
              {loader ? (
                <View>
                  <ActivityIndicator size={"large"} />
                </View>
              ) : (
                <View style={styles.bottomView}>
                  <View style={styles.tagView}>
                    <TaggedItemsDisplay
                      taggedItems={allTaggedItems}
                      onPress={() => {
                        setIsShowTag(true);
                      }}
                      maxVisibleThumbnails={3}
                      showCount={true}
                    />

                    {allTaggedItems.length > 0 && (
                      <Pressable
                        style={styles.clearButton}
                        onPress={() => {
                          dispatch(clearTagedItems());
                          dispatch(setTagedDetails(null));
                        }}
                      >
                        <Text style={styles.clearButtonText}>Clear</Text>
                      </Pressable>
                    )}
                  </View>
                  {!loader && (
                    <View style={styles.tagView}>
                      <CustomButton
                        title="Add to story"
                        buttonStyle={
                          allTaggedItems?.length
                            ? styles.activeAddToStoryBtn
                            : styles.addToStoryBtn
                        }
                        textStyle={
                          allTaggedItems?.length
                            ? styles.activeAddToStoryTextBtn
                            : styles.addToStoryTextBtn
                        }
                        onPress={
                          allTaggedItems?.length
                            ? fileDetails[0]?.type === "image"
                              ? handleUpload
                              : handleUploadVideo
                            : () => {}
                        }
                        loader={imageLoader}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
            {fileDetails?.[0]?.type === "video" ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "#000",
                }}
              >
                <View style={{ height: "80%", width: "100%" }}>
                  <Video
                    ref={videoRef}
                    useNativeControls={false}
                    // useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    source={{ uri: fileDetails?.[0]?.uri }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                    }}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    shouldPlay={isPause}
                  />
                </View>
                {/* <StatusVideo
          videoUri={fileDetails?.[0]?.uri}
          isPause={isPause}
          setPlayBack={(data: boolean) => setIsPause(!isPause)}
        /> */}
              </View>
            ) : (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: fileDetails?.[0]?.uri }}
                  style={styles.imageSelected}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        )}

      </View>

      <TagItemModal
        isVisible={isShowTag}
        onClose={() => setIsShowTag(false)}
        onNext={handleTagModalNext}
        token={token}
        trifterId={profile?.id}
        initialSelection={allTaggedItems as ServiceTaggedItem[]}
      />
    </NewBottomModal>
  );
};

export default UploadStatusModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : 0,
    position: "relative",
  },
  header: {
    padding: 12,
    position: "relative",
    zIndex: 3,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 3,
    justifyContent: "center",
    // display: "none",
  },
  headerCloseIcon: {
    position: "absolute",
    top: 12,
    left: 16,
  },
  pressed: {
    opacity: 0.5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 14,
    color: "white",
    fontFamily: "DMSansSemiBold",
  },
  rootHeader: {
    position: "absolute",
    width: "100%",
    top: Platform.OS === "ios" ? 50 : 20,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#000", // Black background like Instagram
    justifyContent: "center",
    alignItems: "center",
  },
  imageSelected: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", //will maintain aspect ratio while filling the container
    aspectRatio: 8 / 16,
  },
  bottomView: {
    position: "absolute",
    width: "100%",
    zIndex: 8,
    bottom: 0,
  },
  tagView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  addToStoryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#E9EAEB",
    borderRadius: 12,
  },
  addToStoryTextBtn: {
    color: "#B5B9BE",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  activeAddToStoryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  activeAddToStoryTextBtn: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  clearButton: {
    backgroundColor: "#FF3B4A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
    shadowColor: "rgba(2, 2, 2, 0.31)",
    shadowOffset: {
      width: 0,
      height: 3.28,
    },
    shadowRadius: 21.88,
    elevation: 21.88,
    shadowOpacity: 1,
  },
  clearButtonText: {
    color: "white",
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    textAlign: "center",
  },
});
