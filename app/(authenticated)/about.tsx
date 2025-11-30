import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
// import StackHeader, { ResourcesHeader } from "@/components/StackHeader";
import { router } from "expo-router";
// import { defaultStyles } from "@/constants/Styles";
// import { fontSz } from "@/constants";
import ChevronRightArrow from "../../assets/images/svg/chevron-right-arrow.svg";
// import { Colors, SIZES } from "@/constants/Colors";
import { Platform } from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import { fontSz } from "../../constants";
import StackHeader, { ResourcesHeader } from "../../components/StackHeader";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const About = () => {
  const { t } = useI18n();
  
  const handleNavigation = (screen: any) => {
    if (screen === "/getToKnow") {
      router.push(screen);
    } else if (screen === "/AboutSustainability") {
      router.push(screen);
    } else if (screen === "/Advertise") {
      router.push(screen);
    } else if (screen === "/Careers") {
      router.push(screen);
    } else if (screen === "/HowItWork") {
      router.push(screen);
    } else if (screen === "/ItemVerification") {
      router.push(screen);
    } else if (screen === "/AboutWardrobe") {
      router.push(screen);
    } else if (screen === "/OurBlog") {
      router.push(screen);
    } else if (screen === "/helpCenter") {
      router.push(screen);
    } else if (screen === "/PurchaseCover") {
      router.push(screen);
    } else if (screen === "/AboutFaq") {
      router.push(screen);
    } else if (screen === "/TrustAndSafety") {
      router.push(screen);
    } else {
      router.push(screen);
    }
  };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 16,
        }}
      >
        <StackHeader
          title={t('about.aboutDigitizeApp')}
          onPress={() => router.back()}
          // infoRoute="/personalisationInfo"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.sectionContainer}
        >
          <View style={styles.section}>
            {[
              { text: t('about.aboutUs'), screen: "/getToKnow" },
              { text: t('about.sustainability'), screen: "/AboutSustainability" },
              { text: t('about.advertise'), screen: "/Advertise" },
              { text: t('about.careers'), screen: "/Careers" },
              // { text: "Get to know DigitizeApp", screen: "/HowItWork" },
              { text: t('about.howItWorks'), screen: "/HowItWork" },
              { text: t('about.itemVerification'), screen: "/ItemVerification" },
              { text: t('about.wardrobe'), screen: "/AboutWardrobe" },
              { text: t('about.ourBlog'), screen: "/OurBlog" },
              { text: t('about.helpAndSupport'), screen: "/helpCenter" },
              { text: t('about.purchaseCover'), screen: "/PurchaseCover" },
              { text: t('about.faq'), screen: "/AboutFaq" },
              { text: t('about.trustAndSafety'), screen: "/TrustAndSafety" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.row,
                  // index === 2 && styles.lastRow, // Last item styling
                ]}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </AppTabWrapper>
  );
};

export default About;

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 20,
    // paddingHorizontal: 20,
  },
  section: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    // marginTop: 20,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: fontSz(14),
    color: "#393939",
    fontFamily: "DMSansMedium",
  },
  // lastRow: {
  //   borderBottomWidth: 0,
  // },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
});
