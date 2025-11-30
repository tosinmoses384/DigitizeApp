import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import VerifiedIcon from "../assets/images/svg/verified.svg";
import { starTemplate } from "@helper/starTemplate";
import CustomButton from "./CustomButton";
import { getInitials } from "@helper/getInitials";
import LineLoader from "./LineLoader";
interface IDrbersFollowCard {
  name: string;
  rating: any;
  imageUrl: string;
  isFollowing: boolean;
  loading: boolean;
  onPress: () => void;
  onProfilePress?: () => void;
  preLoader?: boolean;
}
const DrbersFollowCard = ({
  name,
  rating,
  imageUrl,
  isFollowing,
  loading,
  onPress,
  onProfilePress,
  preLoader,
}: IDrbersFollowCard) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onProfilePress}
        disabled={!onProfilePress || preLoader}
        activeOpacity={onProfilePress ? 0.7 : 1}
        accessibilityLabel={`View ${name}'s profile`}
        accessibilityRole="button"
      >
        <View style={styles.imageWrapper}>
          {preLoader ? (
            ""
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 96, height: 96, borderRadius: 96 }}
            />
          ) : (
            <Text style={{ fontSize: 18, fontFamily: "DMSansBold" }}>
              {getInitials(name)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onProfilePress}
        disabled={!onProfilePress || preLoader}
        activeOpacity={onProfilePress ? 0.7 : 1}
        accessibilityLabel={`View ${name}'s profile`}
        accessibilityRole="button"
      >
        <View style={styles.nameContainer}>
          {preLoader ? (
            <View style={{ width: "100%", height: 8, marginBottom: 8 }}>
              <LineLoader />
            </View>
          ) : (
            <>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {name}
              </Text>
              <VerifiedIcon style={styles.verifiedIcon} />
            </>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.reviewContainer}>
        {preLoader ? (
          <View style={{ width: "100%", height: 8 }}>
            <LineLoader />
          </View>
        ) : (
          starTemplate(rating || 0)
        )}
      </View>
      <View style={styles.buttonContainer}>
        {preLoader ? (
          <View style={{ width: "60%", height: 15 }}>
            <LineLoader />
          </View>
        ) : (
          <CustomButton
            title={isFollowing ? "Following" : "Follow"}
            buttonStyle={isFollowing ? styles.followButton : styles.button}
            textStyle={
              isFollowing ? styles.followButtonText : styles.buttonText
            }
            loader={loading}
            onPress={onPress}
            showLoadingText
          />
        )}
      </View>
    </View>
  );
};

export default DrbersFollowCard;

const styles = StyleSheet.create({
  wrapper: {
    width: 96,
  },
  imageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 96,
    backgroundColor: "silver",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },
  name: {
    fontSize: 14,
    color: "#212C3D",
    fontFamily: "DMSansBold",
    textTransform: "capitalize",
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 7,
  },
  button: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF3B4A",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 12,
    color: "#FF3B4A",
  },
  followButton: {
    backgroundColor: "#FF3B4A",
    borderWidth: 1,
    borderColor: "#FF3B4A",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  followButtonText: {
    fontSize: 12,
    color: "white",
  },
});
