import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SIZES } from '../constants/Colors';
import StackHeader from '../components/StackHeader';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { useToast } from 'react-native-toast-notifications';
import timelineServices from '../services/features/timeline-service/timelineServices';
// Import the same icons used in PostList
import VerifiedIcon from '../assets/images/svg/verified.svg';
import LikeIcon from '../assets/images/svg/like-icon.svg';
import ShareIcon from '../assets/images/svg/share-icon.svg';
import ChatIcon from '../assets/images/svg/chat-icon.svg';
import ShareModal from '../modals/ShareModal';
import CommentsModal from '../modals/comments/CommentsModal';
import TagsModal from '../modals/tagsModal/TagsModal';
import MoreIcon from '../assets/images/svg/more-icon.svg';
import TagIcon from '../assets/images/svg/tag-icon.svg';
import NewBottomModal from '../components/NewBottomModal';
import CancelIcon from '../assets/images/svg/cancel-icon.svg';
import ShareComponent from '../assets/images/svg_components/share';
import FlagComponent from '../assets/images/svg_components/flag';
import { starTemplate } from '../helper/starTemplate';
import { getInitials } from '../helper/getInitials';
import { setIsShownLoginModal } from '../redux/slice/profile/profileSlice';
import { likeService, LikeState } from "../services/likeService";
import DropDownArrowComponent from '../assets/images/svg_components/drop_down';
import FilledButton from '../components/buttons/Filled_button';
import { ThemedText } from '../components/ThemedText';
import { Dimensions } from 'react-native';

/**
 * Post Details Screen
 * This screen displays the details of a specific post when accessed via deep link
 * URL: /PostDetails?postId=[postId]
 */
