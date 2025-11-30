import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Keypad from "../../components/KeyboardDigits";
import FilledButton from "../../components/buttons/Filled_button";
import { defaultStyles } from "../../constants/Styles";
import { Colors, SIZES } from "../../constants/Colors";
import { router } from "expo-router";
import StackHeader from "../../components/StackHeader";
import CustomPinInput from "../../components/CustomPinInput";
import Loader from "../../components/Loader";
import Success from "../../components/Success";
import { useNavigation } from "expo-router";

const WithdrawalPin = () => {
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.dispatch(e.data.action);
    });
  }, []);

  const handleKeyPress = (key) => {
    const newOtp = [...otpValue];
    if (key === "delete") {
      const clearedOtp = newOtp.map(() => "");
      setOtpValue(clearedOtp);
      handleFocus(0);
    } else if (key.length === 1 && !isNaN(key)) {
      const firstEmptyIndex = newOtp.indexOf("");
      if (firstEmptyIndex !== -1) {
        newOtp[firstEmptyIndex] = key;
        setOtpValue(newOtp);
        if (firstEmptyIndex < 5) {
          handleFocus(firstEmptyIndex + 1);
        }
      }
    }
  };

  const handleTextChange = (text, index) => {
    const newOtp = [...otpValue];
    newOtp[index] = text;
    setOtpValue(newOtp);
    if (text && index < 5) {
      handleFocus(index + 1);
    }
  };

  const handleFocus = (index) => {
    if (index >= 0 && index < otpValue.length) {
      inputRefs.current[index]?.focus();
    }
  };

  const isOtpValid = otpValue.join("").length === 6;

  const handleAnimationFinish = () => {
    setLoaderVisible(false);
    setSuccessVisible(true);
  };

  const handleWithdrawal = () => {
    if (isOtpValid) {
      setLoaderVisible(true);
      setSuccessVisible(false);
    } else {
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <Loader
        visible={loaderVisible}
        message="Almost there... Just a moment"
        onAnimationFinish={handleAnimationFinish}
      />

      <Success
        visible={successVisible}
        message="Successful"
        messagebody="Your withdrawal is successful, you should be credited shortly"
        onAnimationFinish={() => setSuccessVisible(true)}
        close={() => setSuccessVisible(false)}
        routePath="/balance"
        buttonTitle="View Balance"
      />

      {/* Form and Keypad */}
      {!loaderVisible && !successVisible && (
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingTop:
              Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
            paddingHorizontal: 20,
          }}
        >
          <StackHeader
            title="Withdraw to bank account"
            onPress={() => router.back()}
          />
          <Text style={defaultStyles.header}>Enter Pin</Text>
          <Text style={defaultStyles.descriptionText}>
            Enter your transaction pin to complete withdrawal
          </Text>

          <View style={styles.inputWrapper}>
            <CustomPinInput
              otpValue={otpValue}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
              // inputRefs={inputRefs}
            />
          </View>

          <View style={{ paddingVertical: 10, marginTop: 60 }}>
            <FilledButton
              title={"Continue"}
              onPress={handleWithdrawal}
              loading={isLoading}
            />
          </View>

          <Keypad onKeyPress={handleKeyPress} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default WithdrawalPin;

const styles = StyleSheet.create({
  inputWrapper: {
    marginTop: 50,
    alignItems: "center",
  },
});
