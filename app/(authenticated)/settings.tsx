import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import ChevronRightArrow from "../../assets/images/svg/chevron-right-arrow.svg";
import Clock from "../../assets/images/svg/clock-time.svg";
import { Colors, SIZES } from "../../constants/Colors";
import { fontSz } from "../../constants";
import { router } from "expo-router";
import StackHeader from "../../components/StackHeader";
import { setTemporaryRoute } from "@redux/slice/temporary-route/temporaryRouteSlice";
import { useAppDispatch } from "@redux/store";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const Settings = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          // paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            marginHorizontal: 20,
          }}
        >
          <StackHeader
            title={t('navigation.settings')}
            onPress={() => router.push("/profile")}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}

          {/* How DigitizeApp Works Section */}
          {/* <View style={styles.section2}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.row2}
            onPress={() => router.push("/map")}
          >
            <Text style={styles.rowText}>Maps</Text>
            <ChevronRightArrow width={20} height={20} />
          </TouchableOpacity>
        </View> */}

          {/* Favorites and other sections */}
          <View style={styles.section}>
            {[
              { text: t('settings.profileDetails'), screen: "/profileDetails" },
              {
                text: t('settings.accountSettings'),
                screen: "/accountDetails",
              },
              { text: t('settings.payments'), screen: "/payments" },
              { text: t('settings.postage'), screen: "/postage" },
              { text: t('settings.analyticsAndPrivacy'), screen: "/analyticsConsent" },
              // {
              //   text: t('settings.security'),
              //   screen: "/security",
              // },
            ].map((item: any, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[styles.row, index === 4 && styles.lastRow]}
                onPress={() => {
                  router.push(item.screen);
                  dispatch(setTemporaryRoute(""));
                }}
              >
                {/* <item.icon width={25} height={25} /> */}
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.section2, { marginTop: 20, paddingLeft: 10 }]}>
            <Text style={{ fontFamily: "DMSansBold" }}>{t('settings.notifications')}</Text>
          </View>

          <View style={styles.section}>
            {[
              {
                text: t('settings.pushNotifications'),
                screen: "/pushNotification",
              },
              {
                text: t('settings.emailNotifications'),
                screen: "/emailAndNotification",
              },
            ].map((item: any, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[styles.row, index === 6 && styles.lastRow]}
                onPress={() => router.push(item.screen)}
              >
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.section2, { marginTop: 20, paddingLeft: 10 }]}>
            <Text style={{ fontFamily: "DMSansBold" }}>
              {t('settings.yourAppsLanguage')}
            </Text>
          </View>

          <View style={styles.section}>
            {[
              {
                text: t('settings.language'),
                screen: "/selectLanguage",
              },
            ].map((item: any, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[styles.row, index === 6 && styles.lastRow]}
                onPress={() => router.push(item.screen)}
              >
                <Clock width={20} height={20} />
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View>
          {/* <View style={styles.section}>
            {[
              {
                text: "Dark Mode",
                screen: "/maps",
              },
            ].map((item: any, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={index}
                style={[styles.row, index === 6 && styles.lastRow]}
                onPress={() => router.push(item.screen)}
              >
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View> */}
        </ScrollView>
      </View>
    </AppTabWrapper>
  );
};

export default Settings;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100,
  },
  profileContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    width: "90%",
  },
  profileName: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "DMSansBold",
  },
  profileLocation: {
    color: "gray",
    marginBottom: 10,
    fontFamily: "DMSansMedium",
  },
  viewProfileButton: {
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  viewProfileText: {
    color: Colors.light.primaryBase,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DMSansBold",
  },
  section2: {
    marginBottom: 20,
    width: "90%",
  },
  section: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: fontSz(14),
    color: "#393939",
    fontFamily: "DMSansMedium",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
    color: "#010101",
    marginHorizontal: 10,
    fontFamily: "DMSansMedium",
  },
  footerDot: {
    fontSize: 14,
    color: "#010101",
    marginHorizontal: 5,
    lineHeight: 20,
    textAlignVertical: "center",
    fontFamily: "DMSansMedium",
  },
});
