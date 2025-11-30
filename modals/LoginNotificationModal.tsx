import BottomModal from "@components/BottomModal";
import CustomButton from "@components/CustomButton";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import UserAddIcon from "../assets/images/svg/add-user-plus.svg";
interface ILoginNotificationModal {
  onClose: any;
  isShow: boolean;
  handleButtonClose: any;
}
const LoginNotificationModal = ({
  onClose,
  isShow,
  handleButtonClose,
}: ILoginNotificationModal) => {
  return (
    <BottomModal onClose={onClose} isShow={isShow}>
      <View>
        <View style={styles.iconView}>
          <UserAddIcon />
        </View>
        <Text style={styles.text}>
          To continue, you will need to login to your account or sign up
        </Text>
        <View style={styles.btns}>
          <View style={styles.signUp}>
            <CustomButton
              title="Sign up"
              buttonStyle={styles.signUpBtn}
              textStyle={styles.signUpBtnText}
              onPress={() => {
                handleButtonClose();
                router.push({ pathname: '/Onboarding', params: { tab: 'signup' } });
              }}
            />
          </View>
          <View style={styles.login}>
            <CustomButton
              title="Login"
              buttonStyle={styles.loginBtn}
              textStyle={styles.loginBtnText}
              onPress={() => {
                handleButtonClose();
                router.push({ pathname: '/Onboarding', params: { tab: 'login' } });
              }}
            />
          </View>
        </View>
      </View>
    </BottomModal>
  );
};

export default LoginNotificationModal;
const styles = StyleSheet.create({
  iconView: {
    paddingVertical: 16,
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    paddingHorizontal: 44,
    textAlign: "center",
    marginBottom: 11,
    color: "rgba(57, 57, 57, 1)",
    fontSize: 16,
    lineHeight: 20,
  },
  btns: {
    flexDirection: "row",
    paddingVertical: 25,
  },
  signUp: {
    width: "50%",
    marginRight: 5,
  },
  login: {
    width: "50%",
    marginLeft: 5,
  },
  signUpBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(33, 44, 61, 1)",
    padding: 14,
    borderRadius: 12,
  },
  signUpBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "rgba(28, 37, 51, 1)",
    fontFamily: "DMSansMedium",
  },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 59, 74, 1)",
    backgroundColor: "rgba(255, 59, 74, 1)",
    padding: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "white",
    fontFamily: "DMSansMedium",
  },
});
