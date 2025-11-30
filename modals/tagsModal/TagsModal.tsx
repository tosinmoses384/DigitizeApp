import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import CloseIcon from "../../assets/images/svg/x-close.svg";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { useAppSelector } from "@redux/store";
import { formatAmount } from "@helper/formatCash";
import { router } from "expo-router";
import LineLoader from "@components/LineLoader";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import SellerProfileToggleTabs from "@components/profile/SellerProfileToggleTabs";
import { useI18n } from "../../hooks/use-i18n";

interface ITagsModal {
  isShow: boolean;
  onClose: () => void;
  contentId: string;
  contentType?: 'post' | 'story';
  onFinishStory?: () => void;
  userId?: string; // Pass userId from parent post/story
  userImageUrl?: string; // Pass userImageUrl from parent post/story
  username?: string; // Pass username from parent post/story
}

interface PostTag {
  id: string;
  name: string;
  imageUrl: string;
  amount: number | null;
  currencySymbol: string | null;
  type: "LovedTag" | "ItemTag" | "OutfitTag";
  countryId: string | null;
}

interface Recommendation {
  itemId: string;
  itemImageUrl: string;
  itemAmount: number;
  currencySymbol: string;
}

interface PostDetails {
  id: string;
  defaultImageUrl: string;
  caption: string;
  postedBy: string;
  posterUserId?: string;
  posterUsername?: string;
  posterUserImageUrl?: string;
  type: string;
  likesCount: number;
  commentCount: number;
  tags: PostTag[];
  recommendations: Recommendation[];
  createdOn: string;
}

type TabType = "first" | "second" | "third";

