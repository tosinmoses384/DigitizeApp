import { Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Colors } from "../constants/Colors";
import { fontSz } from "../constants";
import { truncateByCharacters } from "@helper/truncateText";

const Card = ({ imageSource, title, isServerImage }: any) => {
  const [isHeartSelected, setIsHeartSelected] = useState(false);

  const handleHeartPress = () => {
    setIsHeartSelected(!isHeartSelected);
  };

  return (
    <View style={styles.cardContainer}>
      {isServerImage ? (
        <Image src={imageSource} style={styles.cardImage} />
      ) : (
        <Image source={imageSource} style={styles.cardImage} />
      )}

      <Text style={styles.cardTitle}>{truncateByCharacters(title, 20)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    marginRight: 10,
    width: 170,
    height: 230,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
  },
  cardTitle: {
    fontFamily: "DMSansMedium",
    // fontSize: 16,
    fontSize: fontSz(17),
    color: "#464F5D",
    marginTop: 8,
    textAlign: "left",
    width: "100%",
    textTransform: "capitalize",
  },
});

export default Card;
