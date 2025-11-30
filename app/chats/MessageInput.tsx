import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CameraIcon from "../../assets/images/svg/camera.svg";
import Send from "../../assets/images/svg/send.svg";
import { useOptimizedImagePicker } from "@hooks/useOptimizedImagePicker";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";
import { Colors } from "../../constants/Colors";
import { fontSz } from "../../constants";

type MessageInputProps = {
  onSendText: (text: string) => void;
  onSendImage: (localImageUri: string, messageText: string) => Promise<void>;
  isOffline?: boolean;
};

const MessageInput: React.FC<MessageInputProps> = React.memo(({
  onSendText,
  onSendImage,
  isOffline = false,
}) => {
  const { t } = useI18n();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [toastDetails, setToastDetails]: any = useState(null);
  const [isSending, setIsSending] = useState(false);

  const {
    pickImageFromGallery,
    isProcessing,
    processingProgress,
    error: pickerError,
    clearError: clearPickerError,
  } = useOptimizedImagePicker({
    maxFileSize: 1.9 * 1024 * 1024,
    maxResolution: null,
    quality: 0.9,
    format: 'auto',
    enableCropping: false,
    enableProgressTracking: true,
    enablePerformanceMonitoring: true,
    enableAdvancedRecovery: true,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: true,
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: 'balanced',
      enableEnhancement: false,
      enableBackgroundRemoval: false,
    },
    backgroundRemoval: {
      trim: true,
      timeout: 30000,
      enableDeviceCheck: true,
    },
    performance: {
      enableMonitoring: true,
      enableAlerts: true,
      memoryThreshold: 100 * 1024 * 1024,
      processingTimeThreshold: 15000,
    },
    fallback: {
      enableFallbackCompression: true,
      fallbackQuality: 0.6,
      maxRetryAttempts: null,
      enableParameterAdjustment: true,
      timeoutMs: 30000,
    },
  });

  const handleSendMessage = async () => {
    if (isSending) return;

    if (images?.length) {
      const currentMessage = message;
      const currentImage = images[0];
      
      setIsSending(true);
      setImages([]);
      setMessage("");
      
      try {
        await onSendImage(currentImage.uri, currentMessage);
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (message.trim()) {
      const currentMessage = message;
      setMessage("");
      onSendText(currentMessage);
    }
  };

  const pickImage = async () => {
    if (!token) {
      return dispatch(setIsShownLoginModal(true));
    }

    try {
      const result = await pickImageFromGallery();
      
      if (result) {
        setImages([{
          uri: result.uri,
          type: "image",
          mimeType: `image/${result.format}`,
          fileName: `image.${result.format}`,
          fileSize: result.fileSize,
        }]);
      }
    } catch {
      if (pickerError) {
        setToastDetails({
          message: pickerError.message || t('chat.failedToProcessImage'),
          type: "error",
          duration: 4000,
        });
        clearPickerError();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
        {images?.length > 0 && (
          <View style={styles.imagePreview}>
            <View style={styles.imagePreviewContainer}>
              <Pressable
                style={({ pressed }) => [
                  pressed && styles.pressed,
                  styles.closeContainer,
                  isSending && styles.buttonDisabled,
                ]}
                onPress={isSending ? undefined : () => { setImages([]); }}
                disabled={isSending}
                accessibilityLabel={t('chat.removeImage')}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={18} color={"black"} />
              </Pressable>
              <Image
                source={{ uri: images?.[0]?.uri }}
                style={{ width: "100%", height: "100%", borderRadius: 10 }}
              />
              {isProcessing && (
                <View style={styles.processingOverlay}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.processingText}>
                    {t('chat.processing')} {t('chat.percentProgress', { percent: Math.round(processingProgress * 100) })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          {(toastDetails || pickerError) && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: "-100%",
                left: 0,
              }}
            >
              <CustomToastNotification
                message={toastDetails?.message || pickerError?.message}
                type={toastDetails?.type || "error"}
                autoHideDuration={toastDetails?.duration || 4000}
              />
            </View>
          )}
          <TouchableOpacity
            onPress={isProcessing ? () => {} : (isOffline ? () => {} : pickImage)}
            style={[styles.cameraButton, isOffline && styles.buttonDisabled]}
            disabled={isOffline || isProcessing}
            accessibilityLabel={t('chat.selectImage')}
            accessibilityRole="button"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.light.primaryBase} />
            ) : (
              <CameraIcon />
            )}
          </TouchableOpacity>
          <TextInput
            style={[styles.input, isOffline && styles.inputDisabled]}
            placeholder={
              isOffline 
                ? t('chat.noInternetConnection')
                : t('chat.writeMessage')
            }
            value={message}
            onChangeText={setMessage}
            editable={!isOffline}
            accessibilityLabel={t('chat.messages')}
          />
          {!isProcessing && (
            <TouchableOpacity
              onPress={(isOffline || isSending) ? undefined : handleSendMessage}
              style={[styles.sendButton, (isOffline || isSending) && styles.buttonDisabled]}
              disabled={isOffline || isSending}
              accessibilityLabel={t('chat.send')}
              accessibilityRole="button"
            >
              {isSending ? (
                <ActivityIndicator size="small" color={Colors.light.primaryBase} />
              ) : (
                <Send />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

MessageInput.displayName = 'MessageInput';

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
  },
  inputDisabled: {
    backgroundColor: "#e8e8e8",
    color: "#999999",
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
  },
  cameraButton: {
    padding: 10,
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  imagePreview: {
    backgroundColor: "transparent",
    padding: 16,
  },
  imagePreviewContainer: {
    width: 130,
    height: 130,
    borderRadius: 10,
    backgroundColor: "white",
    position: "relative",
  },
  pressed: {
    opacity: 0.5,
  },
  closeContainer: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "white",
    width: 25,
    height: 25,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "silver",
    right: 5,
    top: 5,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  processingText: {
    color: "white",
    fontSize: 12,
    fontFamily: "DMSansMedium",
    marginTop: 5,
  },
});

export default MessageInput;

