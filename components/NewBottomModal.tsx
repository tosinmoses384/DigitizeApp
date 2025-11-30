import React, { ReactNode, useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Easing,
} from "react-native";


interface INewBottomModal {
  /** Callback fired when modal close is initiated */
  onClose: () => void;
  /** Controls modal visibility */
  isShow: boolean;
  /** Modal content */
  children: ReactNode;
  /** Maximum height of modal content */
  maxHeight?: number;
  /** Custom styles for modal content */
  contentStyle?: any;
  /** If true, removes KeyboardAvoidingView wrapper */
  removeKeybordAvoidingView?: boolean;
  /** 
   * Callback fired after modal close animation completes
   * Use this to open another modal sequentially without race conditions
   */
  onCloseComplete?: () => void;
  /** Modal title (optional) */
  title?: string;
}

const NewBottomModal = ({
  onClose,
  isShow,
  children,
  maxHeight,
  contentStyle,
  removeKeybordAvoidingView,
  onCloseComplete,
}: INewBottomModal) => {
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(500))[0]; // start offscreen
  const [internalIsVisible, setInternalIsVisible] = useState(isShow);

  useEffect(() => {
    if (isShow) {
      setInternalIsVisible(true);

      // Smooth, professional modal opening animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0.9,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic), // Smooth deceleration
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fast, smooth closing animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 250,
          easing: Easing.in(Easing.cubic), // Smooth acceleration
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setTimeout(() => {
            setInternalIsVisible(false);
            // Call onCloseComplete after modal is fully closed
            // This ensures animations are complete before any subsequent modals open
            onCloseComplete?.();
          }, 0);
        }
      });
    }
  }, [isShow]);

  return (
    <Modal
      transparent={true}
      visible={internalIsVisible}
      onRequestClose={onClose}
    >
      {removeKeybordAvoidingView ? (
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback
            onPress={() => {
              onClose?.();
              Keyboard.dismiss();
            }}
          >
            <Animated.View
              style={[styles.modalOverlay, { opacity: overlayOpacity }]}
            />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                contentStyle || styles.modalContent,
                {
                  maxHeight: maxHeight || 510,
                  transform: [{ translateY }],
                },
              ]}
            >
              {children}
            </Animated.View>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              onClose?.();
              Keyboard.dismiss();
            }}
          >
            <Animated.View
              style={[styles.modalOverlay, { opacity: overlayOpacity }]}
            />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                contentStyle || styles.modalContent,
                {
                  maxHeight: maxHeight || 510,
                  transform: [{ translateY }],
                },
              ]}
            >
              {children}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
};

export default NewBottomModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    width: "100%",
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end'
  },
});
