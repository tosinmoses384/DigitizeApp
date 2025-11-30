import React, { memo, useCallback } from "react";
import { ScrollView, View, StyleSheet, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import EmptyState from "@components/EmptyState";
import TopTenDribers from "@components/topTenDribers";
import CustomButton from "@components/CustomButton/index";
import PlusBtnIcon from "../../assets/images/svg/circle-plus-icon.svg";
import { useI18n } from "@hooks/use-i18n";

// Props interface following coding guide section 3
export interface EmptyStateContentProps {
  filterByCategory?: string;
  sellerId?: string;
  onRefreshPosts: (data: boolean) => void;
  refreshing?: boolean;
  maxHeaderHeight?: number;
}

/**
 * Stateless component for rendering empty states
 * Following atomic design principles from section 3 of coding guide
 */
const EmptyStateContent: React.FC<EmptyStateContentProps> = memo(({
  filterByCategory,
  sellerId,
  onRefreshPosts,
  refreshing = false,
  maxHeaderHeight = 0,
}) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);

  // Memoized handler for add post action
  const handleAddPost = useCallback(() => {
    if (!token) {
      dispatch(setIsShownLoginModal(true));
      return;
    }
    
    dispatch(setTagedDetails(null));
    router.push("/addPost");
  }, [token, dispatch]);

  // Memoized handler for navigating to Drbers page
  const handleViewMoreDrbers = useCallback(() => {
    router.push("/Drbers");
  }, []);

  if (filterByCategory) {
    return (
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: maxHeaderHeight }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefreshPosts(true)}
            tintColor="#FF5C68"
            colors={["#FF5C68"]}
          />
        }
      >
        <EmptyState
          title={
            sellerId
              ? t('post.sellerNoPostsYet')
              : t('post.noPostsYetForOutfit')
          }
          subtitle={
            sellerId
              ? t('post.sellerPostsWillAppear')
              : t('post.postsWillAppear')
          }
          subtitleStyle={styles.subtitleStyle}
          buttonTitle={t('post.addNewPost')}
          hasButton={!sellerId}
          btnIcon={<PlusBtnIcon />}
          onPress={handleAddPost}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={styles.scrollView}
      contentContainerStyle={{ paddingTop: maxHeaderHeight }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => onRefreshPosts(true)}
          tintColor="#FF5C68"
          colors={["#FF5C68"]}
        />
      }
    >
      <EmptyState
        title={t('post.showOffYourStyle')}
        subtitle={t('post.flexYourStyle')}
        subtitleStyle={styles.subtitleStyleMain}
        hasButton={true}
        onPress={handleAddPost}
        buttonTitle={t('post.createFirstPost')}
        btnIcon={<PlusBtnIcon />}
        otherText={t('post.followDrbersInspiration')}
      />

      <TopTenDribers refetch={onRefreshPosts} />
      
      {profile && (
        <View style={styles.viewMoreContainer}>
          <CustomButton
            title={t('post.viewMoreDrbers')}
            textStyle={styles.viewMoreBtnText}
            onPress={handleViewMoreDrbers}
          />
        </View>
      )}
    </ScrollView>
  );
});

EmptyStateContent.displayName = "EmptyStateContent";

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  subtitleStyle: {
    width: "80%",
  },
  subtitleStyleMain: {
    width: "70%",
  },
  viewMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 100,
  },
  viewMoreBtnText: {
    fontSize: 14,
    color: "#FF5C68",
    fontFamily: "DMSansMedium",
  },
});

export default EmptyStateContent;
