import LottieView from "lottie-react-native";
import React, { useRef, useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import FilledButton from "./buttons/Filled_button";
import { router } from "expo-router";
import { fontSz, waitFor } from "../constants";

interface LoaderProps {
  visible: boolean;
  message?: string;
  messagebody?: string;
  onAnimationFinish: () => void;
  close?: () => void;
  routePath?: any;
  buttonTitle?: string;
}

const Success: React.FC<LoaderProps> = ({
  visible,
  message,
  messagebody,
  onAnimationFinish,
  close,
  routePath,
  buttonTitle,
}) => {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      animation.current?.play();
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.animationContainer}>
        <LottieView
          ref={animation}
          style={styles.lottieView}
          source={require("../assets/images/success.json")}
          autoPlay={true}
          loop={true}
          onAnimationFinish={onAnimationFinish}
        />

        {message && <Text style={styles.message}>{message}</Text>}
        {messagebody && <Text style={styles.body}>{messagebody}</Text>}

        <View style={{ paddingVertical: 10, marginTop: 60 }}>
          <FilledButton
            title={buttonTitle}
            onPress={() => {
              router.replace(routePath);
              waitFor(3000);
              close?.();
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default Success;

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#fffffffc",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  lottieView: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  message: {
    fontSize: fontSz(22),
    color: "#212B36",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "FigtreeBold",
  },
  body: {
    fontSize: fontSz(16),
    color: "#637381",
    textAlign: "center",
    fontFamily: "FigtreeRegular",
    marginHorizontal: 20,
  },
});
