import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import HomeIcon from "../assets/images/svg/home-house.svg";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@redux/store";
import CustomToastNotification from "@helper/toast-message";
import { formatAmount } from "@helper/formatCash";

const DeliveryTimeOption = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [deliveryOption, setDeliveryOption]: any = useState("");
  const [toastDetails, setToastDetails]: any = useState(null);

  const deliveryOptions = [
    {
      id: 1,
      title: "InPost Home Delivery",
      amount: 200,
      deliveryTime: "Home Delivery, 2-4 business days",
      color: "#EAC43E",
    },
    {
      id: 2,
      title: "Evri Home Delivery",
      amount: 200,
      deliveryTime: "Home Delivery, 2-4 business days",
      color: "#3ECBEA",
    },
    {
      id: 3,
      title: "Yodel store to Door",
      amount: 200,
      deliveryTime: "Home Delivery, 2-4 business days",
      color: "#3EEA5A",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Delivery options"}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
      </View>

      {toastDetails && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: "2%",
            left: 0,
          }}
        >
          <CustomToastNotification
            message={toastDetails?.message}
            type={toastDetails?.type}
            autoHideDuration={toastDetails?.duration}
          />
        </View>
      )}

      <ScrollView style={styles.bodyContainer}>
        {deliveryOptions?.map((list) => (
          <Pressable
            key={list?.id}
            style={({ pressed }) => [
              styles.cardContainer,
              pressed && styles.pressed,
            ]}
            onPress={() => setDeliveryOption(list?.id)}
          >
            <View style={styles.cardDetailsContainer}>
              <View style={styles.cardDetailsTitle}>
                <View
                  style={[
                    styles.cardDetailsShape,
                    { backgroundColor: list?.color },
                  ]}
                />
                <Text style={styles.cardDetailsTitleText}>{list?.title}</Text>
              </View>
              <Text style={styles.cardDetailsAmount}>
                {formatAmount(list?.amount)}
              </Text>
              <View style={styles.cardDetailsTimeView}>
                <HomeIcon />
                <Text style={styles.cardDetailsTime}>{list?.deliveryTime}</Text>
              </View>
            </View>
            <View
              style={
                deliveryOption !== list?.id
                  ? styles.activeDeliveryOptionCircle
                  : styles.deliveryOptionCircle
              }
            >
              <View
                style={
                  deliveryOption !== list?.id
                    ? styles.activeDeliveryOptionInnerCircle
                    : styles.deliveryOptionInnerCircle
                }
              />
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.bottomView}>
        <CustomButton
          title="Save"
          buttonStyle={styles.btnContainer}
          textStyle={styles.btnText}
          onPress={() => {}}
        />
      </View>
    </View>
  );
};

export default DeliveryTimeOption;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flex: 1,
  },
  bottomView: {
    padding: 16,
  },
  btnContainer: {
    backgroundColor: "#FF3B4A",
    padding: 14,
    borderRadius: 12,
  },
  btnText: {
    width: "100%",
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
  cardContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
  },
  pressed: {
    opacity: 0.5,
  },
  cardDetailsContainer: {
    flex: 1,
  },
  activeDeliveryOptionCircle: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#A0B1C0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryOptionCircle: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FF3B4A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  activeDeliveryOptionInnerCircle: {
    backgroundColor: "white",
  },
  deliveryOptionInnerCircle: {
    width: 9,
    height: 9,
    backgroundColor: "#FF3B4A",
    borderRadius: 9,
  },

  cardDetailsTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  cardDetailsShape: {
    width: 24,
    height: 20,
    marginRight: 8,
    borderRadius: 4,
  },
  cardDetailsTitleText: {
    fontSize: 14,
    color: "#393939",
    fontFamily: "DMSansMedium",
  },
  cardDetailsAmount: {
    fontSize: 14,
    color: "#393939",
    fontFamily: "DMSansMedium",
    marginBottom: 8,
  },
  cardDetailsTimeView: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetailsTime: {
    fontSize: 12,
    color: "#393939",
    marginLeft: 8,
  },
});