const TagsModal = ({ 
  isShow, 
  onClose, 
  contentId, 
  contentType = 'post',
  onFinishStory,
  userId: propUserId,
  userImageUrl: propUserImageUrl,
  username: propUsername
}: ITagsModal) => {
  const { t } = useI18n();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [postDetails, setPostDetails] = useState<PostDetails | null>(null);
  const [tagLoader, setTagLoader] = useState(true);
  const [cardWidth, setCardWidth] = useState(172);
  const [selectedTab, setSelectedTab] = useState<TabType>("first");

  const getContentItem = useCallback(() => {
    if (!contentId || !token) return;
    
    setTagLoader(true);
    setPostDetails(null);
    
    const fetchService = contentType === 'story' 
      ? timelineServices.getStoryByIdQuery(token, contentId)
      : timelineServices.getPostByIdQuery(token, contentId);
    fetchService
      .then((res: any) => {
        setTagLoader(false);
        setPostDetails(res?.data);
      })
      .catch((error) => {
        setTagLoader(false);
      });
  }, [token, contentId, contentType]);

  useEffect(() => {
    if (isShow && contentId) {
      getContentItem();
    }
  }, [isShow, contentId, getContentItem]);

  useEffect(() => {
    if (!isShow) {
      setTagLoader(true);
      setPostDetails(null);
      setSelectedTab("first");
    }
  }, [isShow]);

  const lovedItems = useMemo(
    () => postDetails?.tags?.filter((tag) => tag.type === "LovedTag") || [],
    [postDetails?.tags]
  );

  const forSaleItems = useMemo(
    () => postDetails?.tags?.filter((tag) => tag.type === "ItemTag") || [],
    [postDetails?.tags]
  );

  const outfits = useMemo(
    () => postDetails?.tags?.filter((tag) => tag.type === "OutfitTag") || [],
    [postDetails?.tags]
  );

  const availableTabs = useMemo(() => {
    if (tagLoader) {
      return [
        { originalId: "loved", label: t('wardrobe.loved'), hasData: true, id: "first" as TabType },
        { originalId: "items", label: t('wardrobe.items'), hasData: true, id: "second" as TabType },
        { originalId: "outfits", label: t('wardrobe.outfits'), hasData: true, id: "third" as TabType },
      ];
    }

    const allTabs: { originalId: string; label: string; hasData: boolean }[] = [
      { originalId: "loved", label: t('wardrobe.loved'), hasData: lovedItems.length > 0 },
      { originalId: "items", label: t('wardrobe.items'), hasData: forSaleItems.length > 0 },
      { originalId: "outfits", label: t('wardrobe.outfits'), hasData: outfits.length > 0 },
    ];
    const filteredTabs = allTabs.filter((tab) => tab.hasData);
    
    const tabIds: TabType[] = ["first", "second", "third"];
    return filteredTabs.map((tab, index) => ({
      ...tab,
      id: tabIds[index],
    }));
  }, [lovedItems.length, forSaleItems.length, outfits.length, tagLoader, t]);

  const tabIdToOriginalId = useMemo(() => {
    const mapping: Record<TabType, string> = {} as Record<TabType, string>;
    availableTabs.forEach((tab) => {
      mapping[tab.id] = tab.originalId;
    });
    return mapping;
  }, [availableTabs]);

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.id === selectedTab)) {
      setSelectedTab(availableTabs[0].id);
    }
  }, [availableTabs, selectedTab]);

  const recommendations = postDetails?.recommendations || [];

  const handleCardWidthUpdate = useCallback((width: number) => {
    setCardWidth(width);
  }, []);

  const handleItemPress = useCallback((item: PostTag) => {
    if (item.type === "ItemTag" || item.type === "LovedTag") {
      // Comprehensive username resolution: prioritize props, then postDetails, then API response fields

      const username = 
        propUsername || // First priority: prop from parent
        postDetails?.posterUsername || 
        postDetails?.postedBy ||
        (postDetails as any)?.username || // Check if username exists directly
        (postDetails as any)?.sellerUsername ||
        (postDetails as any)?.userDisplayName ||
        (postDetails as any)?.sellerName ||
        (postDetails as any)?.sellerInfo?.name || // Check nested sellerInfo
        'User'; // Final fallback
      
      const userId = propUserId || postDetails?.posterUserId || (postDetails as any)?.userId;
      const userImageUrl = propUserImageUrl || postDetails?.posterUserImageUrl || postDetails?.defaultImageUrl;

      const itemData = {
        id: item.id,
        brand: item.name,
        brandName: item.name,
        defaultImageUrl: item.imageUrl,
        amount: item.amount,
        price: item.amount,
        currencySymbol: item.currencySymbol,
        type: item.type,
        countryId: item.countryId,
        username: username,
        userId: userId,
        sellerId: userId,
        userImageUrl: userImageUrl,
        sellerUsername: username,
      };

      router.push({
        pathname: '/ItemDetails',
        params: {
          itemId: item.id,
          itemData: JSON.stringify(itemData),
          username: username, 
          userId: userId,
        },
      });
      
      if (contentType === 'story' && onFinishStory) {
        onFinishStory();
      }
      onClose();
    } 
    else if (item.type === "OutfitTag") {
      // Comprehensive username resolution for outfits
      const username = 
        propUsername || // First priority: prop from parent
        postDetails?.posterUsername || 
        postDetails?.postedBy ||
        (postDetails as any)?.username ||
        (postDetails as any)?.sellerUsername ||
        (postDetails as any)?.userDisplayName ||
        (postDetails as any)?.sellerName ||
        (postDetails as any)?.sellerInfo?.name ||
        'User';
      
      const userId = propUserId || postDetails?.posterUserId || (postDetails as any)?.userId;
      const userImageUrl = propUserImageUrl || postDetails?.posterUserImageUrl || postDetails?.defaultImageUrl;

      const outfitData = {
        id: item.id,
        title: item.name,
        name: item.name,
        defaultImageUrl: item.imageUrl,
        imageUrl: item.imageUrl,
        type: item.type,
        username: username,
        userId: userId,
        sellerId: userId,
        userImageUrl: userImageUrl,
        posterUsername: username,
      };

      router.push({
        pathname: '/OutfitDetails',
        params: {
          outfitId: item.id,
          outfitData: JSON.stringify(outfitData),
          username: username,
          userId: userId,
        },
      });
      
      if (contentType === 'story' && onFinishStory) {
        onFinishStory();
      }
      onClose();
    }
  }, [postDetails, onClose, contentType, onFinishStory, propUserId, propUserImageUrl, propUsername]);

  const renderRecommendationCard = useCallback(
    (card: Recommendation, index: number) => (
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.5 }]}
        onPress={() => {
          // Recommendations go to marketplace item details (dynamic route)
          router.push(`/ItemDetails/${card?.itemId}`);
          
          if (contentType === 'story' && onFinishStory) {
            onFinishStory();
          }
          onClose();
        }}
        key={index}
        accessibilityRole="button"
        accessibilityLabel={t('wardrobe.viewRecommendedItem')}
      >
        <View style={[styles.card, { width: cardWidth }]}>
          <View style={styles.innerImageCard}>
            <Image
              source={{ uri: card?.itemImageUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          </View>
        </View>
      </Pressable>
    ),
    [cardWidth, onClose, contentType, onFinishStory, t]
  );

  const recommendationsTemplate = useMemo(
    () => recommendations?.map(renderRecommendationCard),
    [recommendations, renderRecommendationCard]
  );

  const renderItemCard = useCallback(
    (item: PostTag) => (
      <View key={item.id} style={styles.topCardBody}>
        <View style={styles.topCardImageView}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.topCardImage}
              resizeMode="cover"
              fadeDuration={0}
            />
          )}
        </View>
        <View style={styles.topCardCenterView}>
          <Text style={styles.topCardTitle}>{item.name || 'N/A'}</Text>
          {item.amount !== null && item.amount !== undefined && (
            <Text style={styles.topCardAmount}>
              {formatAmount(item.amount, item.currencySymbol || '')}
            </Text>
          )}
        </View>
        <View>
          <CustomButton
            title={t('wardrobe.viewItem')}
            textStyle={styles.topCardBtnText}
            buttonStyle={styles.topCardBtn}
            onPress={() => handleItemPress(item)}
          />
        </View>
    </View>
  ), [handleItemPress, t]);

  const renderItemCardWithoutPrice = useCallback((item: PostTag) => (
    <View key={item.id} style={styles.topCardBody}>
      <View style={styles.topCardImageView}>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.topCardImage}
            resizeMode="cover"
            fadeDuration={0}
          />
        )}
      </View>
      <View style={styles.topCardCenterView}>
        <Text style={styles.topCardTitle}>
          {item.name || "N/A"}
        </Text>
      </View>
      <View>
        <CustomButton
          title={t('wardrobe.viewItem')}
          textStyle={styles.topCardBtnText}
          buttonStyle={styles.topCardBtn}
          onPress={() => handleItemPress(item)}
        />
      </View>
    </View>
  ), [handleItemPress, t]);

  const renderOutfitCard = useCallback((outfit: PostTag) => (
    <View key={outfit.id} style={styles.outfitCardBody}>
      <View style={styles.outfitImageView}>
        {outfit.imageUrl && (
          <Image
            source={{ uri: outfit.imageUrl }}
            style={styles.outfitImage}
            resizeMode="cover"
            fadeDuration={0}
          />
        )}
      </View>
      <View style={styles.outfitCenterView}>
        <Text style={styles.topCardTitle}>
          {outfit.name || "N/A"}
        </Text>
        <Text style={styles.outfitItemCount}>0</Text>
      </View>
      <View>
        <CustomButton
          title={t('wardrobe.viewOutfit')}
          textStyle={styles.topCardBtnText}
          buttonStyle={styles.topCardBtn}
          onPress={() => handleItemPress(outfit)}
        />
      </View>
    </View>
  ), [handleItemPress, t]);

  const renderLovedItems = useMemo(() => {
    if (tagLoader) {
      return (
        <View style={styles.loaderContainer}>
          <LineLoader />
        </View>
      );
    }

    if (lovedItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('wardrobe.noLovedItemsTagged')}</Text>
        </View>
      );
    }
    return (
      <>
        <View style={styles.topCardView}>
          {lovedItems.map(renderItemCard)}
        </View>

        {recommendations.length > 0 && (
          <>
            <Text style={styles.bottomTitle}>{t('wardrobe.otherLovedItemsByThisDrber')}</Text>
            <MyResponsiveGrid
              template={recommendationsTemplate}
              getNumberOfRows={handleCardWidthUpdate}
              subtractFromMargin={27}
            />
          </>
        )}
      </>
    );
  }, [tagLoader, lovedItems, recommendations.length, recommendationsTemplate, handleCardWidthUpdate, renderItemCard, t]);

  const renderForSaleItems = useMemo(() => {
    if (tagLoader) {
      return (
        <View style={styles.loaderContainer}>
          <LineLoader />
        </View>
      );
    }

    if (forSaleItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('wardrobe.noItemsTagged')}</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.topCardView}>
          {forSaleItems.map(renderItemCardWithoutPrice)}
        </View>

        {recommendations.length > 0 && (
          <>
            <Text style={styles.bottomTitle}>{t('wardrobe.otherItemsInWardrobe')}</Text>
            <MyResponsiveGrid
              template={recommendationsTemplate}
              getNumberOfRows={handleCardWidthUpdate}
              subtractFromMargin={27}
            />
          </>
        )}
      </>
    );
  }, [tagLoader, forSaleItems, recommendations.length, recommendationsTemplate, handleCardWidthUpdate, renderItemCardWithoutPrice, t]);

  const renderOutfits = useMemo(() => {
    if (tagLoader) {
      return (
        <View style={styles.loaderContainer}>
          <LineLoader />
        </View>
      );
    }

    if (outfits.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('wardrobe.noOutfitsTagged')}</Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.topCardView}>
          {outfits.map(renderOutfitCard)}
        </View>

        {recommendations.length > 0 && (
          <>
            <Text style={styles.bottomTitle}>{t('wardrobe.otherOutfitsInWardrobe')}</Text>
            <MyResponsiveGrid
              template={recommendationsTemplate}
              getNumberOfRows={handleCardWidthUpdate}
              subtractFromMargin={27}
            />
          </>
        )}
      </>
    );
  }, [tagLoader, outfits, recommendations.length, recommendationsTemplate, handleCardWidthUpdate, renderOutfitCard, t]);

  const renderTabContent = useMemo(() => {
    const originalId = tabIdToOriginalId[selectedTab];
    
    switch (originalId) {
      case "loved":
        return renderLovedItems;
      case "items":
        return renderForSaleItems;
      case "outfits":
        return renderOutfits;
      default:
        return availableTabs.length > 0 ? renderLovedItems : null;
    }
  }, [selectedTab, tabIdToOriginalId, renderLovedItems, renderForSaleItems, renderOutfits, availableTabs.length]);

  const handleTabChange = useCallback((tab: TabType) => {
    setSelectedTab(tab);
  }, []);

  const getTabLabels = useMemo(() => {
    const labels: { first?: string; second?: string; third?: string } = {};
    availableTabs.forEach((tab) => {
      if (tab.id === "first") labels.first = tab.label;
      if (tab.id === "second") labels.second = tab.label;
      if (tab.id === "third") labels.third = tab.label;
    });
    return labels;
  }, [availableTabs]);

  const tabLabels = getTabLabels;

  return (
    <NewBottomModal isShow={isShow} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('wardrobe.inThisPhoto')}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.headerCloseIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('wardrobe.closeModal')}
          >
            <CloseIcon />
          </Pressable>
        </View>

        {!tagLoader && availableTabs.length > 1 && (
          <View style={styles.tabContainer}>
            <SellerProfileToggleTabs
              selectedTab={handleTabChange}
              selectedTabIndex={availableTabs.findIndex((tab) => tab.id === selectedTab)}
              currentTab={selectedTab}
              firstLabel={tabLabels.first}
              secondLabel={tabLabels.second}
              thirdLabel={tabLabels.third}
              onSelectTabIndex={(index) => {
                setSelectedTab(availableTabs[index].id);
              }}
              containerStyle={styles.toggleContainer}
            />
          </View>
        )}

        <ScrollView
          style={styles.innerBody}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent}
        </ScrollView>
      </View>
    </NewBottomModal>
  );
};

