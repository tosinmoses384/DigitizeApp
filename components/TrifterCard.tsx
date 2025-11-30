import { getInitials } from "@helper/getInitials";
import { starTemplate } from "@helper/starTemplate";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import LineLoader from "./LineLoader";
interface ITrifterCard {
  isLoading?: boolean;
  name: string;
  imageUrl: string;
  rating: number;
  location: string;
}
const TrifterCard = ({
  isLoading,
  name,
  imageUrl,
  rating,
  location,
}: ITrifterCard) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isLoading ? (
          <LineLoader loaderStyle={styles.imageLoader} />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              fontFamily: "DMSansSemiBold",
            }}
          >
            {getInitials(name || "")}
          </Text>
        )}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.viewContainer}>
          {isLoading ? (
            <View style={{ height: 16 }}>
              <LineLoader />
            </View>
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
        </View>
        <View style={styles.viewStarContainer}>
          {isLoading ? (
            <View style={{ width: "50%", height: 15 }}>
              <LineLoader />
            </View>
          ) : (
            starTemplate(rating)
          )}
        </View>
        <View>
          {isLoading ? (
            <View style={{ width: "70%", height: 15 }}>
              <LineLoader />
            </View>
          ) : (
            <Text style={styles.location}>{location}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default TrifterCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: "100%",
    backgroundColor: "rgba(255, 247, 248, 1)",

    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 56,
    objectFit: "cover",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: "rgba(7, 24, 39, 1)",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    textTransform: "capitalize",
  },
  viewContainer: {
    marginBottom: 5,
  },
  viewStarContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  location: {
    fontSize: 10,
    color: "rgba(144, 149, 158, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  imageLoader: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: "100%",

    // marginBottom: 5,
    overflow: "hidden",
  },
});
