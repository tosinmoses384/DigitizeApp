import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Platform,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import StackHeader from "@components/StackHeader";
import { router, useFocusEffect } from "expo-router";
import { defaultStyles } from "@constants/Styles";
import { fontSz } from "../../constants";
import ProfileImage from "../../assets/images/svg/profileImage.svg";
import ProfileImage1 from "../../assets/images/svg/profileImage.svg";
import VerifiedIcon from "../../assets/images/svg/verified.svg";
import StarIcon from "../../assets/images/svg/StarOutline.svg";
import ClockIcon from "../../assets/images/svg/access_time.svg";
import FilterIcon from "../../assets/images/svg/Icons/Basic/Filter.svg";
import ToggleTabs from "@components/Toggle";
import RecommendedCardList from "@components/RecommendedCardList";
import TriftersList from "@components/TriftersList";
import { Colors, SIZES } from "@constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import EmptyReviewIcon from "@assets/images/svg/no-review-icon.svg";
import ListIcon from "@assets/images/svg/list-icon.svg";
import {
  IListItemsRequest,
  IReviewsRequest,
} from "@services/features/wardrobe-service/wardrobeServices";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import RecommendedCard from "@components/RecommendedCard";
import SkeletonLoader from "@components/Skeleton";
import SingleSkelenton from "@components/SingleSkelenton";
import { getInitials } from "@helper/getInitials";
import { starTemplate } from "@helper/starTemplate";
import EmptyState from "@components/EmptyState";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import LineLoader from "@components/LineLoader";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import TrifterCard from "@components/TrifterCard";
import ProfileOptionModal from "modals/ProfileOptionModal";
import DeleteItemModal from "modals/DeleteItemModal";
import { withAuthGuard } from "@hooks/use-auth-guard/withAuthGuard";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
import {
  setProfileTab,
  setRefetchUserDashboardState,
} from "@redux/slice/profile/profileSlice";

