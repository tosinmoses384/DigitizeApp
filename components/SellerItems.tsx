import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { IListItemsRequest } from "@services/features/wardrobe-service/models";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Text, View } from "react-native";
import FlatListResponsiveGrid from "./FlatListResponsiveGrid";
import RecommendedCard from "./RecommendedCard";

const SellerItems = () => {
  const { profile, token } = useAppSelector((state) => state.userProfileSlice);
  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { sellerId } = useAppSelector((state) => state.productFilter);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);
  const [pageToken, setPageToken] = useState("");
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    if (sellerId) {
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
          sellerId,
          data
        );

        itemsServices
          .then((res: any) => {
            setPageLoader(false);

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

            setItems(distructure);
            setPageToken(res?.data?.pageToken);
            // if (res?.responseCode === 401) {
            //   return push("/");
            // }
          })
          .catch((error) => {
            setPageLoader(false);
          });
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [profile, countryId, sellerId]);

  "items>>>", items;

  const updateItemState = (id: any) => {
    const filteredItems = items?.filter((list: any) => list?.id !== id);
    setItems(filteredItems);
  };

  const template = ({ item }: any) => {
    return (
      <View
        style={[
          styles.card,
          {
            width: Dimensions.get("window").width / numColumns - 0 * 2,
          },
        ]}
      >
        <RecommendedCard
          imageSource={item?.image}
          size={item?.size}
          title={item.title}
          price={item.price}
          isServerImage
          itemId={item?.id}
          width={"90%"}
          isUserFavorite={item?.isUserFavorite}
          handleIsFavourite={(data: any) => updateItemState(data)}
          count={item?.favouriteCount}
        />
      </View>
    );
  };

  return (
    <View>
      <FlatListResponsiveGrid
        data={items}
        renderItem={template}
        onEndReached={() => {}}
        loadingMore={false}
      />
    </View>
  );
};

export default SellerItems;

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 8,
  },
});
