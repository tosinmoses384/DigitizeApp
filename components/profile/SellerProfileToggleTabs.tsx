import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { fontSz } from "../../constants";
import { Colors, COLORS } from "../../constants/Colors";

function SellerProfileToggleTabs({
  selectedTab,
  selectedTabIndex = 0,
  currentTab = "first",
  small,
  firstLabel,
  secondLabel,
  thirdLabel,
  onSelectTabIndex,
  containerStyle,
}: {
  selectedTab: any;
  selectedTabIndex: number;
  currentTab?: "first" | "second" | string;
  small?: boolean;
  firstLabel?: string;
  secondLabel?: string;
  thirdLabel?: string;
  onSelectTabIndex?: (tabIndex: number) => void;
  containerStyle?: ViewStyle;
}) {
  const [first, setFirst] = useState(currentTab === "first");
  const [second, setSecond] = useState(currentTab === "second");
  const [third, setThird] = useState(currentTab === "third");

  useEffect(() => {
    setFirst(currentTab === "first");
    setSecond(currentTab === "second");
    setThird(currentTab === "third");
    selectedTab(currentTab);
  }, [currentTab]);

  const toggle = (e: string) => {
    if (e === "first") {
      setFirst(true);
      setSecond(false);
      setThird(false);
      selectedTab("first");
      onSelectTabIndex?.(0);
    } else if (e === "second") {
      setFirst(false);
      setThird(false);
      setSecond(true);
      selectedTab("second");
      onSelectTabIndex?.(1);
    } else {
      setFirst(false);
      setSecond(false);
      setThird(true);
      selectedTab("third");
      onSelectTabIndex?.(2);
    }
  };

  useEffect(() => {
    switch (selectedTabIndex) {
      case 0:
        toggle("first");
        break;
      case 1:
        toggle("second");
        break;
      case 2:
        toggle("third");
        break;
    }
  }, [selectedTabIndex]);

  return (
    <View
      style={[
        styles.container,
        {
          width: small ? "50%" : "100%",
          height: small ? 30 : 45,
        },
        containerStyle,
      ]}
    >
      <Pressable
        style={[
          styles.pill,
          first && styles.focusedPill,
          {
            backgroundColor: first ? "white" : "#EDF2F7",
            paddingHorizontal: small ? 10 : 20,
            paddingVertical: small ? 5 : 10,
          },
        ]}
        onPress={() => toggle("first")}
      >
        <Text
          style={[
            styles.title,
            {
              color: first ? "#212C3D" : COLORS.lightCreateOne,
              fontSize: small ? fontSz(13) : fontSz(13.5),
              fontWeight: first ? "700" : "400",
            },
          ]}
        >
          {firstLabel}
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.pill,
          second && styles.focusedPill,
          {
            backgroundColor: second ? "white" : "#EDF2F7",
            paddingHorizontal: small ? 10 : 20,
            paddingVertical: small ? 5 : 10,
          },
        ]}
        onPress={() => toggle("second")}
      >
        <Text
          style={[
            styles.title,
            {
              color: second ? "#212C3D" : COLORS.lightCreateOne,
              fontSize: small ? fontSz(13) : fontSz(13.5),
              fontWeight: second ? "700" : "400",
            },
          ]}
        >
          {secondLabel}
        </Text>
      </Pressable>
      {thirdLabel && (
        <Pressable
          style={[
            styles.pill,
            third && styles.focusedPill,
            {
              backgroundColor: third ? "white" : "#EDF2F7",
              paddingHorizontal: small ? 10 : 20,
              paddingVertical: small ? 5 : 10,
            },
          ]}
          onPress={() => toggle("third")}
        >
          <Text
            style={[
              styles.title,
              {
                color: third ? "#212C3D" : COLORS.lightCreateOne,
                fontSize: small ? fontSz(13) : fontSz(13.5),
                fontWeight: third ? "700" : "400",
              },
            ]}
          >
            {thirdLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    borderRadius: 20,
    paddingVertical: 10,
    marginVertical: 10,
  },
  pill: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 20,
    height: 40,
  },
  focusedPill: {
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  title: {
    textAlign: "center",
  },
});

export default SellerProfileToggleTabs;
