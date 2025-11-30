import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";

import ContentSwitch from "@components/ContentSwitch";
import { useI18n } from "@hooks/use-i18n";

const PushNotificationScreen = () => {
  const { t } = useI18n();
  const [isMessage, setIsMessage] = useState(false);
  const [isFeedback, setFeedback] = useState(false);
  const [isReduceItem, setIsReduceItem] = useState(false);
  const [isEnablePushNotification, setIsEnablePushNotification] =
    useState(false);
  const [isFavouritedItems, setIsFavouritedItems] = useState(false);
  const [isAfavouriteItemIsSold, setIsAfavouriteItemIsSold] = useState(false);
  const [newFollowers, setNewFollowers] = useState(false);
  const [newItems, setNewItems] = useState(false);

  const details = [
    {
      id: 1,
      title: t('notifications.newMessages'),

      switchValue: isMessage,
      handleSwitch: () => setIsMessage(!isMessage),
    },
    {
      id: 2,
      title: t('notifications.newFeedback'),

      switchValue: isFeedback,
      handleSwitch: () => setFeedback(!isFeedback),
    },
    {
      id: 3,
      title: t('notifications.reducedItems'),
      switchValue: isReduceItem,
      handleSwitch: () => setIsReduceItem(!isReduceItem),
    },
  ];

  const otherDetails = [
    {
      id: 1,
      title: t('notifications.favouritedItems'),

      switchValue: isFavouritedItems,
      handleSwitch: () => setIsFavouritedItems(!isFavouritedItems),
    },
    {
      id: 2,
      title: t('notifications.favouriteItemSold'),

      switchValue: isAfavouriteItemIsSold,
      handleSwitch: () => setIsAfavouriteItemIsSold(!isAfavouriteItemIsSold),
    },
    {
      id: 3,
      title: t('notifications.newFollowers'),
      switchValue: newFollowers,
      handleSwitch: () => setNewFollowers(!newFollowers),
    },
    {
      id: 4,
      title: t('notifications.newItems'),
      switchValue: newItems,
      handleSwitch: () => setNewItems(!newItems),
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('notifications.pushNotifications')}
          onPress={() => router.push("/settings")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 12,
            paddingBottom: 12,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <ContentSwitch
            title={t('notifications.enablePushNotifications')}
            handleSwitch={() =>
              setIsEnablePushNotification(!isEnablePushNotification)
            }
            switchValue={isEnablePushNotification}
            titleStyle={{
              fontSize: 14,
              color: "#393939",
              fontFamily: "DMSansMedium",
            }}
          />
        </View>
        <Text style={styles.pushTopTitle}>High-priority notifications</Text>
        {details?.map((list) => (
          <View key={list?.id} style={styles.topView}>
            <ContentSwitch
              title={list?.title}
              handleSwitch={list.handleSwitch}
              switchValue={list?.switchValue}
              titleStyle={{
                fontSize: 14,
                color: "#393939",
                fontFamily: "DMSansMedium",
              }}
            />
          </View>
        ))}
        <Text style={styles.pushOthersTitle}>Other notifications</Text>
        {otherDetails?.map((list) => (
          <View key={list?.id} style={styles.topView}>
            <ContentSwitch
              title={list?.title}
              handleSwitch={list.handleSwitch}
              switchValue={list?.switchValue}
              titleStyle={{
                fontSize: 14,
                color: "#393939",
                fontFamily: "DMSansMedium",
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PushNotificationScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pushTopTitle: {
    fontSize: 12,
    color: "#071827",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
  },
  pushOthersTitle: {
    fontSize: 12,
    color: "#071827",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
    marginTop: 20,
  },
  topView: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
});
