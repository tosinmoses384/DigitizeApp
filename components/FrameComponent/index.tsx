import * as React from "react";
import { memo } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Colors, white } from "@constants/Colors";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";

interface IFrameComponent {
  phoneNumber?: string;
  isVerified?: boolean;
  onChangePress?: () => void;
}

const FrameComponent = memo(({ 
  phoneNumber, 
  isVerified = false,
  onChangePress 
}: IFrameComponent) => {
  const { t } = useI18n();
  const handleChangePress = () => {
    if (onChangePress) {
      onChangePress();
    } else if (isVerified) {
      router.push("/ChangePhoneNumber");
    } else {
      router.push("/PhoneNumberConfirmation");
    }
  };

  return (
    <View style={styles.storeSetupParent}>
      <View style={styles.storeSetup}>
        <View style={styles.item}>
          <View style={styles.phoneVerification}>
            <Text style={styles.text}>
              {phoneNumber}
            </Text>
            {isVerified && (
              <Text style={styles.verified}>{t('settings.verified')}</Text>
            )}
          </View>
          <Pressable style={styles.addToCart} onPress={handleChangePress}>
            <Text style={styles.change}>{t('settings.change')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  storeSetupParent: {
    alignSelf: "stretch",
    alignItems: "flex-start",
    gap: 8,
  },
  storeSetup: {
    alignSelf: "stretch",
    borderRadius: 12,
    backgroundColor: white || "#FFFFFF",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
  },
  item: {
    flex: 1,
    backgroundColor: white || "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneVerification: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    alignSelf: "stretch",
    position: "relative",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: "DMSansMedium",
    color: "#393939",
    textAlign: "left",
  },
  verified: {
    width: 232,
    height: 18,
    position: "relative",
    fontSize: 10,
    lineHeight: 18,
    fontFamily: "DMSansRegular",
    color: "#6B727E",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  },
  addToCart: {
    height: 24,
    borderRadius: 12,
    borderStyle: "solid",
    borderColor: "#1C2533",
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  change: {
    height: 16,
    width: 46,
    position: "relative",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "DMSansRegular",
    color: "#464F5D",
    textAlign: "center",
  },
});

export default FrameComponent;

