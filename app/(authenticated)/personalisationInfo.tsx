import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { defaultStyles } from "../../constants/Styles";
import StackHeader, { ResourcesHeader } from "../../components/StackHeader";
import { router } from "expo-router";
import { Colors, SIZES } from "../../constants/Colors";
import { Platform } from "react-native";

const PersonalisationInfo = () => {
  const steps = [
    "Click Profile and then Personalisation",
    "Select categories you’re interested in",
    "Choose your preferred clothing sizes",
    "Follow brands you like",
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <ResourcesHeader title="Personalisation" onPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={defaultStyles.header}>What is Personalisation?</Text>
        <Text style={defaultStyles.descriptionText}>IOS/ANDROID WEBSITE</Text>
        <Text style={defaultStyles.descriptionText}>
          You can personalise your DigitizeApp feed so it’s easier to find your
          favourite brands and best fits
        </Text>
        <Text
          style={[
            defaultStyles.descriptionText,
            { fontFamily: "DMSansBold", color: Colors.light.black },
          ]}
        >
          How it works
        </Text>

        {steps.map((step, index) => (
          <Text key={index} style={defaultStyles.descriptionText}>
            {index + 1}.{" "}
            {step.includes("Profile") ? (
              <>
                Click
                <Text
                  style={{
                    fontFamily: "DMSansBold",
                    color: Colors.light.black,
                  }}
                >
                  {" "}
                  Profile
                </Text>{" "}
                and then{" "}
                <Text
                  style={{
                    fontFamily: "DMSansBold",
                    color: Colors.light.black,
                  }}
                >
                  Personalisation
                </Text>
              </>
            ) : (
              step
            )}
          </Text>
        ))}

        <Text style={defaultStyles.descriptionText}>
          For example, you can choose the women category and clothing size 10
        </Text>
      </ScrollView>
    </View>
  );
};

export default PersonalisationInfo;

const styles = StyleSheet.create({});
