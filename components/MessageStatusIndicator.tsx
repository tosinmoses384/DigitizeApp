import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { MessageStatus } from "../models/ChatMessage";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

interface MessageStatusIndicatorProps {
  status?: MessageStatus;
  uploadProgress?: number;
  onRetry?: () => void;
}

const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  uploadProgress,
  onRetry,
}) => {
  if (!status || status === "sent") {
    return null;
  }

  if (status === "uploading" && uploadProgress !== undefined) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.light.primaryBase} />
        <Text style={styles.uploadingText}>Uploading {uploadProgress}%</Text>
      </View>
    );
  }

  if (status === "pending") {
    return (
      <View style={styles.container}>
        <Ionicons name="time-outline" size={14} color="#999" />
        <Text style={styles.pendingText}>Sending...</Text>
      </View>
    );
  }

  if (status === "failed") {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={14} color="#FF3B30" />
        <Text style={styles.failedText}>Failed to send</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  uploadingText: {
    fontSize: 12,
    color: Colors.light.primaryBase,
    fontFamily: "DMSansRegular",
    marginLeft: 4,
  },
  pendingText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "DMSansRegular",
    marginLeft: 4,
  },
  failedText: {
    fontSize: 12,
    color: "#FF3B30",
    fontFamily: "DMSansRegular",
    marginLeft: 4,
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 4,
  },
  retryText: {
    fontSize: 11,
    color: "#FFF",
    fontFamily: "DMSansBold",
  },
});

export default React.memo(MessageStatusIndicator);

