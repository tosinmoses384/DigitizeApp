import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Card from "./Card";
import { WIDTH } from "../constants";
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { router } from "expo-router";
import RecommendedCard from "./RecommendedCard";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
interface ICardList {
  isLoading: boolean;
  setHasBrowseOutfit: any;
}
const CardList = ({ isLoading, setHasBrowseOutfit }: ICardList) => {
  const { token, profile } = useAppSelector((state) => state.userProfileSlice);
  const [products, setProducts] = useState([]);
  const [screenLoader, setScreenLoader] = useState(false);

  const getItems = () => {
    setScreenLoader(true);
    let query: any = {
      PageSize: "5",
    };
    marketplaceServices
      ?.marketPlaceFavItemsQuery(token, query)
      .then((res: any) => {
        setScreenLoader(false);
        const distructure = res?.data?.dataset?.map((list: any) => {
          return {
            id: list?.id,
            title: `${list?.title}`,
            size: list?.size,
            amount: list?.price,
            image: list?.defaultImageUrl,
            ...list,
          };
        });

        setHasBrowseOutfit(distructure?.length ? true : false);

        setProducts(distructure);

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch((error: any) => {
        setScreenLoader(false);
      });
  };

  useEffect(() => {
    if (token) {
      getItems();
    }
  }, [profile, token]);

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
      {(isLoading || screenLoader) && emptyTemplate}
      {(!isLoading || !screenLoader) &&
        products?.map((card: any, index) => (
          <View style={styles.cardListContainer} key={index}>
            <Card imageSource={card?.image} title={card?.title} isServerImage />
          </View>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardListContainer: {
    flexDirection: "row",
    height: 230,
  },
});

export default CardList;
