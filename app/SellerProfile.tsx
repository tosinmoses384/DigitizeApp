import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import FilterIcon from "../assets/images/svg/Icons/Basic/Filter.svg";
import { Colors } from "../constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import RecommendedCard from "@components/RecommendedCard";
import TrifterCard from "@components/TrifterCard";
import EmptyState from "@components/EmptyState";
import EmptyReviewIcon from "../assets/images/svg/no-review-icon.svg";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import { StoryLineApiConfig } from "@components/StoryLine";
import { useSellerProfile } from "@hooks/use-seller-profile";
import { useSellerItems } from "@hooks/use-seller-items";
import { useSellerReviews } from "@hooks/use-seller-reviews";
import { useSellerPosts } from "@hooks/use-seller-posts";
import { useFilteredItems } from "@hooks/use-filtered-items";
import SellerProfileHeader from "@components/profile/SellerProfileHeader";
import { CollapsibleRef } from "react-native-collapsible-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import SellerProfileStackHeader from "@components/profile/SellerProfileStackHeader";
import SellerProfileStoryLine from "@components/profile/SellerProfileStoryLine";
import SellerProfileToggleTabs from "@components/profile/SellerProfileToggleTabs";
import TabNavigation, { Tab } from "@components/StoryLine/TabNavigation";
import SellerProfileResponsiveGrid from "@components/SellerProfileResponsiveGrid";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import ProductFilterModal from "../modals/ProductFilterModal";
import { useI18n } from "@hooks/use-i18n";


const { width } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 500;
const HEADER_MIN_HEIGHT = 220;

