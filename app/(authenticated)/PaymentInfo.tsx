import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import EmailAndPhoneNumber from "@components/EmailAndPhonenumber";
import DebitCardIcon from "../../assets/images/svg/debit-card-icon.svg";
import MasterCardIcon from "../../assets/images/svg/master-card-icon.svg";
import AppTextInput from "@components/AppTextInput";
import { useFormik } from "formik";
import * as Yup from "yup";
import InfoGreenIcon from "../../assets/images/svg/info-green.svg";

const PaymentInfoScreen = () => {
  const addItemsValidationSchema = Yup?.object()?.shape({
    // name: Yup.string().required("Required"),
    // expDate: Yup.string().required("Required"),
    // code: Yup.string().required("Required"),
    // cardNumber: Yup.string().required("Required"),
    name: Yup.string().required("Required"),
    expDate: Yup.string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid month or format MM/YY")
      .required("Required"),
    code: Yup.string()
      .matches(/^\d+$/, "Code must be numbers only")
      .min(3, "Code must be at least 3 digits")
      .max(4, "Code must be at most 4 digits")
      .required("Required"),
    cardNumber: Yup.string()
      .matches(/^\d+$/, "Card number must be numbers only")
      .min(13, "Card number must be at least 13 digits")
      .max(19, "Card number must be at most 19 digits")
      .required("Required"),

      
  });


  const handleExpiryChange = (value: string) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, "");
    // Limit to 4 digits (MMYY)
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4);
    }
    // Format into MM/YY
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
  
    addItemFormik.setFieldValue("expDate", cleaned);
  };
  






  const addItemFormik = useFormik({
    validationSchema: addItemsValidationSchema,
    initialValues: {
      name: "",
      cardNumber: "",
      expDate: "",
      code: "",
    },
    onSubmit: async (values: any) => {},
  });

  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={"Card details"}
          onPress={() => router.push("/payments")}
          isShowHeaderShadow
        />
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.title}>Card details</Text>
        <Text style={styles.subtitle}>
          Please provide the account details for easy funds withdrawal from your
          wallet
        </Text>
        <View style={styles.container}>
          <View style={styles.containerTitle}>
            <DebitCardIcon />
            <Text style={styles.containerTitleText}>
              Add Credit / Debit Card
            </Text>
          </View>
          <View style={{ marginVertical: 16 }}>
            <AppTextInput
              onChangeText={(value) =>
                addItemFormik.setFieldValue("name", value)
              }
              value={addItemFormik?.values?.name}
              error={addItemFormik.submitCount > 0 && addItemFormik.errors.name}
              placeholder="Card Holder’s Name"
              // labelStyle={{ paddingHorizontal: 10 }}
              label="Card Holder’s Name"
              isShowInnerLabel
            />
          </View>
          <View style={{ marginVertical: 16 }}>
            <AppTextInput
              onChangeText={(value) =>
                addItemFormik.setFieldValue("cardNumber", value)
              }
              value={addItemFormik?.values?.cardNumber}
            keyboardType="numeric"
            
              error={
                addItemFormik.submitCount > 0 && addItemFormik.errors.cardNumber
              }
              placeholder="Card Number"
              // labelStyle={{ paddingHorizontal: 10 }}
              label="Card Number"
              iconRight={<MasterCardIcon />}
              isShowInnerLabel
            />
          </View>
          <View
            style={{
              marginVertical: 16,
              flexDirection: "row",
              gap: 10,
              flex: 1,
            }}
          >
            <View style={{ flex: 2 }}>
              <AppTextInput
                // onChangeText={(value) =>
                //   addItemFormik.setFieldValue("expDate", value)
                // }
                // value={addItemFormik?.values?.expDate}
                // keyboardType="numeric"
               
                // error={
                //   addItemFormik.submitCount > 0 && addItemFormik.errors.expDate
                // }
                // placeholder="Expiry Date"
                // // labelStyle={{ paddingHorizontal: 10 }}
                // label="Expiry Date"
                // isShowInnerLabel

                onChangeText={handleExpiryChange}
                value={addItemFormik?.values?.expDate}
                keyboardType="numeric"
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.expDate
                }
                // placeholder="MM/YY"
                placeholder="Expiry Date"
                label="Expiry Date"
                isShowInnerLabel
                maxLength={5} // restricts to MM/YY length





              />
            </View>
            <View style={{ flex: 2 }}>
              <AppTextInput
                onChangeText={(value) =>
                  addItemFormik.setFieldValue("code", value)
                }
                keyboardType="numeric"
                value={addItemFormik?.values?.code}
                error={
                  addItemFormik.submitCount > 0 && addItemFormik.errors.code
                }
                placeholder="Security Code"
                // labelStyle={{ paddingHorizontal: 10 }}
                label="Security Code"
                isShowInnerLabel
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                paddingBottom: 16,
              }}
            >
              <InfoGreenIcon />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomView}>
        <CustomButton
          title="Use this card"
          buttonStyle={styles.btnContainer}
          textStyle={styles.btnText}
          onPress={addItemFormik.handleSubmit}
        />
      </View>
    </View>
  );
};

export default PaymentInfoScreen;

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
  title: {
    fontSize: 18,
    color: "#071827",
    fontFamily: "DMSansSemiBold",
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#5C6F7F",
    marginBottom: 24,
  },
  container: {
    borderWidth: 1,
    borderColor: "#919EAB33",
    padding: 12,
    borderRadius: 8,
  },
  containerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  containerTitleText: {
    fontSize: 15,
    color: "#212B36",
    marginLeft: 16,
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
});
