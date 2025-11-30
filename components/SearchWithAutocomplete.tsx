/* eslint-disable react-native/no-inline-styles */
import React, { FunctionComponent, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ViewStyle,
  FlatList,
  Image,
  Pressable,
} from "react-native";
// import {fontSz, hp, wp} from '../../utils';
import LocationLightIcon from "../assets/images/svg/chevron-right-arrow.svg";
import { COLORS, SIZES } from "../constants/Colors";
import { fontSz, hp, wp } from "../constants";
import SearchIcon from "../assets/images/svg/searchIcon.svg";

export type PredictionType = {
  description: string;
  place_id: string;
  reference: string;
  matched_substrings: any[];
  tructured_formatting: Object;
  terms: Object[];
  types: string[];
};

type SearchTerm = {
  term: string;
  fetchPredictions: boolean;
};

type SearchBarProps = {
  value: string;
  setSearch: React.Dispatch<React.SetStateAction<SearchTerm>>;
  style?: ViewStyle | ViewStyle[];
  onChangeText: (text: string) => void;
  predictions: PredictionType[];
  showPredictions: boolean;
  setShowPredictions: React.Dispatch<React.SetStateAction<boolean>>;
  onPredictionTapped: (placeId: string, description: string) => void;
  placeholder: string;
};

const SearchBarWithAutocomplete1: FunctionComponent<SearchBarProps> = (
  props
) => {
  const [inputSize, setInputSize] = useState({ width: 0, height: 0 });

  const {
    value,
    setSearch,
    style,
    onChangeText,
    onPredictionTapped,
    predictions,
    showPredictions,
    setShowPredictions,
    placeholder,
  } = props;

  const { container, inputStyle } = styles;

  const _renderPredictions = (predictions: PredictionType[]) => {
    const { predictionsContainer, predictionRow } = styles;

    return (
      <FlatList
        data={predictions}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              style={predictionRow}
              onPress={() =>
                onPredictionTapped(item.place_id, item.description)
              }
            >
              <LocationLightIcon />
              <View
                style={{
                  marginLeft: wp(10),
                }}
              >
                {/* <Text
                  style={{ fontWeight: "400" }}

                  fontSize={fontSz(15)}
                  text={`${item.description}`}
                  numberOfLines={1}
                /> */}
                {/* <Text
                  style={{ fontWeight: "400" }}
                  fontSize={fontSz(11)}
                  text={`${item?.structured_formatting?.main_text}, ${item?.structured_formatting?.secondary_text}`}
                  numberOfLines={1}
                  color={COLORS.lightCreateOne}
                /> */}
              </View>
            </Pressable>
          );
        }}
        keyExtractor={(item) => item.place_id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[predictionsContainer]}
      />
    );
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          height: 50,
          // paddingHorizontal: SIZES.h4,
          // borderRadius: SIZES.padding,
          // borderColor: COLORS.createOne,
          // borderWidth: fontSz(1),
          // backgroundColor: "#E3E3E7",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SearchIcon />
          <TextInput
            style={[inputStyle]}
            // placeholder="Search brands"
            placeholder={placeholder}
            placeholderTextColor="gray"
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
            onLayout={(event) => {
              const { height, width } = event.nativeEvent.layout;
              setInputSize({ height, width });
            }}
          />
          {/* {value?.length > 0 && (
            <Pressable
              style={styles.cancelContainer}
              onPress={() => {
                setSearch({ term: "", fetchPredictions: false });
                setShowPredictions(!showPredictions);
              }}
            >
              <Image
                style={{
                  height: 18,
                  width: 18,
                  transform: [{ rotate: "45deg" }],
                }}
                source={require("../assets/images/svg/searchIcon.svg")}
              />
            </Pressable>
          )} */}
        </View>
      </View>
      {showPredictions && value.length > 0 && _renderPredictions(predictions)}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  inputStyle: {
    width: "87.5%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.transparent,
    color: COLORS.textDark,
    fontSize: fontSz(16),
  },
  predictionsContainer: {
    width: "100%",
    backgroundColor: COLORS.transparent,
    paddingTop: 16,
    paddingHorizontal: 10,
  },
  predictionRow: {
    flexDirection: "row",
    paddingBottom: 15,
    marginBottom: hp(10),
  },
  cancelContainer: {
    backgroundColor: COLORS.modalHandleColor,
    padding: fontSz(1.5),
    borderRadius: 15,
  },
});

export default SearchBarWithAutocomplete1;
