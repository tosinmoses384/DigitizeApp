import { formatAmount } from "@helper/formatCash";
import { starTemplate } from "@helper/starTemplate";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LocationIcon from "../../../../assets/images/svg/location-pin.svg";
import TimeIcon from "../../../../assets/images/svg/access_time.svg";
interface ISellerIntroActivity {
  message: any;
  profileId: string;
  isSeller?: boolean;
}

const SellerIntroActivity = ({ message, profileId, isSeller }: ISellerIntroActivity) => {
  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.name}>Hi, I’m Teanottee</Text>
      <Text style={styles.review}>{starTemplate(3)}</Text>
      <View style={styles.locationView}>
        <LocationIcon width={15} height={15} color={"#464F5D"} />
        <Text style={styles.locationText}>Lagos, Nigeria.</Text>
      </View>
      <View style={styles.timeView}>
        <TimeIcon width={15} height={15} color={"#464F5D"} />
        <Text style={styles.locationText}>Last seen 2 hours ago</Text>
      </View>
    </View>
  );
};

export default SellerIntroActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderColor: "#E9EAEB",
    borderWidth: 2,
    backgroundColor: "#FFF7F8",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#E9EAEB",
    borderWidth: 2,
  },
  messageText: {
    color: "#131111",
    fontFamily: "DMSansRegular",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 10,
    color: "#2c2828",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  name: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansMedium",
  },
  review: {
    marginBottom: 12,
  },
  locationView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#464F5D",
    marginLeft: 8,
  },
  timeView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
