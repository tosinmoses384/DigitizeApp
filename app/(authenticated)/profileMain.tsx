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
import React, { useCallback, useEffect, useState, useMemo } from "react";
import StackHeader from "../../components/StackHeader";
import { router, useFocusEffect } from "expo-router";
import { defaultStyles } from "../../constants/Styles";
import { fontSz } from "../../constants";
import ProfileImage from "../../assets/images/svg/profileImage.svg";
import ProfileImage1 from "../../assets/images/svg/profileImage.svg";
import VerifiedIcon from "../../assets/images/svg/verified.svg";
import StarIcon from "../../assets/images/svg/StarOutline.svg";
import ClockIcon from "../../assets/images/svg/access_time.svg";
import FilterIcon from "../../assets/images/svg/Icons/Basic/Filter.svg";
import ToggleTabs from "../../components/Toggle";
import RecommendedCardList from "../../components/RecommendedCardList";
// import { cardData3 } from "../../store/storage";
import TriftersList from "../../components/TriftersList";
// import { BlurView } from "expo-blur";
import { Colors, SIZES } from "../../constants/Colors";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import wardrobeServices from "../../services/features/wardrobe-service/wardrobeServices";
import EmptyReviewIcon from "../../assets/images/svg/no-review-icon.svg";
import ListIcon from "../../assets/images/svg/list-icon.svg";
import {
  IListItemsRequest,
  IReviewsRequest,
} from "../../services/features/wardrobe-service/models";
import MyResponsiveGrid from "../../components/MyResponsiveGrid";
import RecommendedCard from "../../components/RecommendedCard";
import SkeletonLoader from "../../components/Skeleton";
import SingleSkelenton from "../../components/SingleSkelenton";
import { getInitials } from "@helper/getInitials";
import { starTemplate } from "@helper/starTemplate";
import EmptyState from "@components/EmptyState";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import LineLoader from "@components/LineLoader";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import TrifterCard from "@components/TrifterCard";
import ProfileOptionModal from "modals/ProfileOptionModal";
import { push } from "expo-router/build/global-state/routing";
import DeleteItemModal from "modals/DeleteItemModal";
import DeleteListItemModal from "modals/DeleteListItemModal";
import StoryLine, { StoryLineApiConfig } from "@components/StoryLine";
import { setRefetchUserDashboardState } from "@redux/slice/profile/profileSlice";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import AppTabWrapper from "@components/AppTabWrapper";
import { useApiService } from "@hooks/use-auth-guard/useApiService";
import ProfileWardrobeItemsList from "@components/profile/ProfileWardrobeItemsList";
import ProfileWardrobeOutfitsList from "@components/profile/ProfileWardrobeOutfitsList";
import TabNavigation, { Tab } from "@components/StoryLine/TabNavigation";
import { useI18n } from "@hooks/use-i18n";

