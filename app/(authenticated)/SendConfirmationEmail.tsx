import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { useAppSelector } from "@redux/store";
import { router } from "expo-router";

import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const SendConfirmationEmail = () => {
  const { profile } = useAppSelector((state) => state.userProfileSlice);

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Confirm Change"}
          onPress={() => router.push("/security")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.bodyTitle}>
          You need to confirm{" "}
          <Text style={styles.email}>{profile?.emailAddress || "N/A"}</Text> is
          your email address before you can update it
        </Text>
        <View style={{ marginBottom: 26 }}>
          <CustomButton
            title="Send confirmation email"
            buttonStyle={styles.btnContainer}
            textStyle={styles.btnText}
          />
        </View>
        <Pressable>
          <Text style={styles.idontHaveAccess}>
            I don’t have access to this mail
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default SendConfirmationEmail;

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
    marginTop: 24,
  },

  bodyTitle: {
    fontSize: 14,
    color: "#637381",
    fontFamily: "DMSansRegular",
    marginBottom: 24,
  },
  email: {
    color: "#1C2533",
  },
  btnContainer: {
    backgroundColor: "#FF3B4A",
  },
  btnText: {
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    color: "#FFFFFF",
  },
  idontHaveAccess: {
    textAlign: "center",
    color: "#FF3B4A",
    fontSize: 16,
    fontFamily: "DMSansMedium",
  },
});
