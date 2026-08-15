import { starTemplate } from "@helper/starTemplate";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Pressable, StyleSheet, Text, View, TextInput, ScrollView, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import VerifiedIcon from "../../../assets/images/svg/verified.svg";
import MoreIcon from "../../../assets/images/svg/more-icon.svg";
import CancelIcon from "../../../assets/images/svg/cancel-icon.svg";
import TagIcon from "../../../assets/images/svg/tag-icon.svg";
import ShareIcon from "../../../assets/images/svg/share-icon.svg";
import ChatIcon from "../../../assets/images/svg/chat-icon.svg";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import LineLoader from "@components/LineLoader";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import { setSellerId } from "@redux/slice/filters/filterSlice";
import { getInitials } from "@helper/getInitials";
import AppIcon from "../../../assets/images/svg/plartform-app-icon.svg";
import NewBottomModal from "@components/NewBottomModal";
import { ThemedText } from "@components/ThemedText";
import { Colors } from "@constants/Colors";
import timelineServices from "@services/features/timeline-service/timelineServices";
import FlagComponent from "@assets/images/svg_components/flag";
import { useToast } from "react-native-toast-notifications";
import ShareComponent from "@assets/images/svg_components/share";
import DropDownArrowComponent from "@assets/images/svg_components/drop_down";
import FilledButton from "../../../components/buttons/Filled_button";
import { useAuthManager } from "@hooks/use-auth-manager";
import { sharePost } from "@utils/sharing";
import DeleteConfirmationModal from "@components/DeleteConfirmationModal";
import useDeletePost from "@hooks/use-delete-post";
import { useI18n } from "@hooks/use-i18n";
import LikeButton from "@components/LikeButton";
interface IPostList {
  handleClickActions: any;
  handlePressTag: any;
  details: any;
  onSelect: any;
  loading: boolean;
  handleUpdateLikePost: any;
  likeLoader?: boolean;
  activeLikeId?: string;
  hidePostDropdownAction?: boolean;
  followBtnLoader?: boolean;
  followAndUnfollowPostId?: string;
  getItems?: any;
}
const PostList = ({
  handleClickActions,
  handlePressTag,
  details,
  onSelect,
  loading,
  handleUpdateLikePost,
  likeLoader,
  activeLikeId,
  hidePostDropdownAction,
  followBtnLoader,
  followAndUnfollowPostId,
  getItems,
}: IPostList) => {
  const { t } = useI18n();
  const [isShowOption, setIsShowOption] = useState(null);
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state?.userProfileSlice);
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [optionsModal, setOptionsModal] = useState(false);
  const [isShowReportModal, setIsShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState<
    {
      name: string;
      value: number;
      enumValue: string;
      description: string;
      id: string;
    }[]
  >([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [reasonsError, setReasonsError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [blockAndUnfollow, setBlockAndUnfollow] = useState(false);
  const [message, setMessage] = useState("");
  const [actionOptions, setActionOptions] = useState<
    {
      name: string;
      value: number;
      enumValue: string;
      description: string;
      id: string;
    }[]
  >([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingActionModal, setPendingActionModal] = useState(false);
  const [optionsModal1, setOptionsModal1] = useState(false);
  const [optionsModal2, setOptionsModal2] = useState(false);
  const [optionsModal3, setOptionsModal3] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const { deletePost } = useDeletePost();

  const screenHeight = Dimensions.get("window").height;

  const fetchReasons = async () => {
    setReasonsLoading(true);
    setReasonsError(null);
    try {
      const data = await timelineServices.reportReasons(token);
      console.log("data", data);
      if (Array.isArray(data?.data)) {
        setReportReasons(data.data);
      } else {
        setReportReasons([]);
      }
    } catch (e) {
      setReasonsError(`Failed to load reasons: ${e}`);
    } finally {
      setReasonsLoading(false);
    }
  };

  const handleOpenOptionsModal = (id: any) => {
    fetchReasons(); 
    setOptionsModal(true);
    setIsShowOption(id);
  };

  const handleCloseOptionsModal = () => {
    setOptionsModal(false);
    setIsShowOption(null);
  };

  const openReportSheet = () => {
    handleCloseOptionsModal();
    setTimeout(() => {
      setIsShowReportModal(true);
    }, 500);
  };

  const closeReportSheet = () => {
    setIsShowReportModal(false);
  };

  const openDeleteModal = () => {
    handleCloseOptionsModal();
    setTimeout(() => {
      setIsDeleteModalVisible(true);
    }, 500);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDeletePost = async () => {
    await deletePost(
      details.id,
      setDeleteLoading,
      {
        successMessage: "Post deleted successfully",
        errorMessage: "Failed to delete post",
        refetch: getItems,
        onSuccess: () => {
          closeDeleteModal();
        },
      }
    );
  };

  const fetchActions = async () => {
    setActionsLoading(true);
    setActionsError(null);
    try {
      const response = await timelineServices.getReportActions(token);

      if (Array.isArray(response?.data)) {
        setActionOptions(response.data);
      } else {
        setActionOptions([]);
      }
    } catch (e) {
      setActionsError(`Failed to load actions: ${e}`);
    } finally {
      setActionsLoading(false);
    }
  };

  const openActionModal = async () => {
  await fetchActions(); // fetch your data

  closeReportSheet();
setTimeout(() => {
  setOptionsModal3(true); 
}, 700);
 
  };
  
 
  const handleLikeStateChange = useCallback((postId: string, newState: any) => {
    if (handleUpdateLikePost) {
      handleUpdateLikePost({
        ...details,
        id: postId,
        isLiked: newState.isLiked,
        likesCount: newState.likesCount,
      });
    }
  }, [handleUpdateLikePost, details]);

  const actions = [
    {
      id: "comment",
      icon: <ChatIcon />,
      count: details?.commentCount || 0,
    },
    {
      id: "share",
      icon: <ShareIcon />,
    },
  ];
  const postOptions =
    profile?.id !== details?.userId
      ? [
          {
            id: 2,
            title: "Share this Post",
            borderColor: "#EDF2F7",
            icon: <ShareComponent />,
            onPress: () => {
              setOptionsModal(false);
              setTimeout(() => {
                handleClickActions("share", details);
              }, 1000);
            },
          },
          {
            id: 3,
            title: "Flag / Report this Post",
            borderColor: "#EDF2F7",
            icon: <FlagComponent />,
            onPress: () => {
              openReportSheet();
              //  setIsShowOption(null);
            },
          },
        ]
      : [
          {
            id: 1,
            title: "Edit post",
            borderColor: "#EDF2F7",
            onPress: () => {
              /* edit logic */
            },
          },
          {
            id: 2,
            title: "Delete post",
            color: "#D4313E",
            onPress: openDeleteModal,
          },
        ];

  const reportPost = async () => {
    setReasonsLoading(true);

    try {
      const payload = {
        reason: selectedReason || "",
        action: selectedAction.id,
        comment: message,
      };

      const response = await timelineServices.reportPost(
        token,
        details.id,
        payload,
      );

      closeReportSheet();

      if (response.responseCode === "0") {
        setReasonsLoading(false);

        // console.log('hello')
        // Use the new auth manager's saveToken method
        toast.show("Post reported successfully", {
          type: "success",
          duration: 2000,
        });
        getItems();
      } else {
        toast.show("An error occored", {
          type: "danger",
          duration: 6000,
        });
      }
      setReasonsLoading(false);

      // Optionally: show a toast or alert
    } catch (e) {
      console.error("Report post error:", e);
      // Optionally: show a toast or alert
    }
  };

  return (
    <View style={{ position: "relative" }}>
      {loading ? (
        <View style={{ height: 40, marginBottom: 12 }}>
          <LineLoader />
        </View>
      ) : (
        <View style={styles.topView}>
          <Pressable
            style={({ pressed }) => [
              styles.topViewUserDetails,
              pressed && styles.pressed,
            ]}
            onPress={
              details?.type === "PlatformPost"
                ? () => {}
                : () => {
                    router.push("/SellerProfile");
                    dispatch(setSellerId(details?.userId));
                  }
            }
          >
            <View style={styles.topImageView}>
              {details?.userImageUrl ? (
                <Image
                  source={{ uri: details?.userImageUrl }}
                  style={{ width: 40, height: 40, borderRadius: 40 }}
                  contentFit="cover"
                />
              ) : details?.type === "PlatformPost" ? (
                <AppIcon
                  width={40}
                  height={40}
                  style={{ borderRadius: "100%" }}
                />
              ) : (
                <Text style={{ fontSize: 16, fontFamily: "DMSansSemiBold" }}>
                  {getInitials(details?.username || "")}
                </Text>
              )}
            </View>
            <View style={styles.topCenterView}>
              <View style={styles.topCenterNameAndIcon}>
                <Text style={styles.topCenterName}>
                  {details?.username || "**********"}
                </Text>
                <VerifiedIcon />
              </View>
              <View style={styles.topCenterStartAndReview}>
                {starTemplate(details?.userRatings || 0)}
                <Text style={styles.topCenterReview}>
                  {details?.userRatings || 0} {t('marketplace.reviews')}
                </Text>
              </View>
            </View>
          </Pressable>
          {!hidePostDropdownAction &&
            (followAndUnfollowPostId === details?.id && followBtnLoader ? (
              <Text>...</Text>
            ) : details?.type === "PlatformPost" ? (
              ""
            ) : (
              <Pressable
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                onPress={() => handleOpenOptionsModal(details?.id)}
              >
                <MoreIcon />
              </Pressable>
            ))}
        </View>
      )}

      {isShowOption === details?.id && (
        <Pressable
          onPress={() => handleCloseOptionsModal()}
          style={{
            width: "100%",
            height: "100%",
            top: 0,
            position: "absolute",
            zIndex: 1,
            borderRadius: 12,
          }}
        />
      )}

      {loading ? (
        <View style={{ height: 323 }}>
          <LineLoader />
        </View>
      ) : (
        <Pressable
          style={(pressed) => [
            styles.imageContainer,
            {
              aspectRatio: imageAspectRatio,
            },
          ]}
          onPress={() => {
          }}
        >
          {details?.hasTag && (
            <Pressable
              style={({ pressed }) => [
                styles.tagView,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => handlePressTag(details)}
            >
              <TagIcon />
            </Pressable>
          )}

          <Image
            source={{ uri: details?.defaultImageUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={1000}
            onLoad={(e) => {
              const width = e?.source?.width;
              const height = e?.source?.height;
              if (width && height) setImageAspectRatio(width / height);
            }}
          />
        </Pressable>
      )}

      {loading ? (
        <View style={{ height: 20, marginVertical: 8 }}>
          <LineLoader />
        </View>
      ) : (
        <View style={styles.actionsView}>
          <LikeButton
            postId={details?.id}
            initialLikeState={{
              isLiked: details?.isLiked || false,
              likesCount: details?.likesCount || 0,
            }}
            onStateChange={handleLikeStateChange}
            onLikeCountPress={() => handleClickActions("like", details)}
            style={styles.actionsContents}
            iconStyle={styles.detailIcon}
            textStyle={styles.actionsText}
          />
          {actions?.map((list) => (
            <Pressable
              style={({ pressed }) => [
                styles.actionsContents,
                pressed && styles.pressed,
              ]}
              onPress={() => handleClickActions(list?.id, details)}
              key={list?.id}
            >
              {list?.icon}
              <Text style={styles.actionsText}>{list?.count}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={{ height: 15, marginBottom: 16 }}>
          <LineLoader />
        </View>
      ) : (
        <View>
          <Text style={styles.bottomText}>
            <Text style={styles.bottomInnerText}>
              {details?.username || "**********"}{" "}
            </Text>
            {capitalizeFirstLetter(details?.caption || "")}
          </Text>
        </View>
      )}

      <NewBottomModal
        isShow={optionsModal}
      onClose={() => {
        setOptionsModal(false);
        if (pendingActionModal) {
          setPendingActionModal(false);
          setTimeout(() => {
            setIsActionModalOpen(true);
          }, 200); // delay to allow modal animation to finish
        }
      }}
      
        maxHeight={200}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: "100%", // Or a specific width (e.g., '80%')
          flex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            marginVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: "DMSansSemiBold",
              textAlign: "center",
            }}
          >
            What do you want to do?
          </Text>
          <Pressable
            onPress={() => handleCloseOptionsModal()}
            style={{ padding: 12, position: "absolute", right: 16 }}
          >
            <CancelIcon />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          {postOptions?.map((data: any) =>
            !details?.isEditable && data?.title === "Edit post" ? (
              ""
            ) : (
              <Pressable
                key={data?.id}
                style={{
                  // justifyContent: 'space-between',
                  alignItems: "center",
                  width: "100%",
                  flexDirection: "row",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: data?.borderColor || "white",
                  opacity:
                    data?.title ===
                      (details?.isFollowing ? "Unfollow Drber" : "Follow") &&
                    followAndUnfollowPostId === details?.id &&
                    followBtnLoader
                      ? 0.5
                      : 1,
                }}
                onPress={data.onPress}
                disabled={
                  data?.title ===
                    (details?.isFollowing ? "Unfollow Drber" : "Follow") &&
                  followAndUnfollowPostId === details?.id &&
                  followBtnLoader
                }
              >
                <View style={{ width: 24 }}>{data.icon}</View>
                <Text
                  style={{
                    color: data?.color || "#393939",
                    fontSize: 12,
                    marginLeft: 12,
                  }}
                >
                  {data?.title}
                  {data?.title ===
                    (details?.isFollowing ? "Unfollow Drber" : "Follow") &&
                  followAndUnfollowPostId === details?.id &&
                  followBtnLoader
                    ? " ..."
                    : ""}
                </Text>
                <View style={{ width: 24 }} />
              </Pressable>
            ),
          )}
        </View>
      </NewBottomModal>

      {/* Report Modal using NewBottomModal */}
      <NewBottomModal
        isShow={isShowReportModal}
        onClose={closeReportSheet}
        maxHeight={540}
        contentStyle={{
          backgroundColor: Colors.light.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 0,
          width: "100%",
          flex: 1,
        }}
      >
        {/* Title and Close Icon */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            paddingBottom: 8,
            paddingHorizontal: 20, // or your preferred horizontal padding
          }}
        >
          <ThemedText
            type="subtitle"
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: Colors.light.text,
              textAlign: "center",
            }}
          >
            Report Post
          </ThemedText>
          <Pressable onPress={closeReportSheet} style={{ padding: 8 }}>
            <CancelIcon width={22} height={22} />
          </Pressable>
        </View>
        <ScrollView>
          {/* Why are you reporting this post? */}
          <ThemedText
            style={{
              color: Colors.light.text,
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 20,
              marginBottom: 16,
              marginTop: 15,
            }}
          >
            Why are you reporting this post?
          </ThemedText>
          {/* Reasons as pills */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {reasonsLoading ? (
              <ThemedText
                style={{ color: Colors.light.iconText, fontSize: 14 }}
              >
                Loading reasons...
              </ThemedText>
            ) : reasonsError ? (
              <ThemedText
                style={{ color: Colors.light.iconText, fontSize: 14 }}
              >
                {reasonsError}
              </ThemedText>
            ) : reportReasons.length === 0 ? (
              <ThemedText
                style={{ color: Colors.light.iconText, fontSize: 14 }}
              >
                No reasons available
              </ThemedText>
            ) : (
              reportReasons.map((reason) => (
                <Pressable
                  key={reason.id}
                  onPress={() => setSelectedReason(reason.id)}
                  style={{
                    backgroundColor:
                      selectedReason === reason.id
                        ? Colors.light.colorText
                        : "#F5F5F5",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    marginRight: 8,
                    marginBottom: 15,
                    borderWidth: selectedReason === reason.id ? 1.5 : 0,
                    borderColor:
                      selectedReason === reason.id
                        ? Colors.light.colorText
                        : "#E9EAEB",
                  }}
                >
                  <ThemedText
                    style={{
                      color:
                        selectedReason === reason.id
                          ? "#fff"
                          : Colors.light.text,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {reason.description}
                  </ThemedText>
                </Pressable>
              ))
            )}
          </View>

          {/* Message Input */}
          <View style={{ paddingHorizontal: 16, marginBottom: 15 }}>
            <ThemedText
              style={{
                color: Colors.light.text,
                fontSize: 15,
                fontWeight: "500",
                marginBottom: 6,
              }}
            >
              Give details or any other reasons
            </ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write a Message"
              placeholderTextColor={Colors.light.iconText}
              multiline
              style={{
                minHeight: 60,
                borderRadius: 12,
                borderWidth: 1.2,
                borderColor: Colors.light.iconText,
                backgroundColor: "#fff",
                paddingHorizontal: 14,
                paddingTop: 10,
                fontSize: 15,
                color: Colors.light.text,
                marginBottom: 20,
              }}
            />
          </View>
          {/* Checkbox for Block/Unfollow */}
          <Pressable
            onPress={openActionModal}
            style={{
              backgroundColor: "#F5F6F7",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 14,
              marginHorizontal: 16,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ThemedText
              style={{
                color: selectedAction ? "#222" : "#8A8F98",
                fontSize: 16,
              }}
            >
              {selectedAction ? selectedAction.name : "What do you want to do?"}
            </ThemedText>
            <DropDownArrowComponent />
          </Pressable>
          <View
            style={{ width: "100%", paddingHorizontal: 24, marginBottom: 30 }}
          >
            <FilledButton
              title={"Report Post"}
              onPress={reportPost}
              disable={!selectedReason || !selectedAction || reasonsLoading}
              loading={reasonsLoading}
            />
          </View>
          <ThemedText
            style={{
              color: "#6B727E",
              fontSize: 13,
              textAlign: "left",
              marginHorizontal: 24,
              marginBottom: 30,
            }}
          >
            Your name will not shared with anyone when you report a post..
          </ThemedText>
        </ScrollView>
      </NewBottomModal>

      {/* Action Modal */}
      <NewBottomModal
        isShow={optionsModal3}
        onClose={() => {
          setOptionsModal3(false);

          // Once this modal closes, check if action modal should open
          // if (pendingActionModal) {
          //   setPendingActionModal(false);
          //   setTimeout(() => setIsActionModalOpen(true), 10); // Short delay ensures re-render
          // }
        }}
        //{() => setIsActionModalOpen(false)}
        maxHeight={screenHeight}
        contentStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 0,
          width: "100%",
          flex: 1,
        }}
      >
        {/* //{console.log('Action modal rendered, isShow:', isActionModalOpen, 'actionOptions:', actionOptions)} */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 80,
            paddingBottom: 8,
            paddingHorizontal: 20,
          }}
        >
          <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
            What do you want to do?
          </ThemedText>
          <Pressable
            onPress={() => {
              setOptionsModal3(false);
              openReportSheet();
            }}
            style={{ padding: 8 }}
          >
            <CancelIcon width={22} height={22} />
          </Pressable>
        </View>
        <ScrollView>
          {actionsLoading ? (
            <ThemedText style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              Loading...
            </ThemedText>
          ) : actionsError ? (
            <ThemedText style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              {actionsError}
            </ThemedText>
          ) : (
            actionOptions.map((option) => (
              <Pressable
                key={option.name}
                onPress={() => {
                  setSelectedAction(option);
                  setOptionsModal3(false);

                  openReportSheet();

                  // setIsActionModalOpen(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  backgroundColor:
                    selectedAction?.id === option.id ? "#FFF0F1" : "#fff",
                  borderBottomWidth: 1,
                  borderBottomColor: "#F0F0F0",
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color:
                        selectedAction?.id === option.id ? "#D4313E" : "#222",
                    }}
                  >
                    {option.description.split(" - ")[0]}
                  </ThemedText>
                  {option.description.split(" - ")[1] && (
                    <ThemedText style={{ fontSize: 13, color: "#8A8F98" }}>
                      {option.description.split(" - ")[1]}
                    </ThemedText>
                  )}
                </View>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor:
                      selectedAction?.id === option.id ? "#D4313E" : "#E0E0E0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                  }}
                >
                  {selectedAction?.id === option.id && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#D4313E",
                      }}
                    />
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </NewBottomModal>

      {/* Delete Post Modal */}
      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        loading={deleteLoading}
        type="danger"
      />
    </View>
  );
};

export default PostList;
const styles = StyleSheet.create({
  topImageView: {
    width: 40,
    height: 40,
    backgroundColor: "silver",
    borderRadius: "100%",
    marginRight: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  topView: {
    flexDirection: "row",
    marginBottom: 12,
  },
  topCenterView: {
    flex: 1,
  },
  topCenterNameAndIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  topCenterName: {
    marginRight: 8,
    fontSize: 14,
    color: "#212C3D",
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
  },
  topCenterStartAndReview: {
    flexDirection: "row",
    alignItems: "center",
  },
  topCenterReview: {
    fontSize: 10,
    color: "#232323",
    fontFamily: "DMSansMedium",
  },
  optionsView: {
    position: "absolute",
    backgroundColor: "white",
    zIndex: 2,
    right: "0%",
    top: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  imageContainer: {
    width: "100%",
    // height: 328,
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  tagView: {
    width: 28,
    height: 28,
    backgroundColor: "white",
    borderRadius: 28,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 2,
    bottom: 12,
    left: 13,
  },
  actionsView: {
    flexDirection: "row",
    marginVertical: 8,
  },
  actionsContents: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  actionsText: {
    fontSize: 12,
    color: "#212C3D",
    fontFamily: "DMSansMedium",
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.5,
  },
  bottomText: {
    fontSize: 12,
    color: "#07090C",
    // textTransform: "capitalize",
  },
  bottomInnerText: {
    fontSize: 12,
    color: "#07090C",
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
  },
  detailIcon: {
    width: 29,
    height: 29,
    resizeMode: "contain",
  },
  topViewUserDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
