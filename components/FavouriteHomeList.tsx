import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import RecommendedCard from "./RecommendedCard";
import { WIDTH } from "../constants";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { IMarketPlaceItemsResponse } from "@services/features/marketplace/models";
import { setRefetchHomeState } from "@redux/slice/profile/profileSlice";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
interface IFavouriteHomeList {
  isLoading: boolean;
  isRefreshing: boolean;
  setHasFavourite: any;
}
const FavouriteHomeList = ({
  isLoading,
  isRefreshing,
  setHasFavourite,
}: IFavouriteHomeList) => {
  const { token, profile, refecthHomeState } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const [products, setProducts] = useState([]);
  const [screenLoader, setScreenLoader] = useState(false);
  const dispatch = useAppDispatch();

  const fetchData = () => {
    // console.log('===== fetch favourite items:');

    let query: any = {
      PageSize: "5",
    };
    marketplaceServices
      ?.marketPlaceFavItemsQuery(token, query)
      .then((res: any) => {
        setScreenLoader(false);
// console.log('===== fetch favourite items:', res);
        const distructure = res?.data?.dataset?.map((list: any) => {
          return {
            id: list?.id,
            brand: `${list?.brand}`,
            size: list?.size,
            amount: list?.price,
            image: list?.defaultImageUrl,
            ...list,
          };
        });
        dispatch(setRefetchHomeState(false));

        setHasFavourite(distructure?.length ? true : false);

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
  }, [token]);

  const updateItemState = (id: any) => {
    const filteredItems = products?.filter((list: any) => list?.id !== id);
    setProducts(filteredItems);
    // setScreenLoader(true);
    let query = {
      PageSize: "4",
      PageToken: "",
    };
    marketplaceServices
      ?.marketPlaceFavItemsQuery(token, query)
      .then((res: any) => {
        // setScreenLoader(false);
        const distructure = res?.data?.dataset?.map((list: any) => {
          return {
            id: list?.id,
            brand: `${list?.brand}`,
            size: list?.size,
            amount: list?.price,
            image: list?.defaultImageUrl,
            ...list,
          };
        });

        dispatch(setRefetchHomeState(true));

        setProducts(distructure);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
        // setScreenLoader(false);
      });
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

export default FavouriteHomeList;
