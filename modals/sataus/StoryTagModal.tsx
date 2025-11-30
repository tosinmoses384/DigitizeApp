import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import CloseIcon from "../../assets/images/svg/x-close.svg";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { formatAmount } from "@helper/formatCash";
import { router } from "expo-router";
import { setItemDetails } from "@redux/slice/filters/filterSlice";
import LineLoader from "@components/LineLoader";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import { formatCurrency } from "@helper/formatNumber";

interface IStoryTagsModal {
  isShow: boolean;
  onClose: any;
  storyId: any;
  onFinishStory: any;
}
const StoryTagsModal = ({
  isShow,
  onClose,
  storyId,
  onFinishStory,
}: IStoryTagsModal) => {
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const [storyDetails, setStoryDetails]: any = useState(null);
  const [tagLoader, setTagLoader] = useState(false);
  const [cardWidth, setCardWidth] = useState(172);

  const topDetails = [
    {
      id: 1,
      title: "Mens Bomber Jacket",
      image: "",
      amount: "₦6,400.00",
    },
    {
      id: 2,
      title: "Mens Bomber Jacket",
      image: "",
      amount: "₦6,700.00",
    },
  ];

  const bottomCard = [
    {
      id: 1,
      image: "",
    },
    {
      id: 2,
      image: "",
    },
  ];

  const getStoryItem = () => {
    setTagLoader(true);
    timelineServices
      ?.getStoryByIdQuery(token, storyId)
      .then((res: any) => {
        setTagLoader(false);
        setStoryDetails(res?.data);
      })
      .catch((error) => {
        setTagLoader(false);
      });
  };

  useEffect(() => {
    if (storyId) {
      getStoryItem();
    }
  }, [storyId]);

  const itemTags = storyDetails?.tags;

  const recommendations = storyDetails?.recommendations;

  const recommendationsTeplate = recommendations?.map(
    (card: any, index: number) => (
      <Pressable
        style={({ pressed }) => [pressed && { opacity: 0.5 }]}
        onPress={() => {
          // Recommendations go to marketplace item details (dynamic route)
          router.push(`/ItemDetails/${card?.itemId || card?.id}`);
          onClose?.();
        }}
        key={index}
      >
        <View style={[styles.card, { width: cardWidth }]} key={index}>
          <View style={styles.innerImageCard}>
            <Image
              source={{ uri: card?.itemImageUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          </View>
        </View>
      </Pressable>
    )
  );

  return (
    <NewBottomModal isShow={isShow} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headerText}>In this Photo</Text>
          <Pressable
            style={({ pressed }) => [
              styles.headerCloseIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
        </View>
        <ScrollView
          style={styles.innerBody}
          showsVerticalScrollIndicator={false}
        >
          {tagLoader ? (
            <View
              style={{
                marginBottom: 8,
                height: 70,
              }}
            >
              <LineLoader />
            </View>
          ) : (
            <View style={styles.topCardView}>
              {itemTags?.map((list: any) => (
                <View key={list?.id} style={styles.topCardBody}>
                  <View style={styles.topCardImageView}>
                    {list?.imageUrl && (
                      <Image
                        source={{ uri: list?.imageUrl }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </View>
                  <View style={styles.topCardCenterView}>
                    <Text style={styles.topCardTitle}>
                      {list?.name || "N/A"}
                    </Text>
                    <Text style={styles.topCardAmount}>
                      {formatAmount(list?.amount || 0, list?.currencySymbol)}
                    </Text>
                  </View>
                  <View>
                    <CustomButton
                      title={list?.type === "OutfitTag" ? "View Outfit" : "View Item"}
                      textStyle={styles.topCardBtnText}
                      buttonStyle={styles.topCardBtn}
                      onPress={() => {
                        const username = storyDetails?.posterUsername || storyDetails?.postedBy || list.username || profile?.username;
                        const userId = storyDetails?.posterUserId || list.userId || profile?.id;
                        const userImageUrl = storyDetails?.posterUserImageUrl || storyDetails?.posterImageUrl;

                        if (list?.type === "OutfitTag") {
                          const outfitData = {
                            id: list.id,
                            title: list.name,
                            name: list.name,
                            defaultImageUrl: list.imageUrl,
                            imageUrl: list.imageUrl,
                            type: list.type,
                            username: username,
                            userId: userId,
                            sellerId: userId,
                            userImageUrl: userImageUrl,
                            posterUsername: username,
                          };

                          router.push({
                            pathname: '/OutfitDetails',
                            params: {
                              outfitId: list.id,
                              outfitData: JSON.stringify(outfitData),
                              username: username,
                              userId: userId,
                            },
                          });
                        } else {
                          const itemData = {
                            id: list.id,
                            brand: list.name,
                            brandName: list.name,
                            defaultImageUrl: list.imageUrl,
                            amount: list.amount,
                            price: list.amount,
                            currencySymbol: list.currencySymbol,
                            type: list.type,
                            countryId: list.countryId,
                            username: username,
                            userId: userId,
                            sellerId: userId,
                            userImageUrl: userImageUrl,
                            sellerUsername: username,
                          };

                          router.push({
                            pathname: '/ItemDetails',
                            params: {
                              itemId: list.id,
                              itemData: JSON.stringify(itemData),
                              username: username,
                              userId: userId,
                            },
                          });
                        }
                        onFinishStory?.();
                        onClose?.();
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          <View>
            {recommendations?.length ? (
              <Text style={styles.bottomTitle}>More from this seller</Text>
            ) : (
              ""
            )}
            <View>
              <MyResponsiveGrid
                template={recommendationsTeplate}
                getNumberOfRows={(data: any) => setCardWidth(data)}
                subtractFromMargin={27}
              />
              {/* {recommendations?.map((list: any) => (
                <View key={list?.id} style={styles.bottomCardImage}></View>
              ))} */}
            </View>
          </View>
        </ScrollView>
      </View>
    </NewBottomModal>
  );
};

export default StoryTagsModal;

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
    marginRight: 4,
  },
  topCardCenterView: {
    flex: 1,
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
  bottomTitle: {
    fontSize: 14,
    color: "#353535",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
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
});
