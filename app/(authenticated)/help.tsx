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

const Help = () => {
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
        <ResourcesHeader
          title={t('help.helpCentre')}
          onPress={() => router.back()}
          infoRoute="/personalisationInfo"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          // style={styles.sectionContainer}
        >
          <View style={styles.section}>
            {[
              { text: t('help.home'), screen: "/getToKnow" },
              { text: t('help.gettingStarted'), screen: "/getToKnow" },
              { text: t('help.selling'), screen: "/getToKnow" },
              { text: t('help.buying'), screen: "/getToKnow" },
              { text: t('help.shipping'), screen: "/getToKnow" },
              { text: t('help.paymentsAndWithdrawals'), screen: "/getToKnow" },
              { text: t('help.trustAndSafety'), screen: "/getToKnow" },
              { text: t('help.myAccountAndSettings'), screen: "/getToKnow" },
              { text: t('help.community'), screen: "/getToKnow" },
              { text: t('help.notLoggedIn'), screen: "/getToKnow" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.row,
                  index === 2 && styles.lastRow, // Last item styling
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

export default Help;

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  section: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
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
