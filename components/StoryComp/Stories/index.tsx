import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddStoryIcon from "../../../assets/images/svg/add-story-icon.svg";
import StoryProfile from "./StoryProfile";
import StatusViewModal from "modals/sataus/StatusViewModal";
import UploadStatusModal from "modals/sataus/UploadStatusModal";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { useStories, UserStorySlidesDataType } from "@hooks/use-stories";
import { useI18n } from "@hooks/use-i18n";

interface IStoriesView {
  handleViewStory?: any;
}

const StoriesView = ({ handleViewStory }: IStoriesView) => {
  const { t } = useI18n();
  const [insideStory, setInsideStory] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [viewedStories, setViewedStories]: any = useState({});
  const [isShowImageModal, setIsShowImageModal] = useState(false);
  const [isFileLoader, setIsFileLoader] = useState(false);

  const { token, profile, userName } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();

  const {
    data: stories,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreData,
    refetch,
    isRefetching,
  } = useStories({
    token,
    enabled: !!token
  });

  const openStory = useCallback((data: any) => {
    setInsideStory(data);
  }, []);

  const closeStory = useCallback(() => {
    setInsideStory(null);
  }, []);

  const pickImage = useCallback(async () => {
    if (!token) {
      return dispatch(setIsShownLoginModal(true));
    }

    router.push({
      pathname: "/(authenticated)/createStory",
      params: {
        refetchStories: "true",
      },
    });
  }, [token, dispatch]);

  const checkIfstoryIsUploaded = useMemo(() => {
    return stories?.find((list: any) => list?.userId === profile?.id);
  }, [stories, profile?.id]);

  const sortedData = useMemo(() => {
    if (!stories) return [];

    return [...stories].sort((a: any, b: any) => {
      if (a.userId === profile?.id) return -1;
      if (b.userId === profile?.id) return 1;
      return 0;
    });
  }, [stories, profile?.id]);

  const handleOpenStory = useCallback((userStoryData: any, storyIndex: any) => {
    const userId = userStoryData?.userId;
    setViewedStories((prev: any) => {
      const userViewed = prev[userId] || [];
      if (!userViewed.includes(storyIndex)) {
        return {
          ...prev,
          [userId]: [...userViewed, storyIndex],
        };
      }
      return prev;
    });
    openStory(userStoryData);
  }, [openStory]);

  const renderStoryItem: ListRenderItem<UserStorySlidesDataType> = useCallback(({
    item,
    index,
  }) => {
    return item?.userId === profile?.id ? (
      <View key={item?.userId}>
        <StoryProfile
          displayName={item?.username || userName}
          onPressWrapper={() => router.push("/(authenticated)/myStories")}
          outlineColor={"#D4313E"}
          imageUrl={item?.stories[0]?.storyMediaUrl}
          storyCount={item?.stories?.length}
          stories={item?.stories}
          isUserStories
        />

        <Pressable
          style={({ pressed }) => [
            styles.addStoryWrapper,
            { opacity: pressed ? 0.5 : 1 },
          ]}
          onPress={pickImage}
        >
          <AddStoryIcon width={10} height={10} />
        </Pressable>
      </View>
    ) : (
      <StoryProfile
        displayName={item?.username}
        onPressWrapper={() => openStory(item)}
        outlineColor={"#D4313E"}
        imageUrl={item?.stories[0]?.storyMediaUrl}
        storyCount={item?.stories?.length}
        stories={item?.stories}
      />
    );
  }, [profile?.id, userName, handleOpenStory, pickImage, openStory]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (__DEV__) {
      console.log('onEndReached called:', {
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        storiesCount: stories?.length
      });
    }

    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      if (__DEV__) {
        console.log('Loading more stories...');
      }
      loadMoreData();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, loadMoreData, stories?.length]);

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color="#FF5C68" />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  return (
    <View style={styles.container}>
      {(checkIfstoryIsUploaded === undefined || stories?.length === 0) && (
        <View style={styles.initStoryContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.initStoryView,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={pickImage}
          >
            <AddStoryIcon width={16} height={16} />
          </Pressable>
          <Text style={styles.storyText}>{t('home.yourStory')}</Text>
        </View>
      )}

      <FlatList
        data={sortedData}
        keyExtractor={(item) => item?.userId?.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onEndReached={hasNextPage ? handleEndReached : null}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            tintColor={"#FF5C68"}
            refreshing={isLoading && !isRefetching}
            onRefresh={handleRefresh}
          />
        }
        renderItem={renderStoryItem}
        ListFooterComponent={renderListFooter}
      />

      {insideStory && (
        <StatusViewModal
          isShow
          onClose={closeStory}
          userStories={insideStory}
          refetch={refetch}
          profileId={profile?.id}
          setCurrentUserStory={(currentStoryId: any, userStories: any) => {
            // Optional: Handle story view tracking
          }}
        />
      )}

      {isShowImageModal && (
        <UploadStatusModal
          isShow
          onClose={() => {
            setImages([]);
            setIsShowImageModal(false);
          }}
          fileDetails={images}
          refetch={refetch}
          loader={isFileLoader}
        />
      )}
    </View>
  );
};

export default StoriesView;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  initStoryContainer: {
    marginRight: 16,
    zIndex: 9999,
    position: "relative",
  },
  addStoryWrapper: {
    width: 17,
    height: 17,
    backgroundColor: "#FFEBED",
    borderRadius: 17,
    position: "absolute",
    top: "57%",
    left: "30%",
    borderWidth: 1,
    borderColor: "white",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  initStoryView: {
    width: 52,
    height: 52,
    backgroundColor: "#FFEBED",
    borderRadius: 52,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  storyText: {
    fontSize: 10,
    color: "#212C3D",
    marginTop: 5,
    textAlign: "center",
  },
  loadingFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
