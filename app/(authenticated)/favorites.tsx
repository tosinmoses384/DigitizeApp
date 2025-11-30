import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { Colors, SIZES } from "../../constants/Colors";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import { useAppSelector } from "@redux/store";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { IUserFavRequest } from "@services/features/wardrobe-service/models";
import RecommendedCard from "@components/RecommendedCard";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import EmptyState from "@components/EmptyState";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const Favorite = () => {
  const { t } = useI18n();
  const [cardWidth, setCardWidth] = useState(172);
  const [items, setItems]: any = useState([]);
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const [pageLoader, setPageLoader] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState("");

  const getItems = () => {
    if (pageToken) {
      setLoading(true);
      ("next>>>");

      let data: IUserFavRequest = {
        PageSize: "12",
        PageToken: pageToken || "",
      };
      const itemsServices = wardrobeServices.userFavourites(token, data);

      itemsServices
        .then((res: any) => {
          setLoading(false);

          const distructure =
            res?.data?.dataset?.map((list: any) => {
              return {
                id: list?.id,
                brand: `${list?.brandName}`,
                size: list?.size,
                amount: list?.price,
                image: list?.defaultImageUrl,
                sellerImageUrl: list?.sellerImageUrl,
                sellerName: list?.sellerName,
                isUserFavorite: true,
                ...list,
              };
            }) || [];
          setItems((prev: any) => [...items, ...distructure]);

          // if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
          // }

          if (res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (token) {
      const handler = setTimeout(() => {
        setPageLoader(true);
        let data: IUserFavRequest = {
          PageSize: "12",
          PageToken: pageToken || "",
        };

        const itemsServices = wardrobeServices.userFavourites(token, data);

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
                isUserFavorite: true,
                ...list,
              };
            });

            setItems(distructure);
            setPageToken(res?.data?.pageToken);
            if (res?.responseCode === 401) {
              return router.push("/Onboarding");
            }
          })
          .catch((error) => {
            setPageLoader(false);
          });
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [profile]);

  const updateItemState = (id: any) => {
    const filteredItems = items?.filter((list: any) => list?.id !== id);
    setItems(filteredItems);
  };

  const template = items?.map((card: any, index: number) => (
    <View style={[styles.card, { width: cardWidth }]} key={index}>
      <RecommendedCard
        key={index}
        imageSource={card?.image}
        size={card?.size}
        title={card.brand}
        price={card.price}
        isServerImage
        itemId={card?.id}
        width={"100%"}
        isUserFavorite={card?.isUserFavorite}
        handleIsFavourite={(data: any) => updateItemState(data)}
        count={card?.favouriteCount}
        currency={card?.currencySymbol}
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

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          // paddingHorizontal: 20,
        }}
      >
        <StackHeader title={t('favorites.favorites')} onPress={() => router.back()} />
        {/* <SearchBarWithAutocomplete1 /> */}
        {pageLoader && (
          <ScrollView style={{ paddingHorizontal: 20 }}>
            <MyResponsiveGrid
              template={emptyTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          </ScrollView>
        )}
        {!pageLoader &&
          (items?.length ? (
            <ScrollView
              style={{ paddingHorizontal: 20 }}
              onScroll={() => {
                if (pageToken) {
                  getItems();
                }
              }}
              scrollEventThrottle={16}
            >
              <MyResponsiveGrid
                template={template}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            </ScrollView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <EmptyState />
            </View>
          ))}
      </View>
    </AppTabWrapper>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
});
