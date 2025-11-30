import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import StackHeader, { ResourcesHeader } from "../../components/StackHeader";
import { router } from "expo-router";
import { defaultStyles } from "../../constants/Styles";
import { fontSz } from "../../constants";
import ChevronRightArrow from "../../assets/images/svg/chevron-right-arrow.svg";
import { Colors, SIZES } from "../../constants/Colors";
import { Platform } from "react-native";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const Legal = () => {
  const { t } = useI18n();
  const handleNavigation = (screen: any) => {
    router.push(screen);
  };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        {/* <ResourcesHeader
        title="Legal Information"
        onPress={() => router.back()}
        infoRoute="/personalisationInfo"
      /> */}
        <StackHeader
          title={t('legal.legalInformation')}
          onPress={() => router.back()}
          // infoRoute="/personalisationInfo"
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            {[
              { text: t('legal.termsAndConditions'), screen: "/TermsAndConditions" },
              { text: t('legal.privacyPolicy'), screen: "/PrivacyPolicy" },
              { text: t('legal.acknowledgements'), screen: "/getToKnowLegal" },
              // { text: "HMRC reporting centre", screen: "/getToKnowLegal" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.row, index === 2 && styles.lastRow]}
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

export default Legal;

const styles = StyleSheet.create({
  sectionContainer: {
    // marginVertical: 20,
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
  lastRow: {
    borderBottomWidth: 0,
  },
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
