import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";

interface IBottomModal {
  onClose: () => void;
  isShow: boolean;
  children: ReactNode;
  modalHeight?: number;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const BottomModal = ({ onClose, isShow, children, modalHeight = 400 }: IBottomModal) => {
  const [internalIsVisible, setInternalIsVisible] = useState(isShow);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isShow) {
      setInternalIsVisible(true);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalIsVisible(false);
        onClose?.();
      });
    }
  }, [isShow]);

  if (!internalIsVisible) return null;

  return (
    <Modal transparent visible={internalIsVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{ translateY: slideAnim }],
              maxHeight: modalHeight,
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardAvoiding}
          >
            <TouchableOpacity activeOpacity={1} style={styles.touchableContent}>
              {children}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
  animatedContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  keyboardAvoiding: {
    width: "100%",
  },
  touchableContent: {
    width: "100%",
  },
});

export default BottomModal;
