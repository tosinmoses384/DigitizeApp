/* eslint-disable react-native/no-inline-styles */
import React, { FunctionComponent } from "react";
import { View, ViewStyle, Image, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fontSz } from "../constants";
import { COLORS, SIZES } from "../constants/Colors";
import SearchIcon from "../assets/images/svg/searchIcon.svg";
import { router } from "expo-router";

type SearchBarProps = {
  style?: ViewStyle | ViewStyle[];
};

const SearchBarWithAutocomplete: FunctionComponent<SearchBarProps> = (
  props
) => {
  const navigation = useNavigation();

  const handlePress = () => {
    router.push("/Search");
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: "row",
        height: 50,
        paddingHorizontal: SIZES.h4,
        borderRadius: SIZES.radius2,
        borderColor: COLORS.createOne,
        // borderWidth: fontSz(1),
        backgroundColor: "#FFFFFF",
        alignItems: "center",
      }}
    >
      <SearchIcon width={24} height={50} />
      <Text
        style={{
          marginLeft: SIZES.h4,
          fontSize: fontSz(18),
          color: "#B5B9BE",
          fontFamily: "FigtreeRegular",
        }}
      >
        Search for items
      </Text>
    </Pressable>
  );
};

export default SearchBarWithAutocomplete;
