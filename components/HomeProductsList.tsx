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
import MyResponsiveGrid from "./MyResponsiveGrid";
interface IHomeProductsList {
  countryId: string;
  isLoading: boolean;
  isRefreshing: boolean;
}
const HomeProductsList = ({
  countryId,
  isLoading,
  isRefreshing,
}: IHomeProductsList) => {
  const { token, profile, refecthHomeState } = useAppSelector(
    (state) => state.userProfileSlice
  );
  const [products, setProducts] = useState([]);
  const [screenLoader, setScreenLoader] = useState(true);
  const dispatch = useAppDispatch();
  const [cardWidth, setCardWidth] = useState(172);

  const fetchData = () => {
    let query: any = {
      PageSize: "12",
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
            ...list,
          };
        });

        dispatch(setRefetchHomeState(false));

        setProducts(distructure);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {
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
    if (token || countryId) {
      getItems();
    }
  }, [token, profile, countryId]);

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

  const emptyTemplate = getEmptyStateCountLoader(12)?.map((list, index) => {
    return (
      <View style={[styles.card, { width: cardWidth }]} key={index}>
        <RecommendedCard
          key={index}
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

  const productTeplate = products?.map((card: any, index) => (
    <View style={[styles.card, { width: cardWidth }]} key={index}>
      <RecommendedCard
        key={index}
        imageSource={card?.image}
        size={card?.size}
        title={card.brandName}
        price={card.price}
        isServerImage
        itemId={card?.id}
        width={"100%"}
        isUserFavorite={card?.isUserFavorite}
        handleIsFavourite={(data: any) => updateItemState(data)}
        count={card?.favouriteCount}
        currency={card?.currencySymbol?.toUpperCase()}
      />
    </View>
  ));

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      {isLoading || screenLoader ? (
        <MyResponsiveGrid
          template={emptyTemplate}
          getNumberOfRows={(data: any) => setCardWidth(data)}
          subtractFromMargin={27}
        />
      ) : (
        <MyResponsiveGrid
          template={productTeplate}
          getNumberOfRows={(data: any) => setCardWidth(data)}
          subtractFromMargin={27}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
});

export default HomeProductsList;
