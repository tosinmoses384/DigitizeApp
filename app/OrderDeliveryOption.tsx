import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import HomeIcon from "../assets/images/svg/home-house.svg";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CustomToastNotification from "@helper/toast-message";
import { formatAmount } from "@helper/formatCash";
import {
  IDeliveryOptionWithFees,
  ICurrency,
} from "@services/features/orders/models";
import { toTitleCase } from "@utils/stringUtils";

interface IOrderDeliveryOption {
  deliveryOptions: IDeliveryOptionWithFees[];
  selectedOption?: IDeliveryOptionWithFees | null;
  currency?: ICurrency;
  onClose: () => void;
  onSelect: (option: IDeliveryOptionWithFees) => void;
}

const OrderDeliveryOption = ({
  deliveryOptions,
  selectedOption,
  currency,
  onClose,
  onSelect,
}: IOrderDeliveryOption) => {
  const [deliveryOption, setDeliveryOption] = useState<string>(
    selectedOption ? `${selectedOption.providerId}-${selectedOption.serviceTypeId}` : ""
  );
  const [toastDetails, setToastDetails]: any = useState(null);

  // Generate color based on provider name
  const getColorForProvider = (provider: string): string => {
    const colors = ["#EAC43E", "#3ECBEA", "#3EEA5A", "#EA3E8B", "#8B3EEA"];
    const hash = provider.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Delivery options"}
          onPress={onClose}
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
        {deliveryOptions?.map((list) => {
          const optionId = `${list.providerId}-${list.serviceTypeId}`;
          return (
            <Pressable
              key={optionId}
              style={({ pressed }) => [
                styles.cardContainer,
                pressed && styles.pressed,
              ]}
              onPress={() => setDeliveryOption(optionId)}
            >
              <View style={styles.cardDetailsContainer}>
                <View style={styles.cardDetailsTitle}>
                  <View
                    style={[
                      styles.cardDetailsShape,
                      { backgroundColor: getColorForProvider(list.provider) },
                    ]}
                  />
                  <Text style={styles.cardDetailsTitleText}>
                    {toTitleCase(list.provider)} - {list.serviceType}
                  </Text>
                </View>
                <Text style={styles.cardDetailsAmount}>
                  {formatAmount(list.estimatedFee || 0, currency?.currencySymbol)}
                </Text>
                <View style={styles.cardDetailsTimeView}>
                  <HomeIcon />
                  <Text style={styles.cardDetailsTime}>
                    {list.serviceTypeDescription || "Home Delivery"}
                  </Text>
                </View>
                {list.breakDown && list.breakDown.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {list.breakDown.map((breakdown) => (
                      <Text key={breakdown.id} style={styles.cardDetailsBreakdown}>
                        • {breakdown.description}: {formatAmount(breakdown.fee, currency?.currencySymbol)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              <View
                style={
                  deliveryOption !== optionId
                    ? styles.activeDeliveryOptionCircle
                    : styles.deliveryOptionCircle
                }
              >
                <View
                  style={
                    deliveryOption !== optionId
                      ? styles.activeDeliveryOptionInnerCircle
                      : styles.deliveryOptionInnerCircle
                  }
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.bottomView}>
        <CustomButton
          title="Save"
          buttonStyle={styles.btnContainer}
          textStyle={styles.btnText}
          onPress={() => {
            const selected = deliveryOptions.find(
              (opt) => `${opt.providerId}-${opt.serviceTypeId}` === deliveryOption
            );
            if (selected) {
              onSelect(selected);
              onClose();
            }
          }}
          disabled={!deliveryOption}
        />
      </View>
    </View>
  );
};

export default OrderDeliveryOption;

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
  cardDetailsBreakdown: {
    fontSize: 11,
    color: "#637381",
    marginLeft: 8,
    marginTop: 2,
  },
});
