import React, { useRef, useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";

interface LoaderProps {
  visible: boolean;
  message?: string;
  onAnimationFinish: () => void;
}

const Loader: React.FC<LoaderProps> = ({
  visible,
  message,
  onAnimationFinish,
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
          source={require("../assets/images/loader.json")}
          autoPlay={true}
          loop={false} 
          onAnimationFinish={onAnimationFinish}
        />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Modal>
  );
};

export default Loader;

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#fffffffc",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  lottieView: {
    width: "100%",
    height: "100%",
  },
  message: {
    position: "absolute",
    bottom: 30,
    fontSize: 18,
    color: "#637381",
  },
});
