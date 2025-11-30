import CustomButton from "@components/CustomButton";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
interface IEmailAndPhoneNumber {
  value: string;
  onPress: any;
  btnTitle?: string;
  actionBtn?: ReactNode;
  hasSubtitle?: ReactNode;
  btnStyle?: any;
  btnTitleStyle?: any;
  disabled?: boolean;
}
const EmailAndPhoneNumber = ({
  value,
  onPress,
  btnTitle,
  actionBtn,
  hasSubtitle,
  btnStyle,
  btnTitleStyle,
  disabled,
}: IEmailAndPhoneNumber) => {
  return (
    <View style={styles.wrapper}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.top}>{value}</Text>
        {btnTitle && (
          <View>
            <CustomButton
              title={btnTitle || "Change"}
              textStyle={btnTitleStyle || styles.bottomText}
              buttonStyle={btnStyle || styles.bottom}
              onPress={onPress}
              disabled={disabled}
            />
          </View>
        )}
      </View>
      {!btnTitle && (
        <View style={styles.bottomDetails}>
          {hasSubtitle ? (
            hasSubtitle
          ) : (
            <Text style={styles.bottomVerified}>Verified</Text>
          )}

          <View>
            {actionBtn || (
              <CustomButton
                title={btnTitle || "Change"}
                textStyle={styles.bottomText}
                buttonStyle={styles.bottom}
                onPress={onPress}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default EmailAndPhoneNumber;

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  bottomDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  top: {
    color: "#393939",
    fontSize: 12,
    marginBottom: 4,
  },
  bottomVerified: {
    fontSize: 10,
    color: "#6B727E",
  },
  bottomText: {
    color: "#464F5D",
    fontSize: 12,
  },
  bottom: {
    borderWidth: 1,
    borderColor: "#1C2533",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