const ProfileMain = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { callApi, callApiWithLoading } = useApiService();

  const { token, profile, refecthUserDashboardState, profileTab } =
    useAppSelector((state) => state?.userProfileSlice);
  const [userDashboard, setUserDashboard]: any = useState(null);
  const [selectedTab, setSelectedTab] = useState("first");
  const [scrollTab, setScrollTab] = useState("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState("");
  const [cardWidth, setCardWidth] = useState(172);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showOptionModal, setIsShowOptionModal] = useState(null);

  const [itemDetails, setItemDetails] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [items, setItems]: any = useState([]);
  const [pageItemCount, setPageItemCount]: any = useState(0);
  
  const [dynamicFilterByType, setDynamicFilterByType] = useState("");

  // StoryLine API configuration state for user profile
  const [storyLineApiConfig, setStoryLineApiConfig] = useState<StoryLineApiConfig>({
    context: 'profile',
    filterByCategory: 'MyPosts',
    customFilters: { userSpecific: true, myPosts: true, profileView: true }
  });

  useEffect(() => {
    if (profileTab === "second") {
      return setSelectedTab("second");
    }
  }, [profileTab]);

  // "Hidden",

  const scrollTabs = ["All", "Active", "Sold", "Rejected"];
  const statusObject: any = {
    All: "",
    Active: "0",
    Sold: "4",
    Hidden: "5",
    Rejected: "3",
  };

  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab);
    setScrollTab("All");
  };

  // Centralized API parameter configuration function for user profile
  const getApiConfig = useCallback((activeTab: string, context: string = 'profile'): StoryLineApiConfig => {
    const baseConfig: StoryLineApiConfig = {
      activeTab,
      context: context as 'home' | 'profile' | 'category' | 'search',
      filterByCategory: 'MyPosts',
      customFilters: { 
        userSpecific: true, 
        myPosts: true,
        profileView: true,
        priority: 'high'
      }
    };
    
    // Tab-specific parameter customization for user profile
    switch (activeTab) {
      case 'ItemPost':
        return {
          ...baseConfig,
          filterByType: 'ExploreItemPost',
          customFilters: { 
            ...baseConfig.customFilters,
            itemSpecific: true,
            myItems: true
          }
        };
      case 'OutfitPost':
        return {
          ...baseConfig,
          filterByType: 'OutfitPost',
          customFilters: { 
            ...baseConfig.customFilters,
            outfitSpecific: true,
            myOutfits: true
          }
        };
      default:
        return {
          ...baseConfig,
          filterByCategory: 'MyPosts',
          customFilters: { 
            ...baseConfig.customFilters,
            general: true,
            myContent: true
          }
        };
    }
  }, []);

  // Track active tab for conditional rendering
  const [activeDigitizeAppTab, setActiveDigitizeAppTab] = useState<string>('');

  // DigitizeApp tabs (Posts, Items, Outfits)
  const digitizeappTabs: Tab[] = useMemo(
    () => [
      { id: "", title: t('home.posts') },
      { id: "ItemPost", title: t('home.items') },
      { id: "OutfitPost", title: t('home.outfits') },
    ],
    [t],
  );

  // Handle DigitizeApp tab press
  const handleDigitizeAppTabPress = useCallback((tabId: string) => {
    setActiveDigitizeAppTab(tabId);
    
    // Update API config for StoryLine (for Posts and Outfits tabs)
    if (tabId !== "ItemPost") {
      const newApiConfig = getApiConfig(tabId, 'profile');
      // Ensure activeTab is set in the config
      newApiConfig.activeTab = tabId;
      setStoryLineApiConfig(newApiConfig);
      setDynamicFilterByType(tabId === "OutfitPost" ? "OutfitPost" : "");
    }
  }, [getApiConfig]);

  // Enhanced tab change handler with dynamic API configuration (for StoryLine internal tabs)
  const handleActiveTabChange = useCallback((activeTab: string, suggestedFilterByType: string) => {
    
    // Update the legacy state for backward compatibility
    setDynamicFilterByType(suggestedFilterByType);
    
    // Generate new API configuration based on tab change
    const newApiConfig = getApiConfig(activeTab, 'profile');
    
    // Update the API configuration state
    setStoryLineApiConfig(newApiConfig);
    
  }, [getApiConfig]);

  // Initialize StoryLine API configuration on component mount
  useEffect(() => {
    const initialConfig = getApiConfig('', 'profile');
    setStoryLineApiConfig(initialConfig);
    // Set initial active tab to Posts (empty string)
    setActiveDigitizeAppTab('');
  }, [getApiConfig]);

  // Memoized props for StoryLine component
  const storyLineProps = useMemo(() => ({
    hideHorizontalStory: true,
    onActiveTabChange: handleActiveTabChange,
    apiConfig: storyLineApiConfig,
    parameterSource: 'parent' as const,
    onApiConfigChange: setStoryLineApiConfig,
  }), [handleActiveTabChange, storyLineApiConfig]);

  const handleScrollTabSelect = (tab: any) => {
    setScrollTab(tab);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const profileData: any = {
    items: userDashboard?.wardrobeItemCount || userDashboard?.itemCount || 0,
    following: userDashboard?.followingTriftersCount,
    [userDashboard?.followerCount === 1 ? "follower" : "followers"]:
      userDashboard?.followerCount,
    about: capitalizeFirstLetter(profile?.biography || ""),
    location: [profile?.locationName, profile?.countryName]
      ?.filter(Boolean)
      ?.join(", "),
    lastSeen: "30mins ago",
    username: "teanottee",
    isVerified: true,
    review: userDashboard?.reviewCount || 0,
  };

  const scrollTabs2 = ["All", "Drbers"];

  useEffect(() => {
    if (token) {
      setProfileLoading(true);
      callApi(
        (token) => marketplaceServices.userSocialProfile(token),
        {
          onSuccess: (res: any) => {
            setProfileLoading(false);
            if (res?.status === 200) {
              setUserDashboard(res?.data);
            }
          },
          onError: (error) => {
            setProfileLoading(false);
          }
        }
      );
    }
    return () => {
      dispatch(setRefetchUserDashboardState(false));
    };
  }, [token, refecthUserDashboardState]);

  const getItems = async () => {
    if (!pageToken) return;

    const data: IListItemsRequest = {
      token: "", // token handled by auth guard
      pageQuery: "",
      pageSize: "12",
      pageToken: pageToken,
    };

    const filterByStatus = statusObject?.[scrollTab];

    await callApi(
      (token) => {
        // Construct full endpoint URL for debugging
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
        const fullEndpointUrl = `${baseUrl}/wardrobe/v1/user-listings?Query=${data.pageQuery}&FilterByStatus=${filterByStatus || ''}&PageSize=${data.pageSize}&PageToken=${data.pageToken}`;
        
        return wardrobeServices.listItemsQuery({ ...data, token }, filterByStatus);
      },
      {
        onSuccess: (res: any) => {
          setLoading(false);
          const newData = res?.data?.dataset || [];
          setItems([...items, ...newData]);
          setPageToken(res?.data?.pageToken);
        },
        onError: (error) => {
          setLoading(false);
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
          let newData = res?.data?.dataset || [];
          setItems([...items, ...newData]);
          setPageToken(res?.data?.pageToken);
        },
        onError: (error) => {
          setLoading(false);
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
    
    // Console log the full endpoint url, payload and token here for debugging
    const filterByStatus = statusObject?.[scrollTab];
    
    await callApi(
      (token) => {
        // Construct full endpoint URL for debugging
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
        const fullEndpointUrl = `${baseUrl}/wardrobe/v1/user-listings?Query=${data.pageQuery}&FilterByStatus=${filterByStatus || ''}&PageSize=${data.pageSize}&PageToken=${data.pageToken}`;
        
        return wardrobeServices.listItemsQuery({ ...data, token }, filterByStatus);
      },
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
        }
      }
    );
  };

  useEffect(() => {
    if (token && selectedTab === "second") {
      getInitItems();
      return;
    }
    if (token && selectedTab === "third") {
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
            }
          }
        );
      };

      getInitReviews();
    }
  }, [token, selectedTab, scrollTab]);

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

    if (status?.toLocaleLowerCase?.() === "listingrejected") {
      return {
        title: "Rejected",
        className: styles.rejectedStatus,
        textColor: styles.rejectedTextStatus,
      };
    }
    if (status?.toLocaleLowerCase?.() === "listingpendingapproval") {
      return {
        title: "Pending",
        className: styles.pendingStatus,
        textColor: styles.pendingTextStatus,
      };
    }
  };

  const template = items?.map((item: any, index: number) => (
    <View key={index} style={[styles.card, { width: cardWidth }]}>
      <View
        style={[
          {
            flexDirection: "row",
            position: "absolute",
            top: 10,
            left: 7,
            zIndex: 1,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 16,
          },
          formatStatus(item?.status)?.className,
        ]}
      >
        <Text
          style={[
            {
              fontSize: 10,
              fontFamily: "DMSansMedium",
            },
            formatStatus(item?.status)?.textColor,
          ]}
        >
          {formatStatus(item?.status)?.title}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.listIcon, pressed && { opacity: 0.5 }]}
        onPress={() => {
          setIsShowOptionModal(item?.id);
          setItemDetails(item);
        }}
      >
        <ListIcon />
      </Pressable>
      <RecommendedCard
        key={index}
        isServerImage
        title={item?.brand}
        imageSource={item?.defaultImageUrl}
        width={"100%"}
        marginRight={0}
        size={item?.size}
        price={item?.price}
        isHidefavourite
        onPress={() => {
          const isSoldItem = item?.status?.toLowerCase?.() === "itemsold";
          if (isSoldItem) {
            router.push({
              pathname: '/itemDetail',
              params: { item: JSON.stringify(item) },
            });
          } else {
            router.push({
              pathname: '/(authenticated)/(tabs)/add',
              params: { existingItemId: item?.id }
            });
          }
        }}
        hideBuyButton
        currency={item?.currencySymbol}
      />
    </View>
  ));

  const emptyTemplate = getEmptyStateCountLoader(8)?.map((list, index) => {
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

  const handleSelectedOption = (data: string) => {
    setIsShowOptionModal(null);
    if (data === "Edit") {
      router.push(`/editProfileItem/${showOptionModal}`);
      return;
    }
    if (data === "Delete") {
      setDeleteItemId(showOptionModal);
    }
  };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FaFc",
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <StackHeader
          title={`${capitalizeFirstLetter(profile?.firstName || "")} ${capitalizeFirstLetter(profile?.lastName || "")}`}
          onPress={() => router.push("/profile")}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.profileContainer}
          onScroll={
            selectedTab === "second"
              ? getItems
              : selectedTab === "third"
              ? getReviews
              : () => {}
          }
          scrollEventThrottle={16}
        >
          {profileLoading ? (
            <SingleSkelenton />
          ) : (
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 1)",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={
                    userDashboard?.trifterProfileImageUrl ? openModal : () => {}
                  }
                >
                  {userDashboard?.trifterProfileImageUrl ? (
                    <Image
                      source={{ uri: userDashboard?.trifterProfileImageUrl }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles?.initials}>
                      <Text style={styles?.initialsText}>
                        {getInitials(
                          `${profile?.firstName || ""} ${
                            profile?.lastName || ""
                          }`
                        )}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.infoContainer}>
                  {[
                    "items",
                    "following",
                    userDashboard?.followerCount === 1
                      ? "follower"
                      : "followers",
                  ].map((key) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        if (key === "followers") {
                          router.push("/followers");
                        } else if (key === "following") {
                          router.push("/following");
                        } else if (key === "items") {
                          // Switch to DigitizeApp tab and set to ItemPost sub-tab
                          setSelectedTab("first");
                          const itemsConfig = getApiConfig('ItemPost', 'profile');
                          setStoryLineApiConfig(itemsConfig);
                        }
                      }}
                      style={[
                        styles.countContainer,
                        key === "followers" && styles.followerCountContainer,
                      ]}
                    >
                      <Text style={styles.text}>{profileData[key] || 0}</Text>
                      <Text style={styles.textcontent}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.nameContainer}>
                <Text style={styles.userName}>
                  {`${capitalizeFirstLetter(profile?.firstName || "")} ${capitalizeFirstLetter(profile?.lastName || "")}`}
                </Text>
                {profileData.isVerified && (
                  <VerifiedIcon style={styles.verifiedIcon} />
                )}
              </View>
              <View style={styles.reviewContainer}>
                {starTemplate(userDashboard?.ratings ?? 0)}
                <Text style={styles.text}>{profileData?.review} Reviews</Text>
              </View>

              <Text style={styles.userDetails}>
                {profileData?.about || "******"}
              </Text>
              {profileData?.location ? (
                <Text style={styles.userLocation}>{profileData?.location}</Text>
              ) : null}
              {/* <View style={[styles.reviewContainer, { marginVertical: 5 }]}>
                <ClockIcon height={18} width={18} />
                <Text style={styles.userLastSeen}>
                  Last seen: {userDashboard?.lastSeen}
                </Text>
              </View> */}
            </View>
          )}

          <ToggleTabs
            selectedTab={handleTabSelect}
            currentTab={selectedTab}
            firstLabel="DigitizeApp"
            secondLabel="Loved"
            thirdLabel="Reviews"
            small={false}
          />

          {/* {selectedTab === "first" && (
          <View style={styles.filterContainer}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Text>1824</Text>
              <Text>Items</Text>
            </View>
            <FilterIcon />
          </View>
        )} */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollTabContainer}
          >
            {(selectedTab === "first"
              ? []
              : selectedTab === "second"
              ? scrollTabs
              : scrollTabs2
            ).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleScrollTabSelect(tab)}
                style={[
                  styles.scrollTab,
                  scrollTab === tab && styles.scrollTabFocused,
                ]}
              >
                <Text
                  style={[
                    styles.scrollTabText,
                    scrollTab === tab && styles.scrollTabTextFocused,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedTab === "second" &&
            (loading ? (
              <MyResponsiveGrid
                template={emptyTemplate}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            ) : items?.length ? (
              <MyResponsiveGrid
                template={template}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            ) : (
              !loading && (
                <EmptyState 
                  title={
                    selectedTab === "second" 
                      ? `You have no ${scrollTab === "All" ? "items" : scrollTab.toLowerCase()} items in your loved collection yet.` 
                      : "You have not added any items yet."
                  }
                  subtitle={
                    selectedTab === "second" 
                      ? "When you do, they will appear here" 
                      : "When you do, they will appear here"
                  }
                />
              )
            ))}

          {selectedTab == "third" &&
            (loading ? (
              getEmptyStateCountLoader(8)?.map((list, index) => {
                return (
                  <View
                    style={{
                      marginBottom: 8,
                      // height: 50,
                    }}
                    key={index}
                  >
                    <TrifterCard
                      isLoading
                      name={""}
                      imageUrl={""}
                      location={""}
                      rating={0}
                    />
                  </View>
                );
              })
            ) : items?.length ? (
              <TriftersList reviews={items} />
            ) : (
              <EmptyState
                icon={<EmptyReviewIcon />}
                title="No reviews yet"
                subtitle="When other Drbers review your items, they will appear here"
              />
            ))}

          {selectedTab == "first" && (
            <>
              {/* DigitizeApp Tabs Navigation */}
              {profile && (
                <TabNavigation
                  tabs={digitizeappTabs}
                  activeTab={activeDigitizeAppTab}
                  onTabPress={handleDigitizeAppTabPress}
                  filterByCategory="MyPosts"
                />
              )}

              {/* Conditional Content Based on Active Tab */}
              {activeDigitizeAppTab === "ItemPost" ? (
                // Use new wardrobe items endpoint for Items tab
                <ProfileWardrobeItemsList 
                  itemDetailRoute="/ItemDetails"
                />
              ) : activeDigitizeAppTab === "OutfitPost" ? (
                // Use new wardrobe outfits endpoint for Outfits tab
                <ProfileWardrobeOutfitsList 
                  outfitDetailRoute="/OutfitDetails"
                />
              ) : (
                // Use StoryLine for Posts tab
                <StoryLine 
                  {...storyLineProps}
                  // Legacy props for backward compatibility (will be overridden by apiConfig)
                  filterByCategory={"MyPosts"}
                  // Hide StoryLine's tabs since we're managing them at parent level
                  hideTabNavigation={true}
                />
              )}
            </>
          )}

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              {/* <BlurView
              intensity={50}
              blurReductionFactor={10}
              experimentalBlurMethod={"none"}
              style={styles.modalOverlay}
            > */}
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: userDashboard?.trifterProfileImageUrl }}
                  style={styles.profileModalImage}
                />
                {/* <ProfileImage1
                  height={300}
                  width={300}
                  style={styles.modalImage}
                /> */}
              </View>
              {/* </BlurView> */}
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
        {showOptionModal && (
          <ProfileOptionModal
            isShow={showOptionModal ? true : false}
            onClose={() => setIsShowOptionModal(null)}
            handleSelect={handleSelectedOption}
            itemDetails={itemDetails}
            refetch={getInitItems}
          />
        )}
        {deleteItemId && (
          <DeleteListItemModal
            deleteDetail={deleteItemId}
            onClose={() => {
              setDeleteItemId(null);
            }}
            isShow
            refetch={getInitItems}
          />
        )}
      </View>
    </AppTabWrapper>
  );
};

