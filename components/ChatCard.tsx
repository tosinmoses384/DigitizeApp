import { getInitials } from "@helper/getInitials";
import { starTemplate } from "@helper/starTemplate";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { Pressable, Text, View } from "react-native";
import moment from "moment";
import { router } from "expo-router";
import { useAppDispatch } from "@redux/store";
import ChatImageIcon from "../assets/images/svg/chat-image-icon.svg";
import {
  setChatItem,
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
interface IChatCard {
  name: string;
  rating: number;
  productName: string;
  productSize: string;
  productImage: string;
  time: string;
  sellerImage: string;
  id: string;
  metadata: any;
  item: any;
}
const ChatCard = ({
  name,
  rating,
  productName,
  productSize,
  productImage,
  time,
  sellerImage,
  id,
  metadata,
  item,
}: IChatCard) => {
  const dispatch = useAppDispatch();

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => {
        router.push(`/chats/${id}`);
        dispatch(setCurrentChatName(name));
        dispatch(setMetaData(metadata || null));
        dispatch(setChatItem(item || null));
      }}
    >
      <View style={styles.imageWrapper}>
        {sellerImage ? (
          <Image
            source={{ uri: sellerImage }}
            style={{ width: 48, height: 48, borderRadius: 48 }}
          />
        ) : (
          <Text style={styles.imageText}>{getInitials(name || "")}</Text>
        )}
      </View>

      <View style={styles.centerView}>
        <Text style={styles.name}>{name || "**********"}</Text>
        <View style={styles.ratingView}>{starTemplate(rating || 0)}</View>
        {metadata && productName && (
          <Text style={styles.productDetail}>{productName}</Text>
        )}
        {metadata && productSize && (
          <Text style={{ textTransform: "uppercase", fontSize: 14 }}>
            {productSize}
          </Text>
        )}
      </View>

      <View style={styles.timeAndProductView}>
        <Text style={styles.time}>{moment(time).fromNow()}</Text>
        {metadata && (
          <View style={styles.productImageView}>
            {productImage ? (
              <Image
                source={{ uri: productImage }}
                style={{ width: "100%", height: "100%", borderRadius: 4 }}
              />
            ) : (
              <ChatImageIcon />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ChatCard;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 8,
  },
  imageWrapper: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(237, 242, 247, 0.8)",
    borderRadius: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },
  imageText: {
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
    color: "rgba(35, 35, 35, 1)",
  },
  ratingView: {
    flexDirection: "row",
    marginBottom: 8,
  },
  centerView: {
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: "rgba(92, 111, 127, 1)",
    marginBottom: 22,
    fontFamily: "DMSansMedium",
  },
  productImageView: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#E9EAEB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  timeAndProductView: {
    alignItems: "flex-end",
  },
  productDetail: {
    fontSize: 14,
    color: "rgba(7, 24, 39, 1)",
    textTransform: "capitalize",
  },
  name: {
    color: "rgba(7, 24, 39, 1)",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
  },
});
