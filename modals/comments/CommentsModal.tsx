import BottomModal from "@components/BottomModal";
import React, { useEffect, useRef, useState } from "react";
import SendIcon from "../../assets/images/svg/send.svg";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity as RNTouchableOpacity,
  View,
} from "react-native";
import CommentCard from "@components/CommentCard";
import NewBottomModal from "@components/NewBottomModal";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { useAppSelector } from "@redux/store";
import { generateGUID } from "@helper/guid-number";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import EmptyState from "@components/EmptyState";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useI18n } from "@hooks/use-i18n";

interface ICommentsModal {
  onClose: any;
  isShow: boolean;
  selectedCommentDetails: any;
  refetch: any;
}
const CommentsModal = ({
  onClose,
  isShow,
  selectedCommentDetails,
  refetch,
}: ICommentsModal) => {
  const toast = useToast();
  const { t } = useI18n();
  const [comment, setComment] = useState("");
  const [replyId, setReplyId]: any = useState(null);
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [loader, setLoader] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [getPostComments, setGetPostComments]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyData, setReplyData]: any = useState(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const getReplysFromServer = async (commentId: string, pageToken?: string) => {
    try {
      const res: any = await timelineServices.getPostCommentsReplysQuery(
        token,
        selectedCommentDetails?.id,
        "12",
        pageToken || "",
        commentId
      );
      setLoading(false);
      return res?.data;
    } catch (error: any) {
      setLoading(false);
      return null; // Or throw error, depending on your needs.
    }
  };

  const getItems = async () => {
    // setLoading(true);

    if (pageToken) {
      try {
        const res: any = await timelineServices.getPostCommentsQuery(
          token,
          selectedCommentDetails?.id,
          "12",
          pageToken
        );
        setLoading(false);

        const promises = res?.data?.dataset?.map(async (list: any) => {
          const replies = await getReplysFromServer(list?.id);
          return {
            ...list,
            replys: replies,
          };
        });

        const newDatas = await Promise.all(promises || []); // Handle potential null promises

        setGetPostComments([...getPostComments, ...newDatas]); // Update state with the resolved data

        setPageToken(res?.data?.pageToken);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      } catch (error: any) {
        setLoading(false);
      }
    }
  };

  const getInitialItems = async () => {
    setPageToken("");
    setGetPostComments([]);
    setLoading(true);

    try {
      const res: any = await timelineServices.getPostCommentsQuery(
        token,
        selectedCommentDetails?.id,
        "12",
        ""
      );

      const promises = res?.data?.dataset?.map(async (list: any) => {
        const replies = await getReplysFromServer(list?.id);
        return {
          ...list,
          replys: replies,
        };
      });

      const distructureComments = await Promise.all(promises || []); // Handle potential null promises

      setGetPostComments(distructureComments); // Update state with the resolved data

      if (res?.data?.hasNextPage) {
        setPageToken(res?.data?.pageToken);
      }
      setLoading(false);
      if (res?.responseCode === 401) {
        return router.push("/Onboarding");
      }
    } catch (error: any) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCommentDetails?.id) {
      getInitialItems();
    }
  }, [selectedCommentDetails?.id]);

  const updateComments = () => {
    const checkIfReplyExist = getPostComments?.find(
      (getReply: any) => getReply?.id === replyData?.id
    );

    if (checkIfReplyExist) {
      const getNewComments = getPostComments?.map((commentData: any) =>
        commentData?.id === replyData?.id
          ? {
            ...commentData,
            replys: {
              ...commentData?.replys,
              dataset: [
                {
                  posterUserImageUrl: profile?.profileImageUrl,
                  posterUsername:
                    profile?.firstName + " " + profile?.lastName,
                  id: generateGUID(),
                  comment: comment,
                  createdOn: new Date(),
                },
                ...commentData?.replys?.dataset,
              ],
            },
          }
          : { ...commentData }
      );

      setGetPostComments(getNewComments);
    }
  };

  const handleLike = () => {
    toast.show("Comment Liked! ❤️", {
      type: "success",
      duration: 2000,
    });
  };

  // const handleSend = () => {
  //   if (selectedCommentDetails?.id && comment) {
  //     setLoader(true);
  //     const data = {
  //       comment: comment,

  const handleSend = () => {
    // Prevent keyboard from dismissing and maintain focus
    if (inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }

    if (selectedCommentDetails?.id && comment) {
      setLoader(true);
      const data = { comment };

      const getServices = replyData
        ? timelineServices.postReplyComment(
          data,
          token,
          selectedCommentDetails?.id,
          replyData?.id
        )
        : timelineServices.postComment(data, token, selectedCommentDetails?.id);

      getServices
        ?.then((res) => {
          setLoader(false);
          if (res?.status === 200) {
            // Update comments here
            if (replyData) {
              updateComments();
            } else {
              setGetPostComments([
                {
                  posterUserImageUrl: profile?.profileImageUrl,
                  posterUsername: profile?.firstName + " " + profile?.lastName,
                  id: generateGUID(),
                  comment: comment,
                  createdOn: new Date(),
                },
                ...getPostComments,
              ]);
            }

            // Clear comment input and reply data
            setComment("");
            setReplyData(null);

            // Keep keyboard open by refocusing input
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 10);

            // Call refetch if needed
            refetch?.();

            return;
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }

          toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch((error) => {
          setLoader(false);
          toast.show(t("comments.error"), {
            type: "danger",
            duration: 4000,
          });
        });
    }
  };

  const commeants = [
    {
      id: 1,
      replys: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    },
    {
      id: 2,
    },
    {
      id: 3,
      replys: [
        {
          id: 3,
        },
      ],
    },
  ];

  // useEffect(() => {
  //   if (!comment) {
  //     setReplyData(null);
  //   }
  // }, [comment]);

  const handleMoreReply = async (commentId: string, list: any) => {
    try {
      const res: any = await timelineServices.getPostCommentsReplysQuery(
        token,
        selectedCommentDetails?.id,
        "12",
        list?.replys?.pageToken || "",
        commentId
      );
      setLoading(false);

      const checkIfReplyExist = getPostComments?.find(
        (getReply: any) => getReply?.id === commentId
      );

      if (checkIfReplyExist) {
        const getNewComments = getPostComments?.map((commentData: any) =>
          commentData?.id === commentId
            ? {
              ...commentData,
              replys: {
                ...commentData?.replys,
                dataset: [
                  ...commentData?.replys?.dataset,
                  ...res?.data?.dataset,
                ],
                hasNextPage: res?.data?.hasNextPage,
                pageToken: res?.data?.pageToken,
              },
            }
            : { ...commentData }
        );

        setGetPostComments(getNewComments);
      }

      return;
    } catch (error: any) {
      setLoading(false);
      return null; // Or throw error, depending on your needs.
    }
  };

  useEffect(() => {
    let timer: any;

    if (!loading && getPostComments?.length === 0) {
      timer = setTimeout(() => {
        setShowEmptyState(true);
      }, 500); // 5000 milliseconds = 5 seconds
    } else {
      setShowEmptyState(false); // Reset if loading or comments exist
    }

    return () => {
      clearTimeout(timer); // Clear timeout if component unmounts or state changes
    };
  }, [loading, getPostComments]);

  return (

    <NewBottomModal isShow={isShow} onClose={onClose} >
      <View style={{ flex: 1 }}>

        <View style={styles.header}>
          <Text style={styles.headerText}>{t("comments.title")}</Text>
        </View>

        <ScrollView
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          onScroll={getItems}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 80 : 20 }}
        >
          {loading
            ? getEmptyStateCountLoader(10)?.map((list: any, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <CommentCard
                  name={""}
                  comment={""}
                  time={""}
                  imageUrl={""}
                  loading
                />
              </View>
            ))
            : getPostComments?.length
              ? getPostComments?.map((list: any) => (
                <View style={{ marginBottom: 12 }} key={list?.id}>
                  <CommentCard
                    name={list?.posterUsername}
                    comment={list?.comment}
                    time={list?.createdOn}
                    imageUrl={list?.posterUserImageUrl}
                    handleReply={() => {
                      setReplyData(list);
                      // setComment(`@${list?.posterUsername}`);
                      inputRef.current?.focus();
                    }}
                    onLike={handleLike}
                  />

                  {list?.replys?.dataset?.length ? (
                    <View>
                      <View style={styles.replyActionView}>
                        <Pressable
                          style={({ pressed }) => [pressed && styles.pressed]}
                          onPress={() =>
                            setReplyId(replyId?.id === list?.id ? "" : list)
                          }
                        >
                          <Text style={styles.replyActionText}>
                            {t("comments.viewReplies", { count: list?.replys?.dataset?.length })}
                          </Text>
                        </Pressable>
                      </View>
                      {replyId?.id === list?.id && (
                        <View style={styles.replyView}>
                          <View style={{ width: "85%" }}>
                            {list?.replys?.dataset?.map((reply: any) => {
                              return (
                                <View
                                  style={{ marginBottom: 5 }}
                                  key={reply?.id}
                                >
                                  <CommentCard
                                    name={reply?.posterUsername}
                                    comment={reply?.comment}
                                    time={reply?.createdOn}
                                    imageUrl={reply?.posterUserImageUrl}
                                    hideViewReply
                                    onLike={handleLike}
                                  />
                                </View>
                              );
                            })}
                            {list?.replys?.hasNextPage ? (
                              <Pressable
                                onPress={() =>
                                  handleMoreReply(list?.id, list)
                                }
                                style={({ pressed }) => [
                                  pressed && { opacity: 0.5 },
                                ]}
                              >
                                <Text style={styles.viewMore}>
                                  {t("comments.viewMoreReplies")}
                                </Text>
                              </Pressable>
                            ) : (
                              ""
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    ""
                  )}
                </View>
              ))
              : showEmptyState && (
                <View>
                  <EmptyState
                    icon={""}
                    title={t("comments.noComments")}
                    subtitle={t("comments.startConversation")}
                  />
                </View>
              )}


        </ScrollView>
        <View
          style={styles.bottomView}

        >
          {replyData && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                {t("comments.replyingTo")} <Text style={styles.replyingToName}>@{replyData?.posterUsername}</Text>
              </Text>
              <Pressable onPress={() => setReplyData(null)} hitSlop={10}>
                <Text style={styles.closeReply}>✕</Text>
              </Pressable>
            </View>
          )}
          <View
            style={styles.inputContainer}

          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={
                t("comments.addCommentPlaceholder")
              }
              value={comment}
              onChangeText={(e) => {
                setComment(e);
              }}
              selectionColor={"#9A9A9A"}
              placeholderTextColor={"#9A9A9A"}
            // multiline // Allow multiple lines of text
            />
            {comment && !loader && (
              <View
                style={[
                  styles.sendIconContainer,
                  { opacity: 1 }
                ]}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleSend();
                }}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                pointerEvents="auto"
              >
                <SendIcon />
              </View>
            )}
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  tallView: {
    height: 3000,
    backgroundColor: "blue",
    padding: 20,
  },
  body: {
    height: "100%",
  },
  header: {
    paddingBottom: 12,
  },
  headerText: {
    textAlign: "center",
    color: "#071827",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    paddingVertical: 12,
  },
  bottomView: {
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 20 : 31,
    paddingHorizontal: Platform.OS === 'android' ? 16 : 0,
    position: "relative",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    minHeight: 40,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 60,
    fontSize: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    textAlignVertical: "top",
    backgroundColor: 'transparent',
  },
  sendIconContainer: {
    marginLeft: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyActionView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  replyActionText: {
    color: "#90959E",
    fontSize: 10,
    fontFamily: "DMSansSemiBold",
  },
  replyView: {
    display: "flex",
    alignItems: "flex-end",
    width: "100%",
  },
  viewMore: {
    color: "#90959E",
    fontSize: 12,
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 8,
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#90959E',
    fontFamily: 'DMSansRegular',
  },
  replyingToName: {
    color: '#007AFF', // Or your app's primary color
    fontFamily: 'DMSansSemiBold',
  },
  closeReply: {
    fontSize: 14,
    color: '#90959E',
    padding: 4,
  },
});