export default function PostDetails() {
  const { postId, postData } = useLocalSearchParams<{ postId?: string; postData?: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isShowCommentModal, setIsShowCommentModal] = useState(false);
  const [likeLoader, setLikeLoader] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const [isShowReportModal, setIsShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState<{ name: string; value: number; enumValue: string; description: string; id: string }[]>([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [reasonsError, setReasonsError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [blockAndUnfollow, setBlockAndUnfollow] = useState(false);
  const [message, setMessage] = useState("");
  const [actionOptions, setActionOptions] = useState<{ name: string; value: number; enumValue: string; description: string; id: string }[]>([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [pendingActionModal, setPendingActionModal] = useState(false);
  const [optionsModal1, setOptionsModal1] = useState(false);
  const [optionsModal2, setOptionsModal2] = useState(false);
  const [optionsModal3, setOptionsModal3] = useState(false);
  const [isShowTagModal, setIsShowTagModal] = useState(false);
  const [postIdForTag, setPostIdForTag] = useState<string | null>(null);
  const [postUserIdForTag, setPostUserIdForTag] = useState<string | undefined>(undefined);
  const [postUserImageForTag, setPostUserImageForTag] = useState<string | undefined>(undefined);
  const [postUsernameForTag, setPostUsernameForTag] = useState<string | undefined>(undefined);
  const [isFromDeepLink, setIsFromDeepLink] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
   
    if (postId) {
    // console.log('✅ PostDetails: Valid postId found, loading details...');
      fetchPostDetails(postId);
    } else {
     // console.log('❌ PostDetails: No post ID provided');
      setError('No post ID provided');
      setLoading(false);
    }
  }, [postId, postData]);

  const fetchPostDetails = async (id: string) => {
    try {
      setLoading(true);
     // console.log('🔍 Loading post details for ID:', id);
      
      // First, try to use the real post data passed from navigation params (timeline navigation)
      if (postData) {
        try {
          const parsedPostData = JSON.parse(postData);
         // console.log('✅ Using real post data from timeline navigation:', parsedPostData);
          setPost(parsedPostData);
          setIsFromDeepLink(false); // Timeline navigation
          setLoading(false);
          return;
        } catch (parseError) {
         // console.error('❌ Error parsing post data:', parseError);
        }
      }
      
      // If no post data in params (deep link case), fetch from API
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

   // console.log('🌐 No post data in params, fetching from API for deep link...');
      setIsFromDeepLink(true); // Deep link navigation
      const response = await timelineServices.getPostByIdQuery(token, id);
      
      if (response.responseCode === "0" && response.data) {
     //  console.log('✅ Successfully fetched post from API:', response.data);
        // console.log('🔍 Poster fields check:', {
        //   posterUsername: (response.data as any).posterUsername,
        //   posterUserImageUrl: (response.data as any).posterUserImageUrl,
        //   posterUserId: (response.data as any).posterUserId,
        //   posterUserRatings: (response.data as any).posterUserRatings,
        //   posterIsVerified: (response.data as any).posterIsVerified,
        //   allFields: Object.keys(response.data)
        // });
        // console.log('🔍 Full API response data:', JSON.stringify(response.data, null, 2));
        setPost(response.data);
        setLoading(false);
      } else {
      //  console.error('❌ API response error:', response);
        setError('Post not found');
        setLoading(false);
        
        toast.show('Post not found', {
          type: 'danger',
          duration: 3000,
        });
      }
      
    } catch (error) {
     // console.error('❌ Error loading post details:', error);
      setError('Failed to load post details');
      setLoading(false);
      
      toast.show('Failed to load post details', {
        type: 'danger',
        duration: 3000,
      });
    }
  };

  const handleGoBack = () => {
    if (isFromDeepLink) {
      // Deep link navigation: always go to home, don't use back stack
      router.replace('/(authenticated)/(tabs)/home');
    } else {
      // Timeline navigation: use normal back behavior
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(authenticated)/(tabs)/home');
      }
    }
  };

  const handleGoToTimeline = () => {
    router.replace('/(authenticated)/(tabs)/home');
  };

  const handleLikePress = useCallback(async () => {
    if (!post?.id) return;

    const handleStateChange = (postId: string, newState: LikeState) => {
      setPost((prevPost: any) => ({
        ...prevPost,
        isLiked: newState.isLiked,
        likesCount: newState.likesCount,
      }));
    };

    // Initialize service state if not exists
    const currentState = {
      isLiked: post.isLiked || false,
      likesCount: post.likesCount || 0,
    };
    likeService.updateState(post.id, currentState);

    await likeService.toggleLike({
      postId: post.id,
      currentState,
      onStateChange: handleStateChange,
      toast,
    });
  }, [post?.id, post?.isLiked, post?.likesCount, toast]);

  // Reuse the same comment logic from StoryLine component
  const handleCommentPress = () => {
    if (!token) {
      return dispatch(setIsShownLoginModal(true));
    }
    setIsShowCommentModal(true);
  };

  const handleSharePress = () => {
    setShowShareModal(true);
  };

  const handleMenuPress = () => {
    setOptionsModal(true);
  };

  const handleCloseOptionsModal = () => {
    setOptionsModal(false);
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

  const handleCloseReportModal = () => {
    setIsShowReportModal(false);
  };

  const fetchReasons = async () => {
    setReasonsLoading(true);
    setReasonsError(null);
    try {
      const data = await timelineServices.reportReasons(token);
      // console.log('data', data);
      if (Array.isArray(data?.data)) {
        setReportReasons(data.data);
      } else {
        setReasonsError('Invalid data format');
      }
    } catch (e) {
      setReasonsError(`Failed to load reasons: ${e}`);
    } finally {
      setReasonsLoading(false);
    }
  };

  const fetchActions = async () => {
    setActionsLoading(true);
    setActionsError(null);
    try {
      const data = await timelineServices.getReportActions(token);
      // console.log('actions data', data);
      if (Array.isArray(data?.data)) {
        setActionOptions(data.data);
      } else {
        setActionsError('Invalid data format');
      }
    } catch (e) {
      setActionsError(`Failed to load actions: ${e}`);
    } finally {
      setActionsLoading(false);
    }
  };

  const openActionModal = async () => {
    await fetchActions();
    closeReportSheet();
    setTimeout(() => {
      setOptionsModal3(true);
    }, 700);
  };

  const reportPost = async () => {
    setReasonsLoading(true);

    try {
      const payload = {
        "reason": selectedReason || '',
        "action": selectedAction.id,
        "comment": message,
      };

      const response = await timelineServices.reportPost(
        token,
        post.id,
        payload
      );

      closeReportSheet();

      if (response.responseCode === "0") {
        setReasonsLoading(false);
        toast.show("Post reported successfully", {
          type: "success",
          duration: 2000,
        });
        // Optionally refresh or navigate back
      } else {
        toast.show("An error occurred", {
          type: "danger",
          duration: 6000,
        });
      }
      setReasonsLoading(false);
    } catch (e) {
    //  console.error('Report post error:', e);
      setReasonsLoading(false);
      toast.show("Failed to report post", {
        type: "danger",
        duration: 3000,
      });
    }
  };

  // Fetch report reasons when report modal opens
  useEffect(() => {
    if (isShowReportModal && token) {
      fetchReasons();
    }
  }, [isShowReportModal, token]);

  // Handle tag press functionality - same as homepage
  const handlePressTag = (data: any) => {
    setPostIdForTag(data?.id);
    setPostUserIdForTag(data?.userId);
    setPostUserImageForTag(data?.userImageUrl);
    setPostUsernameForTag(data?.username || data?.posterUsername || data?.sellerUsername);
    setIsShowTagModal(true);
  };

  // Context-aware navigation behavior
  // Deep links: always go to home (no back stack navigation)
  // Timeline: use normal back behavior

  // Create post options exactly like PostList component in home screen
  const postOptions =
    profile?.id !== post?.userId
      ? [
          {
            id: 1,
            title: post?.isFollowing ? "Unfollow Drber" : "Follow",
            borderColor: "#EDF2F7",
            onPress: () => {
              handleCloseOptionsModal();
              // TODO: Implement follow/unfollow functionality
              toast.show('Follow functionality coming soon', { type: 'info' });
            },
          },
          {
            id: 2,
            title: "Share this Post",
            borderColor: "#EDF2F7",
            icon:< ShareComponent/>,
            onPress: () => {
              setOptionsModal(false);
              setTimeout(() => {
                setShowShareModal(true);
              }, 1000);
            },
          },
          {
            id: 3,
            title: "Flag / Report this Post",
            borderColor: "#EDF2F7",
            icon:< FlagComponent/>,
            onPress: () => {
              openReportSheet();
            },
          },
        ]
      : [
          {
            id: 1,
            title: "Edit post",
            borderColor: "#EDF2F7",
            onPress: () => {
              handleCloseOptionsModal();
              // TODO: Implement edit functionality
              toast.show('Edit functionality coming soon', { type: 'info' });
            },
          },
          {
            id: 2,
            title: "Delete post",
            color: "#D4313E",
            onPress: () => {
              handleCloseOptionsModal();
              // TODO: Implement delete functionality
              toast.show('Delete functionality coming soon', { type: 'info' });
            },
          },
        ];

  // Create actions array similar to PostList component
  const getPostActions = () => {
    return [
      {
        id: 'like',
        icon: <LikeIcon />,
        count: post?.likesCount || 0,
        isActive: post?.isLiked
      },
      {
        id: 'comment',
        icon: <ChatIcon />,
        count: post?.commentCount || 0
      },
      {
        id: 'share',
        icon: <ShareIcon />,
        count: 0
      }
    ];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title="Post Details" onPress={handleGoBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B4A" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader title="Post Details" onPress={handleGoBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Post Not Found</Text>
          <Text style={styles.errorText}>
            {error || 'The post you\'re looking for could not be found.'}
          </Text>
          <Pressable style={styles.button} onPress={handleGoToTimeline}>
            <Text style={styles.buttonText}>Go to Timeline</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader title="Post" onPress={handleGoBack} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* User Profile Section - Using same structure as PostList */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.profileImageContainer}>
              {(post.userImageUrl || post.posterUserImageUrl) ? (
                <Image
                  source={{ uri: post.userImageUrl || post.posterUserImageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getInitials((post?.username || post?.posterUsername) || '')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{(post?.username || post?.postedBy) || 'Unknown User'}</Text>
                {(post?.isVerified || post?.posterIsVerified) && (
                  <VerifiedIcon style={styles.verifiedIcon} />
                )}
              </View>
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {starTemplate((post?.userRatings || post?.posterUserRatings) || 0)}
                </View>
                <Text style={styles.reviewCount}>{(post?.userRatings || post?.posterUserRatings) || 0} Reviews</Text>
              </View>
            </View>
            {/* Menu Icon - Same as PostList */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <MoreIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Image - Using same structure as PostList */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: post?.defaultImageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
          {post?.hasTag && (
            <Pressable
              style={({ pressed }) => [
                styles.tagView,
                { opacity: pressed ? 0.5 : 1 },
              ]}
              onPress={() => handlePressTag(post)}
            >
              <TagIcon />
            </Pressable>
          )}
        </View>

        {/* Engagement Section - Using same icons and logic as PostList */}
        <View style={styles.engagementSection}>
          <View style={styles.engagementButtons}>
            {getPostActions().map((action) => (
              <Pressable
                key={action.id}
                style={styles.engagementButton}
                onPress={() => {
                  if (action.id === 'like') {
                    handleLikePress();
                  } else if (action.id === 'comment') {
                    handleCommentPress();
                  } else if (action.id === 'share') {
                    handleSharePress();
                  }
                }}
                disabled={action.id === 'like' && likeLoader}
              >
                {action.id === 'like' && likeLoader ? (
                  <Text style={styles.likeLoadingText}>...</Text>
                ) : (
                  <>
                    {action.icon}
                    <Text style={[styles.engagementText, { opacity: likeLoader ? 0.5 : 1 }]}>{action.count}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Post Caption */}
        <View style={styles.captionSection}>
          <Text style={styles.captionUsername}>{(post?.username || (post as any)?.postedBy) || 'Unknown User'} </Text>
          <Text style={styles.caption}>{post?.caption}</Text>
        </View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        isShow={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="post"
        postData={{
          id: post?.id,
          caption: post?.caption,
          username: (post?.username || (post as any)?.postedBy) || 'Unknown User'
        }}
      />

      {/* Comments Modal - Reusing the same modal from StoryLine */}
      {isShowCommentModal && post && (
        <CommentsModal
          isShow={isShowCommentModal}
          onClose={() => setIsShowCommentModal(false)}
          selectedCommentDetails={post}
          refetch={() => {}}
        />
      )}

      {/* Options Modal - Same as PostList */}
      <NewBottomModal
        isShow={optionsModal}
        onClose={handleCloseOptionsModal}
        maxHeight={257}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: "100%",
          flex: 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 16, marginVertical: 16 }}>
          <Text style={{ fontSize: 16, fontFamily: "DMSansSemiBold", textAlign: "center" }}>
            What do you want to do?
          </Text>
          <Pressable onPress={handleCloseOptionsModal} style={{ padding: 12, position: "absolute", right: 16 }}>
            <CancelIcon />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 16, alignItems: "center" }}>
          {postOptions?.map((data: any) =>
            !post?.isEditable && data?.title === "Edit post" ? (
              ""
            ) : (
              <Pressable
                key={data?.id}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  flexDirection: 'row',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: data?.borderColor || "white",
                }}
                onPress={data.onPress}
              >
                <View style={{ width: 24 }}>
                  {data.icon}
                </View>
                <Text style={{ color: data?.color || "#393939", fontSize: 12 }}>
                  {data?.title}
                </Text>
                <View style={{ width: 24 }} />
              </Pressable>
            )
          )}
        </View>
      </NewBottomModal>

      {/* Report Modal using NewBottomModal - Exact copy from home screen PostList */}
      <NewBottomModal
        isShow={isShowReportModal}
        onClose={closeReportSheet}
        maxHeight={540}
        contentStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 0,
          width: "100%",
          flex: 1,
        }}
      >
        {/* Title and Close Icon */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 18,
          paddingBottom: 8,
          paddingHorizontal: 20,
        }}>
          <Text style={{
            fontSize: 17,
            fontWeight: '600',
            color: "#000",
            textAlign: 'center',
          }}>
            Report Post
          </Text>
          <Pressable onPress={closeReportSheet} style={{ padding: 8 }}>
            <CancelIcon width={22} height={22} />
          </Pressable>
        </View>
        <ScrollView>
          {/* Why are you reporting this post? */}
          <Text style={{ color: "#000", fontSize: 15, fontWeight: '500', marginLeft: 20, marginBottom: 16, marginTop: 15}}>
            Why are you reporting this post?
          </Text>
          {/* Reasons as pills */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 12 }}>
            {reasonsLoading ? (
              <Text style={{ color: "#666", fontSize: 14 }}>Loading reasons...</Text>
            ) : reasonsError ? (
              <Text style={{ color: "#666", fontSize: 14 }}>{reasonsError}</Text>
            ) : reportReasons.length === 0 ? (
              <Text style={{ color: "#666", fontSize: 14 }}>No reasons available</Text>
            ) : (
              reportReasons.map((reason) => (
                <Pressable
                  key={reason.id}
                  onPress={() => setSelectedReason(reason.id)}
                  style={{
                    backgroundColor: selectedReason === reason.id ? "#007AFF" : '#F5F5F5',
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    marginRight: 8,
                    marginBottom: 15,
                    borderWidth: selectedReason === reason.id ? 1.5 : 0,
                    borderColor: selectedReason === reason.id ? "#007AFF" : '#E9EAEB',
                  }}
                >
                  <Text style={{ color: selectedReason === reason.id ? '#fff' : "#000", fontSize: 14, fontWeight: '500' }}>{reason.description}</Text>
                </Pressable>
              ))
            )}
          </View>
        
          {/* Message Input */}
          <View style={{ paddingHorizontal: 16, marginBottom: 15 }}>
            <Text style={{ color: "#000", fontSize: 15, fontWeight: '500', marginBottom: 6 }}>
              Give details or any other reasons
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write a Message"
              placeholderTextColor="#666"
              multiline
              style={{
                minHeight: 60,
                borderRadius: 12,
                borderWidth: 1.2,
                borderColor: "#666",
                backgroundColor: '#fff',
                paddingHorizontal: 14,
                paddingTop: 10,
                fontSize: 15,
                color: "#000",
                marginBottom: 20,
              }}
            />
          </View>
          {/* Checkbox for Block/Unfollow */}
          <Pressable
            onPress={openActionModal}
            style={{
              backgroundColor: '#F5F6F7',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 14,
              marginHorizontal: 16,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: selectedAction ? '#222' : '#8A8F98', fontSize: 16 }}>
              {selectedAction ? selectedAction.name : 'What do you want to do?'}
            </Text>
            <DropDownArrowComponent />
          </Pressable>
         
          {/* Report Post Button */}
          <View style={{ width: "100%", paddingHorizontal: 24, marginBottom: 30}}>
            <FilledButton
              title={"Report Post"}
              onPress={reportPost}
              disable={!selectedReason || !selectedAction || reasonsLoading}          
              loading={reasonsLoading}
            />
          </View>
          <Text style={{ color: '#6B727E', fontSize: 13, textAlign: 'left', marginHorizontal: 24, marginBottom: 30}}>
            Your name will not shared with anyone when you report a post..
          </Text>
        </ScrollView>
      </NewBottomModal>

      {/* Action Modal */}
      <NewBottomModal
        isShow={optionsModal3}
        onClose={() => {
          setOptionsModal3(false);
        }}
        maxHeight={screenHeight}
        contentStyle={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 0,
          width: '100%',
          flex: 1,
        }}
      >
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: 80,
          paddingBottom: 8, 
          paddingHorizontal: 20
        }}>
          <Text style={{
            fontSize: 17,
            fontWeight: '600',
            color: "#000",
            textAlign: 'center',
          }}>
            What do you want to do?
          </Text>
          <Pressable onPress={() => setOptionsModal3(false)} style={{ padding: 8 }}>
            <CancelIcon width={22} height={22} />
          </Pressable>
        </View>
        <ScrollView>
          <View style={{ paddingHorizontal: 16, alignItems: "center" }}>
            {actionsLoading ? (
              <Text style={{ color: "#666", fontSize: 14, padding: 20 }}>Loading actions...</Text>
            ) : actionsError ? (
              <Text style={{ color: "#666", fontSize: 14, padding: 20 }}>{actionsError}</Text>
            ) : actionOptions.length === 0 ? (
              <Text style={{ color: "#666", fontSize: 14, padding: 20 }}>No actions available</Text>
            ) : (
              actionOptions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => {
                    setSelectedAction(action);
                    setOptionsModal3(false);
                  }}
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'row',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#EDF2F7',
                  }}
                >
                  <View style={{ width: 24 }} />
                  <Text style={{ color: '#393939', fontSize: 12 }}>
                    {action.name}
                  </Text>
                  <View style={{ width: 24 }} />
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </NewBottomModal>

      {/* Tags Modal - Same as homepage implementation */}
      {isShowTagModal && postIdForTag && (
        <TagsModal
          isShow={isShowTagModal}
          onClose={() => setIsShowTagModal(false)}
          contentId={postIdForTag}
          contentType="post"
          userId={postUserIdForTag}
          userImageUrl={postUserImageForTag}
          username={postUsernameForTag}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginHorizontal: 24,

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'DMSansMedium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF3B4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // New styles for the redesigned layout - matching PostList structure
  userSection: {
    // paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212C3D',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  verifiedIcon: {
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 10,
    color: '#232323',
    fontFamily: 'DMSansMedium',
  },
  imageContainer: {
    width: '100%',
    height: 328,
    borderRadius: 8,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
  tagText: {
    fontSize: 14,
  },
  engagementSection: {
    paddingHorizontal: 2,
    paddingVertical: 8,
  },
  engagementButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  engagementText: {
    marginLeft: 2,
    fontSize: 12,
    color: '#212C3D',
    fontFamily: 'DMSansMedium',
  },
  likeLoadingText: {
    fontSize: 12,
    color: '#212C3D',
    fontFamily: 'DMSansMedium',
  },
  captionSection: {
    flexDirection: 'row',

    // paddingHorizontal: 16,
    paddingBottom: 20,
  },
  captionUsername: {
    fontSize: 12,
    color: '#07090C',
    fontFamily: 'DMSansSemiBold',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: '#07090C',
    lineHeight: 18,
  },
  menuButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