export default ProfileMain;

const styles = StyleSheet.create({
  profileContainer: {
    paddingVertical: 15,
    borderRadius: 5,
    // paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    flex: 1,
  },
  countContainer: {
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#F6F7F7",
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
  },
  followerCountContainer: {
    backgroundColor: "#FFF7F8",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
  },
  initials: {
    width: 70,
    height: 70,
    borderRadius: 100,
    backgroundColor: "silver",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 18,
    fontFamily: "DMSansBold",
  },
  profileModalImage: {
    width: 300,
    height: 300,
    borderRadius: 300,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 10,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  userName: {
    fontSize: fontSz(20),
    fontFamily: "DMSansMedium",
    color: "#393939",
    textTransform: "capitalize",
  },
  userDetails: {
    fontSize: fontSz(16),
    color: "#393939",
    textAlign: "left",
    paddingVertical: 10,
    fontFamily: "DMSansMedium",
  },
  userLocation: {
    fontSize: fontSz(16),
    color: "#393939",
    textAlign: "left",
    fontFamily: "DMSansBold",
    textTransform: "capitalize",
  },
  userLastSeen: {
    fontSize: fontSz(16),
    color: "#888888",
    textAlign: "left",
    marginLeft: 5,
  },
  text: {
    fontFamily: "DMSansBold",
    fontSize: 10,
  },
  textcontent: {
    fontFamily: "DMSansMedium",
    fontSize: 10,
    textTransform: "capitalize",
  },
  scrollTabContainer: {
    marginTop: 10,
    marginBottom: 10,
    // paddingHorizontal: 10,
    maxHeight: 40,
  },
  scrollTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "#EDF2F7",
    marginRight: 10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollTabFocused: {
    backgroundColor: "#FF5C68",
    borderWidth: 1.5,
    borderColor: "#FF3B4A",
  },
  scrollTabTextFocused: {
    color: "white",
  },
  scrollTabText: {
    color: "#1E3448",
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  modalImage: {
    resizeMode: "contain",
    borderRadius: 150,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
  listIcon: {
    position: "absolute",
    zIndex: 4,
    width: 20,
    height: 20,
    borderRadius: "100%",
    backgroundColor: "white",
    right: 10,
    top: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      ios: {
        shadowColor: "#440621",
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 3.44,
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 3.44 * 1.5,
      },
    }),
  },
  scrollTabActive: {
    backgroundColor: "#FF5C68",
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
  scrollTabTextActive: {
    fontSize: 10,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  activeStatus: {
    backgroundColor: "#E7FDEB",
  },
  soldStatus: {
    backgroundColor: "#E9EAEB",
  },
  hiddenStatus: {
    backgroundColor: "#FDEDE7",
  },
  rejectedStatus: {
    backgroundColor: "#FDEDE7",
  },
  pendingStatus: {
    backgroundColor: "#E9EAEB",
  },
  activeTextStatus: {
    color: "#0AA221",
  },
  soldTextStatus: {
    color: "#6B727E",
  },
  hiddenTextStatus: {
    color: "#CD4213",
  },
  rejectedTextStatus: {
    color: "#CD4213",
  },
  pendingTextStatus: {
    color: "#6B727E",
  },
});
