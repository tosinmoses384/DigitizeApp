import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { useAppDispatch, useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import MemberAndSimilarItems from "@components/MemberAndSimilarItems";
import ItemDetailsTop from "@components/ItemDetailsTop";
import { IListItemsRequest } from "@services/features/wardrobe-service/models";
import RecommendedCard from "@components/RecommendedCard";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import SkeletonLoader from "@components/Skeleton";
import EmptyState from "@components/EmptyState";
import {
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
import MakeItemOfferModal from "modals/MakeItemOfferModal";
import ImageViewer from "@components/ImageViewer";
import { useI18n } from "@hooks/use-i18n";

const HEADER_HEIGHT = 410;

const ItemDetails = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { itemId }: any = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const { countryId } = useAppSelector((state) => state?.userCountryId);
  const itemDetailsId = itemId;
  const [itemDetails, setItemDetails]: any = useState(null);
  const [relatedProducts, setRelatedProducts]: any = useState([]);
  const [screenLoader, setScreenLoader] = useState(true);
  const [isfollowing, setIsFollowing] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [memberItems, setMemberItems]: any = useState([]);
  const [cardWidth, setCardWidth] = useState(172);
  const [loading, setLoading] = useState(false);
  const [isActiveTab, setIsActiveTab] = useState(1);
  const [pageLoader, setPageLoader] = useState(true);
  const [pageTokeMember, setMemberPageToken] = useState("");
  const [numColumns, setNumColumns] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);
  const [makeOfferLoader, setMakeOfferLoader] = useState(false);
  const [showItemOfferModal, setShowItemOfferModal] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const tabs = [
    {
      id: 1,
      title: t('marketplace.membersItems'),
    },
    {
      id: 2,
      title: t('marketplace.similarItems'),
    },
  ];

  const fetchItems = () => {
    setScreenLoader(true);
    marketplaceServices
      ?.getItemDetails(token, countryId || profile?.countryId, itemDetailsId)
      .then((res: any) => {
        setScreenLoader(false);

        setItemDetails(res?.data);
        const distructure = res?.data?.relatedItems?.payload?.map(
          (list: any) => {
            return {
              id: list?.id,
              brand: `${list?.brandName}`,
              size: list?.size,
              amount: list?.price,
              image: list?.defaultImageUrl,

              ...list,
            };
          }
        );

        setRelatedProducts(distructure);

        setIsFollowing(res?.data?.isFollowingSeller);
        setPageToken(res?.data?.relatedItems?.metadata?.pageToken || "");

        if (res?.responseCode === 401) {
          return router.push("/");
        }
      })
      .catch((error) => {
        setScreenLoader(false);
      });
  };

  useEffect(() => {
    if ((countryId || profile?.countryId) && itemDetailsId) {
      fetchItems();
      // getRelatedItems();
    }
  }, [itemDetailsId, countryId, profile]);

  const getMoreRelatedItems = () => {
    if (pageToken) {
      setLoadingMore(true);

      marketplaceServices
        ?.getRelatedItems(
          profile?.token,
          countryId,
          itemDetailsId,
          "12",
          pageToken
        )
        .then((res: any) => {
          setLoadingMore(false);
          // if (res?.data?.pageToken && res?.data?.hasNextPage) {
          const distructure =
            res?.data?.dataset?.map((list: any) => {
              return {
                id: list?.id,
                brand: `${list?.brandName}`,
                size: list?.size,
                amount: list?.price,
                image: list?.defaultImageUrl,

                ...list,
              };
            }) || [];

          setRelatedProducts((prev: any) => [
            ...relatedProducts,
            ...distructure,
          ]);
          // distructure?.map((list: any) => {
          //   setRelatedProducts((prev: any) => [...prev, list]);
          // });
          // }
          // if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
          // }
          // if (res?.responseCode === 401) {
          //   return push("/");
          // }
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  useEffect(() => {
    setMemberPageToken("");
    // setMemberItems([]);
    if (itemDetails?.itemSellerId && isActiveTab === 1) {
      const handler = setTimeout(() => {
        setPageLoader(true);
        let data: IListItemsRequest = {
          token: token || "",
          pageQuery: "",
          pageSize: "12",
          pageToken: "",
        };

        const itemsServices = marketplaceServices.userlistItemsQuery(
          countryId || profile?.countryId,
          itemDetails?.itemSellerId,
          data
        );

        itemsServices
          .then((res: any) => {
            setPageLoader(false);

            const distructure = res?.data?.dataset?.map((list: any) => {
              return {
                id: list?.id,
                brand: `${list?.brandName}`,
                size: list?.size,
                amount: list?.price,
                image: list?.defaultImageUrl,

                ...list,
              };
            });

            setMemberItems(distructure);
            setMemberPageToken(res?.data?.pageToken);
          })
          .catch((error) => {
            setPageLoader(false);
          });
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [profile, countryId, itemDetails, isActiveTab]);

  const getMemberItems = () => {
    if (pageTokeMember) {
      setLoading(true);

      let data: IListItemsRequest = {
        token: token || "",
        pageQuery: "",
        pageSize: "12",
        pageToken: pageTokeMember || "",
      };
      const itemsServices = marketplaceServices.userlistItemsQuery(
        countryId || profile?.countryId,
        itemDetails?.itemSellerId,
        data
      );

      itemsServices
        .then((res: any) => {
          setLoading(false);

          let newData = res?.data?.dataset?.map((list: any) => {
            return {
              id: list?.id,
              brand: `${list?.brandName}`,
              size: list?.size,
              amount: list?.price,
              image: list?.defaultImageUrl,

              ...list,
            };
          });

          setMemberItems([...memberItems, ...newData]);

          setMemberPageToken(res?.data?.pageToken);
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  };

  const updateItemState = (id: any) => {
    const findExistingItems = memberItems?.find((list: any) => list?.id === id);

    if (findExistingItems) {
      const getNewUpdate = memberItems?.map((list: any) =>
        list?.id === id
          ? {
              ...list,
              isUserFavorite: list?.isUserFavorite ? false : true,
              favouriteCount: list?.isUserFavorite
                ? list?.favouriteCount - 1
                : list?.favouriteCount + 1,
            }
          : list
      );

      setMemberItems(getNewUpdate);
    }
  };

  const itemRelatedTemplate = relatedProducts?.map((item: any) => {
    return (
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
          },
        ]}
        key={item?.id}
      >
        <RecommendedCard
          imageSource={item?.image}
          size={item?.size}
          title={item.brand}
          price={item.price}
          isServerImage
          itemId={item?.id}
          width={"100%"}
          isUserFavorite={item?.isUserFavorite}
          handleIsFavourite={(data: any) => updateItemState(data)}
          count={item?.favouriteCount}
          currency={item?.currencySymbol?.toUpperCase()}
        />
      </View>
    );
  });

  const itemTemplate = memberItems?.map((item: any) => {
    return (
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
          },
        ]}
        key={item?.id}
      >
        <RecommendedCard
          imageSource={item?.image}
          size={item?.size}
          title={item.brand}
          price={item.price}
          isServerImage
          itemId={item?.id}
          width={"100%"}
          isUserFavorite={item?.isUserFavorite}
          handleIsFavourite={(data: any) => updateItemState(data)}
          count={item?.favouriteCount}
          currency={item?.currencySymbol?.toUpperCase()}
        />
      </View>
    );
  });

  const emptyTemplate = getEmptyStateCountLoader(8)?.map((list, index) => {
    return (
      <View
        key={index}
        style={[
          styles.card,
          {
            width: cardWidth,
          },
        ]}
      >
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

  const isSellerSameAsBuyer = profile?.id === itemDetails?.sellerInfo?.id;

  const makeOffer = () => {
    setMakeOfferLoader(true);
    marketplaceServices
      ?.askSeller(token, profile?.countryId, itemDetails?.itemId)
      .then((res: any) => {
        setMakeOfferLoader(false);
        if (res?.data?.conversationId) {
          dispatch(setCurrentChatName(itemDetails?.sellerInfo?.name));
          dispatch(setMetaData(itemDetails?.data?.metadata));
          return router.push(`/chats/${res?.data?.conversationId}`);
          // return ("conversation>>", res?.data?.conversationId);
        }

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        setMakeOfferLoader(false);
      });
  };

  const handleMakeOffer = () => {
    if (!token) {
      return router.push("/Onboarding");
    }
    // if (itemDetails?.buyerConversation?.id) {
    //   dispatch(setMetaData(itemDetails?.buyerConversation?.metadata));
    //   dispatch(setCurrentChatName(itemDetails?.sellerInfo?.name));
    //   router.push(`/chats/${itemDetails?.buyerConversation?.id}`);
    //   return;
    // }
    // makeOffer();
    setShowItemOfferModal(true);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return !itemDetails && !screenLoader ? (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <EmptyState
        title="Item not found."
        subtitle="When they do, they will appear here."
        hasButton
        buttonTitle="Go Back"
        onPress={() => router.back()}
      />
    </View>
  ) : (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor={"transparent"} barStyle={"dark-content"} />
      {screenLoader && (
        <View
          style={{
            paddingLeft: 16,
          }}
        >
          <SkeletonLoader />
        </View>
      )}
      {!screenLoader && (
        <View style={styles.wrapperTop}>
          <ItemDetailsTop
            itemDetails={itemDetails}
            isSellerSameAsBuyer={isSellerSameAsBuyer}
            openViewer={openViewer}
          />
          <ScrollView
            onScroll={isActiveTab == 1 ? getMemberItems : getMoreRelatedItems}
            scrollEventThrottle={16}
          >
            <Pressable onPress={() => openViewer(0)}>
              <View style={{ height: HEADER_HEIGHT }} />
            </Pressable>
            <ItemDetailsTop
              itemDetails={itemDetails}
              isSellerSameAsBuyer={isSellerSameAsBuyer}
              isContentOnly
            />
            {/* <MemberAndSimilarItems details={itemDetails} /> */}
            <View style={styles.wrapperBottom}>
              <View style={styles.tabContainer}>
                {tabs?.map((list) => (
                  <View key={list?.id} style={styles.tabActionView}>
                    <CustomButton
                      title={list?.title}
                      textStyle={
                        isActiveTab === list?.id
                          ? styles.tabBtnText
                          : styles.tabBtnTextInactive
                      }
                      buttonStyle={
                        isActiveTab === list?.id
                          ? styles.tabBtnBody
                          : styles.tabBtnBodyInactive
                      }
                      onPress={() => setIsActiveTab(list?.id)}
                    />
                  </View>
                ))}
              </View>
              {isActiveTab === 1 && (
                <View>
                  {screenLoader || pageLoader ? (
                    <MyResponsiveGrid
                      template={emptyTemplate}
                      getNumberOfRows={(data: any) => setCardWidth(data)}
                    />
                  ) : (
                    (!screenLoader || !pageLoader) &&
                    (memberItems?.length ? (
                      <MyResponsiveGrid
                        template={itemTemplate}
                        getNumberOfRows={(data: any) => setCardWidth(data)}
                      />
                    ) : (
                      (!screenLoader || !pageLoader) && (
                        <View style={{ backgroundColor: "white" }}>
                          <EmptyState
                            title={t('marketplace.noItemsYet')}
                            subtitle={t('marketplace.noItemsYetMessage')}
                          />
                        </View>
                      )
                    ))
                  )}
                </View>
              )}

              {isActiveTab === 2 && (
                <View>
                  {screenLoader && (
                    <MyResponsiveGrid
                      template={emptyTemplate}
                      getNumberOfRows={(data: any) => setCardWidth(data)}
                    />
                  )}
                  {!screenLoader &&
                    (relatedProducts?.length ? (
                      <MyResponsiveGrid
                        template={itemRelatedTemplate}
                        getNumberOfRows={(data: any) => setCardWidth(data)}
                      />
                    ) : (
                      <View style={{ backgroundColor: "white" }}>
                        <EmptyState
                          title={t('marketplace.noRelatedItemsYet')}
                          subtitle={t('marketplace.noRelatedItemsYetMessage')}
                        />
                      </View>
                    ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {!itemDetails?.isSellerHolidayModeActivated && !isSellerSameAsBuyer && (
        <View style={styles.footer}>
          <View style={styles.footerBtnOfferView}>
            <CustomButton
              title={t('marketplace.makeAnOffer')}
              buttonStyle={styles.offerBtnBody}
              textStyle={styles.offerBtnText}
              onPress={handleMakeOffer}
              loader={makeOfferLoader}
            />
          </View>
          <View style={styles.footerBtnBuyView}>
            <CustomButton
              title={t('marketplace.buyNow')}
              buttonStyle={styles.buyBtnBody}
              textStyle={styles.buyBtnText}
              onPress={() =>
                router.push(`/ItemPurchase/${itemDetails?.itemId}`)
              }
            />
          </View>
        </View>
      )}
      {showItemOfferModal && (
        <MakeItemOfferModal
          isShow
          onClose={() => {
            setShowItemOfferModal(false);
          }}
          itemDetails={itemDetails}
        />
      )}
      <ImageViewer
        images={itemDetails?.itemImageUrls || []}
        visible={viewerOpen}
        onClose={() => setViewerOpen(false)}
        initialIndex={viewerIndex}
      />
    </View>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  wrapperTop: {
    flex: 1,
    backgroundColor: "white",
  },

  footer: {
    paddingTop: 16,
    paddingBottom: 31,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
  },
  footerBtnOfferView: {
    flex: 1,
    marginRight: 5,
  },
  footerBtnBuyView: {
    flex: 1,
    marginLeft: 5,
  },
  offerBtnBody: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(92, 111, 127, 1)",
    borderRadius: 8,
  },
  offerBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "rgba(92, 111, 127, 1)",
  },
  buyBtnBody: {
    backgroundColor: "rgba(255, 59, 74, 1)",
    borderColor: "rgba(255, 59, 74, 1)",
    borderRadius: 8,
    borderWidth: 1,
  },
  buyBtnText: {
    textAlign: "center",
    width: "100%",
    color: "white",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  wrapperBottom: {
    padding: 16,
    backgroundColor: "white",
  },
  tabContainer: {
    // padding: 5,
    backgroundColor: "rgba(237, 242, 247, 0.6)",
    flexDirection: "row",
    marginBottom: 20,
  },
  tabActionView: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  tabBtnBody: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 12,
    padding: 10,
  },
  tabBtnText: {
    fontSize: 12,
    color: "rgba(33, 44, 61, 1)",
    textAlign: "center",
    width: "100%",
    fontFamily: "DMSansSemiBold",
  },
  tabBtnTextInactive: {
    fontSize: 12,
    color: "rgba(33, 44, 61, 1)",
    textAlign: "center",
    width: "100%",
    fontFamily: "DMSansSemiBold",
  },
  tabBtnBodyInactive: {
    color: "transparent",
    width: "100%",
    padding: 10,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
});
