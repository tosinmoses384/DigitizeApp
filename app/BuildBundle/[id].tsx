import CustomButton from "@components/CustomButton";
import EmptyState from "@components/EmptyState";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import RecommendedCard from "@components/RecommendedCard";
import StackHeader from "@components/StackHeader";
import { Colors } from "@constants/Colors";
import { formatAmount } from "@helper/formatCash";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { router, useLocalSearchParams } from "expo-router";
import MakeBundleOfferModal from "modals/MakeBundleOffer";
import ReviewBundleModal from "modals/ReviewBundleModal";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BuildBundle = () => {
  const { id }: any = useLocalSearchParams();
  const { countryId } = useAppSelector((state) => state?.userCountryId);
  const { profile, token }: any = useAppSelector(
    (state) => state?.userProfileSlice
  );
  const [screenLoader, setScreenLoader] = useState(true);
  const [products, setProducts]: any = useState([]);
  const [pageToken, setPageToken] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [getActiveQuery, setGetActiveQuery]: any = useState(null);
  const [sellerProfile, setSellerProfile]: any = useState(null);
  const [activeQuantity, setActiveQuantity]: any = useState(2);
  const [loading, setLoading] = useState(false);
  const [bundle, setBundle]: any = useState([]);
  const [actualTotalAmount, setActualTotalAmount] = useState(0);
  const [percentageAmount, setPercentageAmount] = useState(0);
  const [cardWidth, setCardWidth] = useState(172);
  const [showBundleReviewModal, setShowBundleReviewModal] = useState(false);
  const [bundleDetails, setBundleDetails] = useState(null);

  useEffect(() => {
    const getActiveQuery = sellerProfile?.bundleDiscounts?.find(
      (list: any) => list?.itemQuantity === activeQuantity
    );

    setGetActiveQuery(getActiveQuery);
  }, [activeQuantity, sellerProfile]);

  const getSellerBundle = () => {
    const userProfile = marketplaceServices.sellerBundleSettings(id, token);
    userProfile
      .then((res: any) => {
        setLoading(false);

        if (res?.status === 200) {
          setSellerProfile(res?.data);
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/");
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token && id) {
      getSellerBundle();
    }
  }, [id, token]);

  useEffect(() => {
    if (sellerProfile?.bundleDiscounts) {
      const sortedDiscounts = [...sellerProfile.bundleDiscounts].sort(
        (a, b) => a.itemQuantity - b.itemQuantity
      );

      if (bundle.length <= 2) {
        const matchingTier =
          sortedDiscounts.find(
            (discount) => discount.itemQuantity === bundle.length + 1
          ) ||
          sortedDiscounts.find(
            (discount) => discount.itemQuantity > bundle.length
          );
        setActiveQuantity(matchingTier?.itemQuantity || null);
      } else if (bundle.length > 2 && sortedDiscounts.length > 2) {
        setActiveQuantity(sortedDiscounts[2]?.itemQuantity || null);
      }
    } else {
      setActiveQuantity(null);
    }
  }, [bundle, sellerProfile]);

  useEffect(() => {
    if (countryId || profile?.countryId) {
      let query: any = {
        TrifterIds: id,
        PageSize: "12",
        PageToken: "",
      };
      marketplaceServices
        ?.marketPlaceItemsQuery(token, profile?.countryId || countryId, query)
        .then((res: any) => {
          setScreenLoader(false);
          const distructure = res?.data?.dataset?.map((list: any) => {
            return {
              id: list?.id,
              brand: `${list?.brandName}`,
              size: list?.size,
              amount: list?.price,
              image: list?.defaultImageUrl,
              sellerImageUrl: list?.sellerImageUrl,
              sellerName: list?.sellerName,
              ...list,
            };
          });

          setProducts(distructure);
          setPageToken(res?.data?.pageToken);
          if (res?.responseCode === 401) {
            return router.push("/");
          }
        })
        .catch((error) => {
          setScreenLoader(false);
        });
    }
  }, [countryId, profile]);

  const getMoreItems = () => {
    if (pageToken) {
      setLoadingMore(true);

      let query: any = {
        TrifterIds: id,
        // PageQuery: "",
        PageSize: "12",
        PageToken: pageToken,
      };

      marketplaceServices
        ?.marketPlaceItemsQuery(token, countryId, query)
        .then((res: any) => {
          setLoadingMore(false);
          // if (res?.data?.pageToken && res?.data?.hasNextPage) {
          const distructure = res?.data?.dataset?.map((list: any) => {
            return {
              id: list?.id,
              brand: `${list?.brandName}`,
              size: list?.size,
              amount: list?.price,
              image: list?.defaultImageUrl,
              sellerImageUrl: list?.sellerImageUrl,
              sellerName: list?.sellerName,
              ...list,
            };
          });
          distructure?.map((list: any) => {
            setProducts((prev: any) => [...prev, list]);
          });
          // }
          // if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
          // }
          if (res?.responseCode === 401) {
            return router.push("/");
          }
        })
        .catch((error) => {
          setLoadingMore(false);
        });
    }
  };

  const addToBundle = (list: any) => {
    setBundle([...bundle, list]);
  };

  const handleAddAndRemove = (list: any) => {
    const bundleExist = bundle?.find((bundle: any) => bundle?.id === list?.id);

    if (bundleExist) {
      const removeBundle = bundle?.filter(
        (bundle: any) => bundle?.id !== list?.id
      );

      setBundle(removeBundle);
      return;
    }
    addToBundle(list);
  };

  const updateItemState = (id: any) => {
    const findExistingItems = products?.find((list: any) => list?.id === id);

    if (findExistingItems) {
      const getNewUpdate = products?.map((list: any) =>
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

      setProducts(getNewUpdate);
    }
  };

  const getDiscountForBundleLength = (bundleLength: any) => {
    if (sellerProfile) {
      // Sort the sellerPercentage array by itemQuantity in ascending order
      const sortedPercentages = [...sellerProfile?.bundleDiscounts].sort(
        (a, b) => a.itemQuantity - b.itemQuantity
      );

      if (bundleLength === 2) {
        return (
          sortedPercentages.find((item) => item.itemQuantity === 2) || null
        );
      } else if (bundleLength === 3) {
        return (
          sortedPercentages.find((item) => item.itemQuantity === 3) || null
        );
      } else if (bundleLength === 5) {
        return (
          sortedPercentages.find((item) => item.itemQuantity === 5) || null
        );
      } else {
        return null; // Or handle cases with bundle length less than 2 if needed
      }
    }
  };

  const getPercentageAmount = (totalAmount: number, percentage: number) => {
    if (percentage === undefined || percentage === null) {
      return totalAmount;
    }

    if (typeof percentage !== "number" || percentage < 0 || percentage > 100) {
      return totalAmount; // Or handle invalid percentage as needed (e.g., throw an error)
    }

    const percentageAmount = (totalAmount * percentage) / 100;
    return percentageAmount;
  };

  useEffect(() => {
    const totalAmount = bundle.reduce(
      (sum: number, item: any) => sum + item.amount,
      0
    );
    const getDiscount =
      getDiscountForBundleLength(bundle?.length)?.discountPercentage || "";

    setActualTotalAmount(totalAmount);

    setPercentageAmount(
      getDiscount ? getPercentageAmount(totalAmount, getDiscount) : 0
    );
  }, [bundle, sellerProfile]);

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

  const itemTemplate = products?.map((item: any) => {
    const isAddedState = bundle?.find(
      (bundleValue: any) => bundleValue?.id === item?.id
    );
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
          isAdd
          currency={item?.currencySymbol}
          isActive={isAddedState}
          handleAdd={() => handleAddAndRemove(item)}
          disableBundleBtn={
            !isAddedState && bundle?.length === 5 ? true : false
          }
        />
      </View>
    );
  });

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          // paddingHorizontal: 20,
          paddingVertical: 16,
          marginTop: Platform.OS == "android" ? 20 : 20,
        },
      ]}
    >
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />
      <StackHeader
        isShowHeaderShadow
        title="Build a bundle"
        onPress={() => router.back()}
      />

      <View style={styles.topWrapper}>
        {getActiveQuery && (
          <Text style={styles.topTitle}>
            Add {getActiveQuery?.itemQuantity} items to get{" "}
            {getActiveQuery?.discountPercentage}% off
          </Text>
        )}
        {getActiveQuery && (
          <Text style={styles.topSubTitle}>
            If you want to learn more please read our{" "}
            <Text style={styles.topSubTitleLink}>Bundle Policy</Text>
          </Text>
        )}
        <ScrollView
          style={{ flex: 1 }}
          onScroll={getMoreItems}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {screenLoader && (
            <MyResponsiveGrid
              template={emptyTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          )}
          {!screenLoader &&
            (products?.length ? (
              <MyResponsiveGrid
                template={itemTemplate}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            ) : (
              <View style={{ backgroundColor: "white" }}>
                <EmptyState
                  title="No items yet."
                  subtitle="Items will appear here."
                />
              </View>
            ))}
        </ScrollView>
      </View>
      <View style={styles.bottomWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.bottomWrapperImages}>
            {bundle?.map((list: any) => (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 4,
                }}
                key={list?.id}
              >
                <Image
                  source={{ uri: list?.image || list?.defaultImageUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 4 }}
                />
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.bottomInnerWrapper}>
          <View style={styles.bottomContent}>
            <Text style={styles.bottomTotalAmount}>
              {formatAmount(
                actualTotalAmount - percentageAmount,
                sellerProfile?.currency?.currencySymbol?.toUpperCase() || ""
              )}
            </Text>
          </View>
          <View>
            <CustomButton
              title="Review Bundle"
              disabled={percentageAmount > 0 && sellerProfile ? false : true}
              buttonStyle={
                percentageAmount > 0 && sellerProfile
                  ? styles.reviewBtn
                  : styles.disableReviewBtn
              }
              textStyle={
                percentageAmount > 0 && sellerProfile
                  ? styles.reviewText
                  : styles.disableReviewText
              }
              onPress={() => setShowBundleReviewModal(true)}
            />
          </View>
        </View>
      </View>
      {showBundleReviewModal && (
        <ReviewBundleModal
          isShow
          onClose={() => setShowBundleReviewModal(false)}
          details={bundle}
          actualTotalAmount={actualTotalAmount}
          percentageAmount={percentageAmount}
          currency={sellerProfile?.currency?.currencySymbol?.toUpperCase()}
          buyerFees={sellerProfile?.buyerFees}
          sellerId={id}
          seller={sellerProfile}
          handleSetBundleDetails={(data: any) => {
            setBundleDetails(data);
            setShowBundleReviewModal(false);
          }}
        />
      )}
      {bundleDetails && (
        <MakeBundleOfferModal
          itemDetails={bundleDetails}
          details={bundle}
          // sellerProfile={sellerProfile}
          onClose={() => {
            setShowBundleReviewModal(true);
            setBundleDetails(null);
          }}
          onSuccess={() => {
            setShowBundleReviewModal(false);
          }}
          isShow
        />
      )}
    </View>
  );
};
export default BuildBundle;
const styles = StyleSheet.create({
  topWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    // paddingBottom: 31,
  },
  bottomWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  bottomInnerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomWrapperImages: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  bottomContent: {
    flex: 1,
  },
  reviewBtn: {
    backgroundColor: "#FF3B4A",
    paddingHorizontal: 20,
    paddingRight: 12,
  },
  disableReviewBtn: {
    backgroundColor: "#FFD8DB",
    paddingHorizontal: 20,
    paddingRight: 12,
  },
  reviewText: {
    fontSize: 14,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  disableReviewText: {
    fontSize: 14,
    color: "#FF5C68",
    fontFamily: "DMSansMedium",
  },
  bottomTotalAmount: {
    fontSize: 12,
    color: "#D4313E",
    fontFamily: "DMSansMedium",
  },
  topTitle: {
    fontSize: 14,
    color: "#FF3B4A",
    textAlign: "center",
    marginBottom: 16,
  },
  topSubTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 12,
    color: "#6B727E",
  },
  topSubTitleLink: {
    color: "#D4313E",
    textDecorationLine: "underline",
    textDecorationColor: "#D4313E",
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
});
