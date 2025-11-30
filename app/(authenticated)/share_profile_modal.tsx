import * as React from "react";

import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";

const ProfileShareModal = ({
  visible,
  onClose,
  profileUrl,
}: {
  visible: boolean;
  onClose: () => void;
  profileUrl: string;
}) => {
  const shareUrl = async () => {
    try {
      const result = await Share.share({
        message: `View my profile on DigitizeApp! ${profileUrl}`,
        title: "Profile link",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Dismissed");
      }
    } catch (error) {
      console.error("Error sharing", error);
    }
  };

  const copyProfileLink = async () => {
    try {
      await Clipboard.setStringAsync(profileUrl);
      if (Platform.OS === "android") {
        ToastAndroid.show("Link copied to clipboard!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Copied", "Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Clipboard error:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Share Your Profile</Text>

          <Pressable onPress={shareUrl} style={styles.button}>
            <Text style={styles.buttonText}>Share Link</Text>
          </Pressable>

          <Pressable onPress={copyProfileLink} style={styles.button}>
            <Text style={styles.buttonText}>Copy Link</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ProfileShareModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "600",
  },
  button: {
    padding: 12,
    marginVertical: 8,
    width: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
  },
  closeText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