const ProfileMainComponent = () => {
  const dispatch = useAppDispatch();
  const { 
    profile, 
    refecthUserDashboardState, 
    profileTab, 
    refecthUserDashboardState: refetchUserDashboardState 
  } = useAppSelector((state) => state?.userProfileSlice);
  
  const { callApi, callApiWithLoading } = useApiService();
  
  // State management
  const [userDashboard, setUserDashboard] = useState<any>(null);
  const [items, setItems] = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [selectedTab, setSelectedTab] = useState("first");
  const [scrollTab, setScrollTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pageItemCount, setPageItemCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<any>(null);

  // Auth-protected API calls using the new auth guard
  const getUserDashboard = async () => {
    await callApiWithLoading(
      (token) => marketplaceServices.userSocialProfile(token),
      setProfileLoading,
      {
        onSuccess: (res: any) => {
          if (res?.status === 200) {
            setUserDashboard(res?.data);
          }
        },
        onError: (error) => {
          console.error('Failed to fetch user dashboard:', error);
        }
        // Auth errors (401) handled automatically
      }
    );
  };

  const getItems = async () => {
    if (!pageToken) return;

    const data: IListItemsRequest = {
      token: "", // token handled by auth guard
      pageQuery: "",
      pageSize: "12",
      pageToken: pageToken,
    };

    await callApi(
      (token) => wardrobeServices.listItemsQuery({ ...data, token }, statusObject?.[scrollTab]),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          const newData = res?.data?.dataset || [];
          setItems([...items, ...newData]);
          setPageToken(res?.data?.pageToken);
        },
        onError: (error) => {
          setLoading(false);
          console.error('Failed to fetch items:', error);
        }
      }
    );
  };

  const getInitItems = async () => {
    setPageToken("");
    setLoading(true);

    const data: IListItemsRequest = {
      token: "", // token handled by auth guard
      pageQuery: "",
      pageSize: "12",
      pageToken: "",
    };

    await callApi(
      (token) => wardrobeServices.listItemsQuery({ ...data, token }, statusObject?.[scrollTab]),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          setPageItemCount(res?.data?.pageItemCount);
          setItems(res?.data?.dataset);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
        },
        onError: (error) => {
          setLoading(false);
          console.error('Failed to fetch initial items:', error);
        }
      }
    );
  };

  const getReviews = async () => {
    if (!pageToken) return;

    const data: IReviewsRequest = {
      token: "", // token handled by auth guard
      trifterId: profile?.id,
      pageSize: "12",
      pageToken: pageToken,
    };

    await callApi(
      (token) => wardrobeServices.reviewsQuery({ ...data, token }),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          let newData = res?.data?.dataset || [];
          setItems([...items, ...newData]);
          setPageToken(res?.data?.pageToken);
        },
        onError: (error) => {
          setLoading(false);
          console.error('Failed to fetch reviews:', error);
        }
      }
    );
  };

  const getInitReviews = async () => {
    setPageToken("");
    setLoading(true);

    const data: IReviewsRequest = {
      token: "", // token handled by auth guard
      trifterId: profile?.id,
      pageSize: "12",
      pageToken: "",
    };

    await callApi(
      (token) => wardrobeServices.reviewsQuery({ ...data, token }),
      {
        onSuccess: (res: any) => {
          setLoading(false);
          setItems(res?.data?.dataset);
          if (res?.data?.hasNextPage) {
            setPageToken(res?.data?.pageToken);
          }
        },
        onError: (error) => {
          setLoading(false);
          console.error('Failed to fetch initial reviews:', error);
        }
      }
    );
  };

  // Component logic remains the same
  const statusObject: any = {
    All: "",
    Active: "Active",
    Sold: "ItemSold",
    Hidden: "Hidden",
  };

  const setTab = (tab: string) => {
    setSelectedTab(tab);
    dispatch(setProfileTab(tab));
  };

  const setScrollTabFunc = (tab: string) => {
    setScrollTab(tab);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const profileData: any = {
    items: userDashboard?.wardrobeItemCount || 0,
    following: userDashboard?.followingTriftersCount,
    [userDashboard?.followerCount === 1 ? "follower" : "followers"]:
      userDashboard?.followerCount,
    about: capitalizeFirstLetter(profile?.biography || ""),
    location: `${profile?.locationName ? `${profile?.locationName},` : ""} ${
      profile?.countryName
    }`,
    lastSeen: "30mins ago",
    username: "teanottee",
    isVerified: true,
    review: userDashboard?.reviewCount || 0,
  };

  const scrollTabs2 = ["All", "Drbers"];

  // Effects
  useEffect(() => {
    getUserDashboard();
    return () => {
      dispatch(setRefetchUserDashboardState(false));
    };
  }, [refetchUserDashboardState]);

  useEffect(() => {
    if (selectedTab === "second") {
      getInitItems();
    } else if (selectedTab === "third") {
      getInitReviews();
    }
  }, [selectedTab, scrollTab]);

  useFocusEffect(
    useCallback(() => {
      if (profileTab) {
        setSelectedTab(profileTab);
      }
      getUserDashboard();
    }, [profileTab])
  );

  // Format status helper function
  const formatStatus = (status: string) => {
    if (status?.toLocaleLowerCase?.() === "active") {
      return {
        title: "Active",
        className: styles.activeStatus,
        textColor: styles.activeTextStatus,
      };
    }
    if (status?.toLocaleLowerCase?.() === "itemsold") {
      return {
        title: "Sold",
        className: styles.soldStatus,
        textColor: styles.soldTextStatus,
      };
    }
    if (status?.toLocaleLowerCase?.() === "hidden") {
      return {
        title: "Hidden",
        className: styles.hiddenStatus,
        textColor: styles.hiddenTextStatus,
      };
    }
    return {
      title: "Active",
      className: styles.activeStatus,
      textColor: styles.activeTextStatus,
    };
  };

  // Render methods
  const renderProfileInfo = () => (
    <View style={styles.profileContainer}>
      <View style={styles.row}>
        {profile?.profileImageUrl ? (
          <Image
            source={{ uri: profile?.profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {getInitials(`${profile?.firstName} ${profile?.lastName}` || "")}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            {profile?.isVerified && <VerifiedIcon />}
          </View>
          <Text style={styles.username}>@{userDashboard?.trifterName}</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity
              onPress={() => router.push(`/following`)}
              style={styles.statItem}
            >
              <Text style={styles.statNumber}>{profileData.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/followers`)}
              style={styles.statItem}
            >
              <Text style={styles.statNumber}>{profileData.followers}</Text>
              <Text style={styles.statLabel}>
                {profileData.followers === 1 ? "Follower" : "Followers"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={openModal} style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      {profileData.about && (
        <Text style={styles.bio}>{profileData.about}</Text>
      )}
      
      <Text style={styles.location}>{profileData.location}</Text>
      
      <View style={styles.reviewContainer}>
        <StarIcon />
        <Text style={styles.reviewText}>
          {starTemplate(userDashboard?.rating)} ({profileData.review} reviews)
        </Text>
      </View>
    </View>
  );

  // Rest of component JSX remains the same...
  return (
    <ScrollView style={[defaultStyles.container, { paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding }]}>
      <StackHeader
        title="Profile"
        onPress={() => router.back()}
        rightIcon={
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text>Settings</Text>
          </TouchableOpacity>
        }
      />

      {profileLoading ? (
        <SingleSkelenton />
      ) : (
        renderProfileInfo()
      )}

      <ToggleTabs
        tabs={["Items", "Reviews"]}
        activeTab={selectedTab === "second" ? 0 : selectedTab === "third" ? 1 : 0}
        onTabPress={(index) => setTab(index === 0 ? "second" : "third")}
      />

      {selectedTab === "second" && (
        <View>
          <ToggleTabs
            tabs={scrollTabs2}
            activeTab={scrollTabs2.indexOf(scrollTab)}
            onTabPress={(index) => setScrollTabFunc(scrollTabs2[index])}
          />
          
          {loading ? (
            <SkeletonLoader />
          ) : items.length > 0 ? (
            <MyResponsiveGrid
              data={items}
              renderItem={({ item }: any) => (
                <RecommendedCard
                  data={item}
                  onPress={() => router.push(`/ItemDetails/${item.id}`)}
                  showStatus={true}
                  formatStatus={formatStatus}
                  onMorePress={() => {
                    setSelectedItemToDelete(item);
                    setDeleteModal(true);
                  }}
                />
              )}
              numColumns={2}
              onEndReached={getItems}
            />
          ) : (
            <EmptyState
              icon={<ListIcon />}
              title="No items yet"
              description="Start building your wardrobe by adding items"
              actionText="Add your first item"
              onActionPress={() => router.push("/(tabs)/add")}
            />
          )}
        </View>
      )}

      {selectedTab === "third" && (
        <View>
          {loading ? (
            <SkeletonLoader />
          ) : items.length > 0 ? (
            <View>
              {items.map((review: any, index: number) => (
                <TrifterCard key={index} data={review} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<EmptyReviewIcon />}
              title="No reviews yet"
              description="Reviews from buyers will appear here"
            />
          )}
        </View>
      )}

      <ProfileOptionModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onEditProfile={() => {
          closeModal();
          router.push("/profileDetails");
        }}
        onShareProfile={() => {
          closeModal();
          // Handle share logic
        }}
      />

      <DeleteItemModal
        isVisible={deleteModal}
        onClose={() => setDeleteModal(false)}
        item={selectedItemToDelete}
        onDelete={() => {
          // Handle delete logic
          setDeleteModal(false);
          getInitItems(); // Refresh items
        }}
      />
    </ScrollView>
  );
};

// Wrap component with auth guard
const ProfileMain = withAuthGuard(ProfileMainComponent, {
  loadingMessage: "Loading your profile...",
  requireProfile: true,
});

export default ProfileMain;

// Styles remain the same...
const styles = StyleSheet.create({
  profileContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  username: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
  },
  statItem: {
    marginRight: 20,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.text.secondary,
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bio: {
    marginTop: 15,
    fontSize: 14,
    lineHeight: 20,
  },
  location: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  reviewText: {
    marginLeft: 5,
    fontSize: 14,
  },
  activeStatus: {
    backgroundColor: Colors.light.success.background,
  },
  activeTextStatus: {
    color: Colors.light.success.text,
  },
  soldStatus: {
    backgroundColor: Colors.light.warning.background,
  },
  soldTextStatus: {
    color: Colors.light.warning.text,
  },
  hiddenStatus: {
    backgroundColor: Colors.light.error.background,
  },
  hiddenTextStatus: {
    color: Colors.light.error.text,
  },
});