const TagsModalMemo = memo(TagsModal, (prevProps, nextProps) => {
  return (
    prevProps.isShow === nextProps.isShow &&
    prevProps.contentId === nextProps.contentId &&
    prevProps.contentType === nextProps.contentType
  );
});

TagsModalMemo.displayName = "TagsModal";

export default TagsModalMemo;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
  },
  header: {
    padding: 12,
    backgroundColor: "white",
    position: "relative",
  },
  headerCloseIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansMedium",
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "white",
  },
  toggleContainer: {
    marginVertical: 0,
  },
  innerBody: {
    paddingVertical: 16,
  },
  topCardBody: {
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    marginBottom: 16,
  },
  topCardImageView: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: "silver",
    marginRight: 8,
  },
  topCardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  topCardCenterView: {
    flex: 1,
    justifyContent: "center",
  },
  topCardTitle: {
    fontSize: 14,
    color: "#212C3D",
    marginBottom: 4,
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  topCardAmount: {
    fontSize: 12,
    color: "#D4313E",
    fontFamily: "DMSansSemiBold",
  },
  topCardBtnText: {
    color: "white",
    fontFamily: "DMSansMedium",
    fontSize: 14,
  },
  topCardBtn: {
    backgroundColor: "#FF3B4A",
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 8,
  },
  topCardView: {
    marginBottom: 16,
  },
  outfitCardBody: {
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    marginBottom: 16,
  },
  outfitImageView: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: "silver",
    marginRight: 8,
  },
  outfitImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  outfitCenterView: {
    flex: 1,
    justifyContent: "center",
  },
  outfitItemCount: {
    fontSize: 12,
    color: "#353535",
    fontFamily: "DMSansRegular",
  },
  bottomTitle: {
    fontSize: 14,
    color: "#353535",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
  innerImageCard: {
    width: "100%",
    height: 178,
    borderRadius: 8,
  },
  itemAmount: {
    fontSize: 12,
    color: "#353535",
    fontFamily: "DMSansMedium",
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#71879C",
    fontFamily: "DMSansRegular",
    textAlign: "center",
  },
  loaderContainer: {
    marginBottom: 8,
    height: 70,
  },
});
