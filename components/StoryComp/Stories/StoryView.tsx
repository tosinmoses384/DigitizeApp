import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Animated, Image, Text, View } from "react-native";
import VerifiedIcon from "../../../assets/images/svg/verified-white.svg";
import { Video } from "expo-av";
import { stories } from "./stories";
import MoreIcon from "../../../assets/images/svg/more_horiz.svg";
import StatusViewActionModal from "modals/sataus/StatusViewActionModal";
import DeleteItemModal from "modals/DeleteItemModal";
import StatusEditStoryModal from "modals/sataus/StatusEditStoryTag";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import CustomButton from "@components/CustomButton";
import { router } from "expo-router";
import timelineServices from "@services/features/timeline-service/timelineServices";
import CustomToastNotification from "@helper/toast-message";
import TagIcon from "../../../assets/images/svg/black-tag-icon.svg";
import SendIcon from "../../../assets/images/svg/send-icon.svg";
import TagsModal from "modals/tagsModal/TagsModal";
import ShareModal from "modals/ShareModal";
import AppIcon from "../../../assets/images/svg/plartform-app-icon.svg";
interface IStoryView {
  onFinishStory: any;
  userStories: any;
  refetch: any;
  setCurrentUserStory: any;
  profileId: any;
}

const { width } = Dimensions.get("window");

