import React from "react";
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImageData } from "@components/ImageDescriptionModal/types";
import { useI18n } from "@hooks/use-i18n";

import { Video, ResizeMode } from "expo-av";

interface ExtendedImageData extends ImageData {
  type?: "image" | "video";
}

interface ImageModalProps {
  visible: boolean;
  images: ImageData[];
  selectedIndex: number | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  visible,
  images,
  selectedIndex,
  onClose,
}) => {
  const { t } = useI18n();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (!visible || selectedIndex === null || !images[selectedIndex]) {
    return null;
  }

  const selectedImage = images[selectedIndex] as ExtendedImageData;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <StatusBar
          backgroundColor="rgba(0, 0, 0, 0.9)"
          barStyle="light-content"
        />
        <TouchableOpacity
          style={styles.modalCloseArea}
          onPress={onClose}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            {selectedImage.type === "video" ? (
              <Video
                source={{ uri: selectedImage.uri }}
                style={styles.modalImage}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
              />
            ) : (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            <View style={styles.modalInfo}>
              <Text style={styles.modalImageNumber}>
                {selectedIndex + 1} {t('upload.imageOf')} {images.length}
              </Text>
              <Text style={styles.modalSizeInfo}>
                {formatFileSize(selectedImage.originalFileSize ?? 0)} →{" "}
                {formatFileSize(selectedImage.fileSize ?? 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Close Button */}
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>×</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "90%",
  },
  modalInfo: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  modalImageNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "DMSans",
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
  modalSizeInfo: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "DMSans",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
});
