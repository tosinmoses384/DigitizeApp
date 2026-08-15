import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import StarIcon from "../assets/images/svg/StarOutline.svg";
import { router } from "expo-router";
import { capitalizeFirstLetter } from "../helper/capitalize-first-letter";
import moment from "moment";
import TrifterCard from "./TrifterCard";

interface IApp {
  reviews: any;
}

export default function App({ reviews }: IApp) {
  return (
    <ScrollView style={{ paddingBottom: 50 }}>
      {reviews?.map((user: any, index: number) => (
        <TrifterCard
          key={index}
          name={user?.createdBy}
          imageUrl={user?.trifterImageUrl}
          location={user?.review}
          rating={user?.ratings}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  initialContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  initial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  contentContainer: {
    marginLeft: 10,
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  time: {
    color: "#6B727E",
    fontSize: 12,
  },
  comment: {
    marginTop: 5,
    fontSize: 14,
  },
});