const StoryView = ({
  onFinishStory,
  userStories,
  refetch,
  setCurrentUserStory,
  profileId,
}: IStoryView) => {
  const dispatch = useAppDispatch();
  const userStoriesList = userStories?.stories;
  const { tagedItemDetails } = useAppSelector(
    (state) => state?.outfitEditDetailsSlice
  );
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pauseProgress = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentStory = userStoriesList?.[currentStoryIndex];
  const [isMuted, setIsMuted] = useState(false);
  const [wentBack, setWentBack] = useState(0);
  const [isShowActionModal, setIsShowActionModal] = useState(false);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [isShowEditTagModal, setIsShowEditTagModal] = useState(false);
  const [fileIsLoaded, setFileIsLoader] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [toastDetails, setToastDetails]: any = useState(null);
  const [editTagLoader, setEditTagLoader] = useState(false);
  const [isShowStoryTagModal, setIsShowStoryTagModal] = useState(false);
  const [isShowShareModal, setIsShowShareModal] = useState(false);

  const handleFileOnLoad = (data: any) => {
    if (data?.uri?.includes(".mp4") && !data?.isLoaded) {
      setFileIsLoader(false);
    } else {
      setFileIsLoader(true);
    }
  };

  useEffect(() => {
    if (currentStory?.type === "Image") {
      setFileIsLoader(false); // Reset loader for new images
    }
  }, [currentStory?.storyMediaUrl]);

  const renderStoryComponent = (story: any) => {
    switch (story?.type) {
      case "Image":
        return (
          <Image
            source={{ uri: story?.storyMediaUrl }}
            style={styles.backgroundImage}
            fadeDuration={300}
            onLoad={() => {
              setFileIsLoader(true);
            }}
            onError={(error) => {
              setFileIsLoader(true); // In case of an error, you might want to stop the loader
              // Optionally, display a fallback image or error message
            }}
          />
        );
      case "Video":
        return (
          <Video
            useNativeControls={false}
            // useNativeControls
            resizeMode="cover"
            source={{ uri: story?.story_image }}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
            shouldPlay={!isPaused}
            onLoad={handleFileOnLoad}
          />
        );

      default:
        return null;
    }
  };

  const goToNextStory = () => {
    if (currentStoryIndex < userStoriesList.length - 1) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3,
        useNativeDriver: false,
      }).start(() => {
        pauseProgress.current = 0;
        setCurrentStoryIndex(currentStoryIndex + 1);
        progressAnim.setValue(0);
      });
    } else {
      setWentBack(0);
      onFinishStory();
      setCurrentStoryIndex(0);
    }
  };

  const runProgressAnimation = () => {
    if (fileIsLoaded) {
      progressAnim.setValue(pauseProgress.current);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: (1 - pauseProgress.current) * 6000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          goToNextStory();
        }
      });
    }
  };

  const getProgressBarWidth = (storyIndex: number, currentIndex: number) => {
    if (currentIndex > storyIndex) {
      return "100%";
    }
    if (currentIndex === storyIndex) {
      return progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      });
    }
    return "0%";
  };

  const goToPreviousStory = () => {
    if (isPaused) {
      setIsPaused(false);
    }
    pauseProgress.current = 0;
    progressAnim.setValue(0);
    if (currentStoryIndex === 0) {
      setWentBack(wentBack + 1);
      runProgressAnimation();
    } else {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handlePressIn = () => {
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const handleScreenTouch = (evt: GestureResponderEvent) => {
    const touchX = evt.nativeEvent.locationX;

    if (touchX < width / 2) {
      goToPreviousStory();
      ("previous");
    } else {
      goToNextStory();
    }
  };

  const pausePlay = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const muteAndUnMute = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  useEffect(() => {
    if (!isPaused && fileIsLoaded) {
      runProgressAnimation();
    } else {
      progressAnim.stopAnimation((value) => {
        pauseProgress.current = value;
      });
    }
  }, [currentStoryIndex, isPaused, fileIsLoaded]);

  useEffect(() => {
    if (isShowActionModal) {
      return handlePressIn?.();
    }
    if (isShowDeleteModal) {
      return handlePressIn?.();
    }
    if (isShowEditTagModal) {
      return handlePressIn?.();
    }
    if (tagedItemDetails) {
      return handlePressIn?.();
    }
    if (isShowShareModal) {
      return handlePressIn?.();
    }
    handlePressOut?.();
  }, [
    isShowActionModal,
    isShowDeleteModal,
    isShowEditTagModal,
    tagedItemDetails,
    isShowShareModal,
  ]);

  const options = [
    {
      id: 1,
      title: "Share",
    },
    profileId === userStories?.userId
      ? {
          id: 2,
          title: "Edit Tag",
        }
      : "",
    profileId === userStories?.userId
      ? {
          id: 3,
          title: "Delete",
          color: "#AA2731",
        }
      : "",
  ];

  const selectedOption = (data: any) => {
    setIsShowActionModal(false);
    dispatch(setTagedDetails(null));
    if (data?.title === "Delete") {
      return setIsShowDeleteModal(true);
    }
    if (data?.title === "Edit Tag") {
      return setIsShowEditTagModal(true);
    }

    if (data?.title === "Share") {
      return setIsShowShareModal(true);
    }
  };

  const handleEditTag = () => {
    setEditTagLoader(true);
    setToastDetails(null);
    let data: any = {
      caption: "",
      tagIds: [tagedItemDetails?.id],
    };
    // dispatch(setTagedDetails(null));
    const getServices = timelineServices.editStories(
      data,
      token,
      currentStory?.storyId
    );
    getServices
      ?.then((res) => {
        setEditTagLoader(false);
        if (res?.status === 200) {
          dispatch(setTagedDetails(null));
          refetch?.();
          onFinishStory?.();
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        return setToastDetails({
          message: `${res?.detail || res?.message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setEditTagLoader(false);
        return setToastDetails({
          message: `An error occurred. Please try again later.`,
          type: "error",
          duration: 4000,
        });
      });
  };

  const handleDelete = () => {
    setDeleteLoader(true);
    setToastDetails(null);
    let getServices = timelineServices.deleteStory(
      token,
      currentStory?.storyId
    );
    getServices
      ?.then((res) => {
        setDeleteLoader(false);
        if (res?.status === 200) {
          refetch?.();
          onFinishStory?.();
          return setIsShowDeleteModal(false);
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          setIsShowDeleteModal(false);
          return router.push("/Onboarding");
        }
        return setToastDetails({
          message: `${res?.detail || res?.message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setDeleteLoader(false);
        return setToastDetails({
          message: `An error occurred. Please try again later.`,
          type: "error",
          duration: 4000,
        });
      });
  };

  useEffect(() => {
    setCurrentUserStory(currentStory?.storyId, userStoriesList);
  }, [currentStory]);

  useEffect(() => {
    if (token && currentStory?.storyId && !currentStory?.isViewed) {
      timelineServices
        .isViewedStories(token, currentStory?.storyId)
        ?.then((res) => {
          if (res?.status === 200) {
            return refetch?.();
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
        })
        .catch((error) => {
          setDeleteLoader(false);
        });
    }
  }, [token, currentStory]);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      {!fileIsLoaded && (
        <View
          style={{
            position: "absolute",
            zIndex: 20,
            width: "100%",
            height: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <ActivityIndicator size={"large"} color={"#FF3B4A"} />
          </View>
        </View>
      )}
      <Pressable
        onPress={handleScreenTouch}
        onLongPress={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          {
            opacity: currentStory?.type === "image" && pressed ? 0.9 : 1,
          },
          styles.container,
        ]}
      >
        <View style={styles.container}>
          {renderStoryComponent(currentStory)}

          <SafeAreaView>
            <View style={styles.progressBarContainer}>
              {userStoriesList?.map((story: any, index: number) => {
                return (
                  <View style={styles.progressBarBackground} key={index}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: getProgressBarWidth(index, currentStoryIndex),
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      </Pressable>
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
      <View style={styles.ownerContainer}>
        <Pressable
          style={({ pressed }) => [
            { marginRight: 12 },
            pressed && { opacity: 0.5 },
          ]}
          onPress={onFinishStory}
        >
          <Ionicons
            name="chevron-back"
            color={"rgba(255, 255, 255, 1)"}
            size={20}
          />
        </Pressable>
        <View style={styles.ownerImageAndName}>
          <View style={styles.image}>
            {userStories?.userImage && (
              <Image
                source={{
                  uri: userStories?.userImage,
                }}
                style={styles.image}
              />
            )}
            {userStories?.isOfficial && !userStories?.userImage && (
              <AppIcon
                style={{ width: "100%", height: "100%" }}
                width={32}
                height={32}
              />
            )}
          </View>
          <Text style={styles.name}>{userStories?.username || "N/A"}</Text>
          <VerifiedIcon />
        </View>
        {!userStories?.isOfficial && (
          <Pressable
            onPress={() => {
              setIsShowActionModal(true);
            }}
          >
            <MoreIcon />
          </Pressable>
        )}
      </View>
      {tagedItemDetails && (
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Edit Story Tag"
            buttonStyle={styles.editBtn}
            textStyle={styles.editBtnTitle}
            onPress={handleEditTag}
            loader={editTagLoader}
          />
        </View>
      )}

      {isShowDeleteModal && (
        <DeleteItemModal
          onClose={() => setIsShowDeleteModal(false)}
          handleDelete={handleDelete}
          loader={deleteLoader}
        />
      )}

      {isShowActionModal && (
        <StatusViewActionModal
          onClose={() => setIsShowActionModal(false)}
          isShow
          options={options}
          selectedOption={selectedOption}
        />
      )}
      {isShowEditTagModal && (
        <StatusEditStoryModal
          onClose={() => setIsShowEditTagModal(false)}
          isShow
        />
      )}
      {!userStories?.isOfficial && (
        <View style={styles.bottomActions}>
          {currentStory?.hasTag && (
            <View style={{ flex: 1 }}>
              <Pressable
                style={({ pressed }) => [
                  pressed && { opacity: 0.5 },
                  styles.bottomTagIcon,
                ]}
                onPress={() => {
                  setIsShowStoryTagModal(true);
                  handlePressIn();
                }}
              >
                <TagIcon
                  color={"#FF3B4A"}
                  fill={"#FF3B4A"}
                  stroke={"#FF3B4A"}
                />
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.5 },
              styles.bottomTagIcon,
            ]}
            onPress={() => {
              setIsShowShareModal(true);
            }}
          >
            <SendIcon />
          </Pressable>
        </View>
      )}

      {isShowStoryTagModal && (
        <TagsModal
          isShow
          contentId={currentStory?.storyId}
          contentType="story"
          onClose={() => {
            setIsShowStoryTagModal(false);
            handlePressOut?.();
          }}
          onFinishStory={onFinishStory}
          userId={userStories?.userId}
          userImageUrl={userStories?.userImage}
          username={userStories?.username}
        />
      )}

      {isShowShareModal && (
        <ShareModal
          onClose={() => {
            setIsShowShareModal(false);
          }}
          isShow
          linkUrl={currentStory?.storyMediaUrl}
        />
      )}
    </View>
  );
};

export default StoryView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    // resizeMode: "fill",
    objectFit: "contain",

    // borderRadius: 18,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  progressBarContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 10,
    justifyContent: "center",
    height: 3,
    backgroundColor: "transparent",
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: "white",
  },
  ownerContainer: {
    height: 32,
    width: "100%",

    position: "absolute",
    top: Platform.OS === "android" ? 20 : 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 5,
    marginTop: 10,
  },
  ownerImageAndName: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 32,
  },
  name: {
    marginLeft: 8,
    color: "white",
    fontFamily: "DMSansSemiBold",
    marginRight: 8,
    textTransform: "capitalize",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  editBtn: {
    paddingHorizontal: 25,
    paddingVertical: 14,
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  editBtnTitle: {
    fontSize: 16,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  bottomActions: {
    position: "absolute",
    zIndex: 1,
    bottom: 44,
    paddingHorizontal: 44,
    flexDirection: "row",
    // justifyContent: "space-between",
    width: "100%",
  },
  bottomTagIcon: {
    backgroundColor: "#FFFFFF1A",
    width: 28,
    height: 28,
    borderRadius: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
  },
});
