import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import RecommendedCard from "./RecommendedCard";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";

import marketplaceServices from "@services/features/marketplace/marketplaceServices";

import { setRefetchHomeState } from "@redux/slice/profile/profileSlice";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
interface IRecommendedCardList {
  isLoading: boolean;
  isRefreshing: boolean;
  setHasRecommendedForYou: any;
}
const RecommendedCardList = ({
  isLoading,
  isRefreshing,
  setHasRecommendedForYou,
}: IRecommendedCardList) => {
  const { token, profile, refecthHomeState } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const [products, setProducts] = useState([]);
  const [screenLoader, setScreenLoader] = useState(false);
  const dispatch = useAppDispatch();

  const fetchData = () => {
    let query: any = {
      PageSize: "5",
    };
    marketplaceServices
      ?.recommendationPlaceItemsQuery(token, query)
      .then((res: any) => {
        setScreenLoader(false);
        dispatch(setRefetchHomeState(false));

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

        setHasRecommendedForYou(distructure?.length ? true : false);

        setProducts(distructure);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error: any) => {
        setScreenLoader(false);
      });
  };

  const getItems = () => {
    setScreenLoader(true);
    fetchData();
  };

  useEffect(() => {
    if (token && isRefreshing) {
      getItems();
    }
  }, [isRefreshing]);

  useEffect(() => {
    fetchData();
  }, [refecthHomeState]);

  useEffect(() => {
    if (token) {
      getItems();
    }
  }, [profile, token]);

  const updateItemState = (id: any) => {
    const findExistingItems = products?.find((list: any) => list?.id === id);

    if (findExistingItems) {
      const getNewUpdate: any = products?.map((list: any) =>
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
      dispatch(setRefetchHomeState(true));
      setProducts(getNewUpdate);
    }
  };

  const emptyTemplate = getEmptyStateCountLoader(5)?.map((list, index) => {
    return (
      <RecommendedCard
        key={index}
        imageSource={""}
        size={""}
        title={""}
        price={""}
        isServerImage
        itemId={""}
        loader
      />
    );
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.cardListContainer}>
        {(isLoading || screenLoader) && emptyTemplate}

        {(!screenLoader || !isLoading) &&
          products?.map((card: any, index) => (
            <RecommendedCard
              key={index}
              imageSource={card?.image}
              size={card?.size}
              title={card.brand}
              price={card.price}
              isServerImage
              itemId={card?.id}
              isUserFavorite={card?.isUserFavorite}
              handleIsFavourite={(data: any) => updateItemState(data)}
              count={card?.favouriteCount}
              currency={card?.currencySymbol?.toUpperCase()}
            />
          ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardListContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
});

export default RecommendedCardList;