const SellerProfile = () => {
  const { t } = useI18n();
  const toast = useToast();
  const windowDimensions = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const tabsRef = useRef<CollapsibleRef>(null);
  const [profileHeaderHeight, setProfileHeaderHeight] = useState(0);
  const [tabMinHeaderHeight, setTabMinHeaderHeight] = useState(0);
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);
  const { fromDeepLink } = useLocalSearchParams<{ fromDeepLink?: string }>();
  const [selectedTab, setSelectedTab] = useState("first");
  const [scrollTab, setScrollTab] = useState("All");
  const { profile, token } = useAppSelector((state) => state.userProfileSlice);
  const { countryId } = useAppSelector((state) => state.userCountryId);

  const [activeTab, setActiveTab] = React.useState("");
  
  const scrollYTabs = useRef({
    first: useSharedValue(0),
    second: useSharedValue(0),
    third: useSharedValue(0),
  });
  
  // Add scroll state tracking to prevent animations during scroll release
  const isScrolling = useSharedValue(false);
  const lastScrollY = useSharedValue(0);
  const [filterByType, setFilterByType] = useState("");
  const [filterByCategory, setFilterByCategory] = useState(null);

  const tabs: Tab[] = useMemo(
    () => [
      { id: "", title: t('marketplace.posts') },
      { id: "ItemPost", title: t('marketplace.items') },
      { id: "OutfitPost", title: t('marketplace.outfits') },
    ],
    [t],
  );

  const handleScrollFirst = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      if (selectedTab === 'first') {
        scrollYTabs.current.first.value = event.contentOffset.y;
      }
    },
  });

  const handleScrollSecond = useAnimatedScrollHandler({
    onBeginDrag: () => {
      'worklet';
      isScrolling.value = true;
    },
    onScroll: (event) => {
      'worklet';
      if (selectedTab === 'second' && isScrolling.value) {
        const scrollY = event.contentOffset.y;
        // Only update if the change is significant (more than 1 pixel)
        if (Math.abs(scrollY - lastScrollY.value) > 1) {
          scrollYTabs.current.second.value = scrollY;
          lastScrollY.value = scrollY;
        }
      }
    },
    onMomentumEnd: () => {
      'worklet';
      isScrolling.value = false;
    },
  });

  const handleScrollThird = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      if (selectedTab === 'third') {
        scrollYTabs.current.third.value = event.contentOffset.y;
      }
    },
  });

  const headerMaxHeight = useMemo(
    () => (selectedTabIndex < 2 ? 500 : 440),
    [selectedTabIndex],
  );

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const currentScrollY = scrollYTabs.current[selectedTab as 'first' | 'second' | 'third'];
    
    // Use withSpring for smoother transitions
    const targetHeight = interpolate(
      currentScrollY?.value || 0,
      [0, headerMaxHeight - HEADER_MIN_HEIGHT],
      [headerMaxHeight, HEADER_MIN_HEIGHT],
      "clamp",
    );
    
    // Apply spring animation when not actively scrolling
    const height = isScrolling.value
      ? targetHeight
      : withSpring(targetHeight, {
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        });

    return { 
      height,
      overflow: 'hidden', // Prevent content overflow during animations
    };
  }, [selectedTab, headerMaxHeight]);

  const isFromDeepLink = fromDeepLink === "true";

  useEffect(() => {
    if (isFromDeepLink) {
      navigation.setOptions({ gestureEnabled: false });
    } else {
      navigation.setOptions({ gestureEnabled: true });
    }
  }, [isFromDeepLink, navigation]);

  const { 
    sellerId,
    categoryValue,
    sizeValue,
    brandValue,
    conditionValue,
    colourValue,
    materialValue,
  } = useAppSelector((state) => state.productFilter);

  const [cardWidth, setCardWidth] = useState(172);
  const [isShowFilterModal, setIsShowFilterModal] = useState(false);

  const listRefs = useRef({
    first: null as any,
    second: null as any,
    third: null as any,
  });
  const [scrollMetrics, setScrollMetrics] = useState({
    contentHeight: 0,
    layoutHeight: 0,
    scrollY: 0,
  });
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [dynamicFilterByType, setDynamicFilterByType] = useState("ItemPost");

  const [storyLineApiConfig, setStoryLineApiConfig] =
    useState<StoryLineApiConfig>({
      context: "profile",
      filterByCategory: "TimelinePosts",
      sellerId: sellerId,
      customFilters: { sellerSpecific: true, profileView: true },
    });

  const hasFilters = !!(
    categoryValue ||
    sizeValue ||
    brandValue ||
    conditionValue ||
    colourValue ||
    materialValue
  );

  const sellerProfile = useSellerProfile({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: !!sellerId,
    refetchOnFocus: false,
  });

  const sellerItems = useSellerItems({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: selectedTabIndex === 1 && !hasFilters,
    refetchOnFocus: selectedTabIndex === 1,
  });

  const filteredItems = useFilteredItems({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    categoryId: categoryValue?.id || '',
    sizeIds: sizeValue?.id ? [sizeValue.id] : [],
    brandIds: brandValue?.id ? [brandValue.id] : [],
    conditionIds: conditionValue?.id ? [conditionValue.id] : [],
    colourIds: colourValue?.id ? [colourValue.id] : [],
    materialIds: materialValue?.id ? [materialValue.id] : [],
    enabled: selectedTabIndex === 1 && hasFilters,
  });

  const sellerReviews = useSellerReviews({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    enabled: selectedTabIndex === 2,
    refetchOnFocus: selectedTabIndex === 2,
  });

  const sellerPosts = useSellerPosts({
    sellerId,
    token: token || "",
    countryId: countryId || profile?.countryId || "",
    filterByType: dynamicFilterByType,
    filterByCategory: "TimelinePosts",
    enabled: selectedTabIndex === 0,
    refetchOnFocus: selectedTabIndex === 0,
  });

  useEffect(() => {
    if (selectedTabIndex === 0 && dynamicFilterByType) {
      sellerPosts.refetch();
    }
  }, [dynamicFilterByType, selectedTabIndex]);

  const handleTabSelect = useCallback((tab: string) => {
    setSelectedTab(tab);
    setScrollTab("All");
    // Reset scroll state when switching tabs
    isScrolling.value = false;
    lastScrollY.value = 0;
  }, [isScrolling, lastScrollY]);

  const getApiConfig = useCallback(
    (activeTab: string, context: string = "profile"): StoryLineApiConfig => {
      const baseConfig: StoryLineApiConfig = {
        activeTab,
        context: context as "home" | "profile" | "category" | "search",
        filterByCategory: "TimelinePosts",
        sellerId: sellerId,
        customFilters: {
          sellerSpecific: true,
          profileView: true,
          priority: "high",
        },
      };

      switch (activeTab) {
        case "ItemPost":
          return {
            ...baseConfig,
            filterByType: "ItemPost",
            customFilters: {
              ...baseConfig.customFilters,
              itemSpecific: true,
              sellerItems: true,
            },
          };
        case "OutfitPost":
          return {
            ...baseConfig,
            filterByType: "OutfitPost",
            customFilters: {
              ...baseConfig.customFilters,
              outfitSpecific: true,
              sellerOutfits: true,
            },
          };
        default:
          return {
            ...baseConfig,
            filterByCategory: "TimelinePosts",
            customFilters: {
              ...baseConfig.customFilters,
              general: true,
              sellerContent: true,
            },
          };
      }
    },
    [sellerId],
  );

  const handleActiveTabChange = useCallback(
    (activeTab: string, suggestedFilterByType: string) => {
      setDynamicFilterByType(suggestedFilterByType);
      const newApiConfig = getApiConfig(activeTab, "profile");
      setStoryLineApiConfig(newApiConfig);
    },
    [getApiConfig],
  );

  const handleTabPress = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);

      let suggestedFilterByType = "";

      switch (tabId) {
        case "ItemPost":
          suggestedFilterByType = "ItemPost";
          break;
        case "OutfitPost":
          suggestedFilterByType = "OutfitPost";
          break;
        default:
          suggestedFilterByType = filterByType || "";
          break;
      }

      handleActiveTabChange(tabId, suggestedFilterByType);
    },
    [handleActiveTabChange, filterByType],
  );

  const storyLineProps = useMemo(
    () => ({
      hideHorizontalStory: true,
      hidePostDropdownAction: true,
      onActiveTabChange: handleActiveTabChange,
      apiConfig: storyLineApiConfig,
      parameterSource: "parent" as const,
      onApiConfigChange: setStoryLineApiConfig,
      parentScrollMetrics: scrollMetrics,
    }),
    [handleActiveTabChange, storyLineApiConfig, scrollMetrics],
  );

  const handleScrollTabSelect = (tab: string) => {
    setScrollTab(tab);
  };

  const scrollTabs = ["All", "Active", "Reserved", "Drafts", "Sold"];
  const scrollTabs2 = ["All", "Trifters", "Automatic"];

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    setScrollMetrics({
      contentHeight: 0,
      layoutHeight: 0,
      scrollY: 0,
    });
  }, [selectedTab]);

  const handleOnSelectTabIndex = useCallback((tabIndex: any) => {
    setSelectedTabIndex(tabIndex);
    tabsRef.current?.setIndex(tabIndex);
    
    const tabKeys: ('first' | 'second' | 'third')[] = ['first', 'second', 'third'];
    const newTabKey = tabKeys[tabIndex];
    if (newTabKey && scrollYTabs.current[newTabKey]) {
      // Use withSpring for smooth transition instead of instant reset
      scrollYTabs.current[newTabKey].value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, []);

  useEffect(() => {
    const initialConfig = getApiConfig("", "profile");
    setStoryLineApiConfig(initialConfig);
  }, [getApiConfig]);

  useEffect(() => {
    if (selectedTabIndex === 0 && scrollYTabs.current.first) {
      scrollYTabs.current.first.value = 0;
    }
  }, [activeTab, selectedTabIndex]);

  const updateItemState = useCallback((id: any) => {
    const currentItems = hasFilters ? filteredItems.data : sellerItems.data;
    const findExistingItem = currentItems?.find((item: any) => item?.id === id);
    
    if (findExistingItem) {
      if (hasFilters) {
        filteredItems.refetch();
      } else {
        sellerItems.refetch();
      }
    }
  }, [sellerItems, filteredItems, hasFilters]);

  const handleFilterApply = useCallback(async () => {
    setIsShowFilterModal(false);
    
    const activeFilters = [
      categoryValue && 'category',
      sizeValue && 'size', 
      brandValue && 'brand',
      conditionValue && 'condition',
      colourValue && 'color',
      materialValue && 'material'
    ].filter(Boolean);
    
    if (activeFilters.length > 0) {
      await filteredItems.refetch();
      toast.show(t('marketplace.appliedFilters', { count: activeFilters.length }), { 
        type: "success", 
        duration: 2000 
      });
    }
  }, [
    categoryValue, 
    sizeValue, 
    brandValue, 
    conditionValue, 
    colourValue, 
    materialValue,
    filteredItems,
    toast,
    t
  ]);


  const handleOnPressStackHeader = () => {
    if (isFromDeepLink) {
      router.replace("/home" as any);
    } else {
      router.back();
    }
  };

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

  const renderListHeaderComponent = () => {
    return (
      <Animated.View
        style={[styles.listHeader, {}, headerAnimatedStyle]}
        onLayout={(event: any) => {
          setProfileHeaderHeight(event.nativeEvent.layout.height);
        }}
      >
        <SellerProfileHeader
          onSelectTab={setSelectedTab}
          selectedTab={selectedTab}
          onSetActiveSubTab={(subTab) => {
            setActiveTab(subTab);
            handleActiveTabChange(subTab, subTab);
          }}
          onSelectTabIndex={handleOnSelectTabIndex}
        />

        <View
          onLayout={(event: any) => {
            setTabMinHeaderHeight(event.nativeEvent.layout.height);
          }}
        >
          <SellerProfileToggleTabs
            onSelectTabIndex={handleOnSelectTabIndex}
            selectedTab={handleTabSelect}
            selectedTabIndex={selectedTabIndex}
            currentTab={selectedTab}
            firstLabel={t('marketplace.digitizeapp')}
            secondLabel={t('marketplace.loved')}
            thirdLabel={t('marketplace.reviews')}
            small={false}
            containerStyle={{ marginBottom: 0 }}
          />

          {selectedTab === "second" && selectedTabIndex === 1 ? (
            <View
              style={[
                styles.filterContainer,
                {
                  backgroundColor: Colors.light.background,
                  paddingHorizontal: 10,
                  height: 60,
                },
              ]}
            >
              <View>
                {((hasFilters ? filteredItems.data?.length : sellerItems.data?.length) ?? 0) > 0 ? (
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Text>{(hasFilters ? filteredItems.data?.length : sellerItems.data?.length) ?? 0}</Text>
                    <Text>{t('marketplace.items')}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
              onPress={() => setIsShowFilterModal(true)}
              style={[
                styles.filterButton,
                hasFilters && styles.filterButtonActive,
              ]}>
              <FilterIcon />
            </TouchableOpacity>
            </View>
          ) : (
            0
          )}

          {selectedTab === "first" && profile ? (
            <View
              style={{
                backgroundColor: Colors.light.background,
                paddingHorizontal: 10,
                height: 60,
              }}
            >
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                onTabPress={handleTabPress}
                filterByCategory={filterByCategory!}
              />
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  };

  // Memoized card style to prevent unnecessary re-renders
  const cardStyle = useMemo(
    () => [styles.card, { width: cardWidth }],
    [cardWidth]
  );

  const renderLovedItem = useCallback(
    (item: any, index: number, itemWidth: number) => {
      return (
        <RecommendedCard
          imageSource={item?.defaultImageUrl}
          size={item?.size}
          title={item?.brandName || item?.title}
          price={item?.price}
          isServerImage
          itemId={item?.id}
          width={"100%"}
          isUserFavorite={item?.isUserFavorite}
          handleIsFavourite={updateItemState}
          count={item?.favouriteCount}
          currency={item?.currencySymbol}
        />
      );
    },
    [updateItemState],
  );

  const renderReviewItem = useCallback(
    (item: any, index: number, itemWidth: number) => {
      return (
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              backgroundColor: "brown",
            },
          ]}
          key={item?.id ?? `review-${index}`}
        >
          <TrifterCard
            key={`review-${index}`}
            name={item?.createdBy}
            imageUrl={item?.trifterImageUrl}
            location={item?.review}
            rating={item?.ratings}
          />
        </View>
      );
    },
    [],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
      }}
    >
      <SellerProfileStackHeader
        title={sellerProfile.data?.trifterName}
        onPress={handleOnPressStackHeader}
      />

      <>
        {renderListHeaderComponent()}

        {selectedTabIndex === 0 ? (
          <SellerProfileStoryLine
            {...storyLineProps}
            sellerId={sellerId}
            onScroll={handleScrollFirst as any}
            maxHeaderHeight={HEADER_MAX_HEIGHT * 0.8}
            onActiveTabChange={handleActiveTabChange}
            activeTab={activeTab}
          />
        ) : null}

        {selectedTabIndex === 1 ? (
          sellerItems.isLoading || filteredItems.isLoading ? (
            <View style={{ paddingHorizontal: 20 }}>
              <MyResponsiveGrid
                template={emptyTemplate}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            </View>
          ) : (
            <SellerProfileResponsiveGrid
              data={hasFilters ? filteredItems.data || [] : sellerItems.data || []}
              numColumns={
                windowDimensions.width >= 1200 ? 4 : width >= 768 ? 3 : 2
              }
              renderItem={renderLovedItem}
              keyExtractor={(item: any, index: number) => item?.id || `item-${index}`}
              ListEmptyComponent={() => (
                <EmptyState
                  title={hasFilters ? t('marketplace.noItemsMatchFilters') : t('marketplace.sellerNoItemsYet')}
                  subtitle={hasFilters ? t('marketplace.tryAdjustingFilters') : t('marketplace.sellerItemsWillAppear')}
                />
              )}
              maxHeaderHeight={HEADER_MAX_HEIGHT * 0.8}
              onScroll={handleScrollSecond as any}
              scrollEventThrottle={16}
              onEndReached={hasFilters ? undefined : () => {
                if (sellerItems.hasNextPage && !sellerItems.isFetchingNextPage) {
                  sellerItems.loadMoreData();
                }
              }}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={sellerItems.isRefetching && !sellerItems.isFetchingNextPage}
                  onRefresh={() => {
                    if (hasFilters) {
                      filteredItems.refetch();
                    } else {
                      sellerItems.refetch();
                    }
                  }}
                  tintColor="#FF5C68"
                  colors={["#FF5C68"]}
                />
              }
              ListFooterComponent={() => {
                if (!hasFilters && sellerItems.isFetchingNextPage) {
                  return (
                    <View style={[styles.reviewsListFooterWrapper]}>
                      <ActivityIndicator />
                    </View>
                  );
                }
              }}
            />
          )
        ) : null}

        {selectedTabIndex === 2 ? (
          sellerReviews.isLoading ? (
            <View style={{ paddingHorizontal: 20 }}>
              {getEmptyStateCountLoader(8)?.map((list, index) => {
                return (
                  <View
                    style={{
                      marginBottom: 8,
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
              })}
            </View>
          ) : (
            <SellerProfileResponsiveGrid
              data={sellerReviews.data || []}
              numColumns={
                windowDimensions.width >= 1200 ? 4 : width >= 768 ? 3 : 2
              }
              renderItem={renderReviewItem}
              keyExtractor={(item: any, index: number) => item?.id || item?.reviewId || `review-${index}`}
              ListEmptyComponent={() => (
                <EmptyState
                  icon={<EmptyReviewIcon />}
                  title={t('marketplace.noReviewsYet')}
                  subtitle={t('marketplace.reviewsWillAppearHere')}
                />
              )}
              maxHeaderHeight={HEADER_MAX_HEIGHT * 0.8}
              onScroll={handleScrollThird as any}
              scrollEventThrottle={16}
              onEndReached={() => {
                if (sellerReviews.hasNextPage && !sellerReviews.isFetchingNextPage) {
                  sellerReviews.loadMoreData();
                }
              }}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={sellerReviews.isRefetching && !sellerReviews.isFetchingNextPage}
                  onRefresh={() => sellerReviews.refetch()}
                  tintColor="#FF5C68"
                  colors={["#FF5C68"]}
                />
              }
              ListFooterComponent={() => {
                if (sellerReviews.isFetchingNextPage) {
                  return (
                    <View style={[styles.reviewsListFooterWrapper]}>
                      <ActivityIndicator />
                    </View>
                  );
                }
              }}
            />
          )
        ) : null}
      </>
      <ProductFilterModal
        isShow={isShowFilterModal}
        onClose={() => setIsShowFilterModal(false)}
        handleApply={handleFilterApply}
      />
    </View>
  );
};

export default SellerProfile;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginVertical: 6,
    paddingHorizontal: 16,
    height: 50,
  },
  scrollTab: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "white",
    marginRight: 10,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
  listHeader: {
    // paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  listSmallHeader: {},
  reviewsListFooterWrapper: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#FF3B4A',
  },
});
