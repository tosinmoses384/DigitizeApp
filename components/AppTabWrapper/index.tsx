import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Home2 from "../../assets/images/svg/home2.svg";
import Home from ".../../assets/images/svg/home.svg";
import Duotone from ".../../assets/images/svg/duotone.svg";
import Duotone2 from ".../../assets/images/svg/duotone2.svg";
import Profile1 from ".../../assets/images/svg/profile1.svg";
import Profile2 from ".../../assets/images/svg/profile2.svg";
import Plus from ".../../assets/images/svg/plus.svg";
import Plus2 from ".../../assets/images/svg/plus2.svg";
import AiSVGIcon from "../../assets/images/svg/aiSVGicon.svg";
import { Colors } from "../../constants/Colors";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";
interface IAppTabWrapper {
  children: ReactNode;
}
const AppTabWrapper = ({ children }: IAppTabWrapper) => {
  const route = useRoute();
  const currentRouteName = route.name;
  const { t } = useI18n();

  const tabs = [
    {
      id: 1,
      title: "home",
      labelKey: "navigation.home",
      activeIcon: <Home2 width={24} height={24} />,
      inactiveIcon: <Home width={24} height={24} />,
      link: "/home",
      activeLinks: ["home"],
    },
    {
      id: 2,
      title: "wardrobe",
      labelKey: "navigation.wardrobe",
      activeIcon: <Duotone2 width={24} height={24} />,
      inactiveIcon: <Duotone width={24} height={24} />,
      link: "/wardrobe",
      activeLinks: ["wardrobe"],
    },
    {
      id: 3,
      title: "add",
      labelKey: "navigation.add",
      activeIcon: <Plus2 width={24} height={24} />,
      inactiveIcon: <Plus width={24} height={24} />,
      link: "/add",
      activeLinks: ["add"],
    },
    {
      id: 4,
      title: "ai",
      labelKey: "navigation.aiStylist",
      activeIcon: <AiSVGIcon width={24} height={24} color="#FF3B4A" />,
      inactiveIcon: <AiSVGIcon width={24} height={24} color={Colors.light.tabIconDefault} />,
      link: "/ai",
      activeLinks: ["ai"],
    },
    {
      id: 5,
      title: "profile",
      labelKey: "navigation.profile",
      activeIcon: <Profile2 width={24} height={24} />,
      inactiveIcon: <Profile1 width={24} height={24} />,
      link: "/profile",
      activeLinks: [
        "profile",
        "profileMain",
        "helpCenter/index",
        "helpCenter",
        "helpCenter/[id]",
        "favorites",
        "personalisation",
        "balance",
        "order",
        "bundleDiscounts",
        "holidayMode",
        "settings",
        "cookieSettings",
        "about",
        "legal",
        "platform",
        "feedback",
      ],
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.children}>{children}</View>
      <View style={styles.bottomTab}>
        {tabs?.map((list: any) => (
          <Pressable
            key={list?.id}
            style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            onPress={() => router.push(list?.link)}
          >
            <View style={styles.bottomTabIcon}>
              {list?.activeLinks?.includes(currentRouteName)
                ? list?.activeIcon
                : list?.inactiveIcon}
            </View>
            <Text
              style={[
                list?.activeLinks?.includes(currentRouteName)
                  ? styles.bottomTabActiveTitle
                  : styles.bottomTabTitle,
                list?.labelKey === "navigation.aiStylist" && { textTransform: 'none' }
              ]}
            >
              {list?.labelKey ? t(list.labelKey) : list?.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default AppTabWrapper;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  children: {
    flex: 1,
  },
  bottomTab: {
    paddingHorizontal: 19,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomTabIcon: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 3,
  },
  bottomTabTitle: {
    textAlign: "center",
    fontSize: 12,
    textTransform: "capitalize",
    fontFamily: "DMSansMedium",
    color: "#A0B1C0",
  },
  bottomTabActiveTitle: {
    textAlign: "center",
    fontSize: 12,
    textTransform: "capitalize",
    fontFamily: "DMSansMedium",
    color: "#FF3B4A",
  },
});
