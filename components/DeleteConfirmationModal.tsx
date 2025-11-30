import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import DeleteIcon from "../assets/images/svg/delete-btn.svg";

interface IDeleteConfirmationModal {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  type?: "danger" | "warning" | "info";
}

const DeleteConfirmationModal: React.FC<IDeleteConfirmationModal> = ({
  isVisible,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  type = "danger",
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case "danger":
        return {
          backgroundColor: loading ? "#ccc" : "#D4313E",
          borderColor: "#D4313E",
        };
      case "warning":
        return {
          backgroundColor: loading ? "#ccc" : "#FF8C00",
          borderColor: "#FF8C00",
        };
      case "info":
        return {
          backgroundColor: loading ? "#ccc" : "#007AFF",
          borderColor: "#007AFF",
        };
      default:
        return {
          backgroundColor: loading ? "#ccc" : "#D4313E",
          borderColor: "#D4313E",
        };
    }
  };

  return (
    <NewBottomModal
      isShow={isVisible}
      onClose={onClose}
      maxHeight={300}
      contentStyle={{
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 0,
        width: "100%",
        flex: 1,
      }}
    >
      <View style={{ padding: 16, alignItems: "center" }}>
        <View style={{ marginBottom: 19 }}>
          <DeleteIcon width={71} height={71} />
        </View>
        <Text style={{ color: "#393939", fontSize: 18, fontFamily: "DMSansSemiBold", textAlign: "center", marginBottom: 8 }}>
          {title}
        </Text>
        <Text style={{ color: "#393939", fontSize: 16, textAlign: "center", marginBottom: 18 }}>
          {message}
        </Text>
        <View style={{ flexDirection: "row", width: "100%", marginTop: 20, paddingHorizontal: 16 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Pressable
              onPress={onClose}
              style={{
                borderWidth: 1.5,
                borderColor: "#212C3D",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            >
              <Text style={{ color: "#212C3D", fontSize: 16, fontFamily: "DMSansSemiBold" }}>
                {cancelText}
              </Text>
            </Pressable>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={{
                ...getButtonStyles(),
                borderWidth: 1.5,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontFamily: "DMSansSemiBold" }}>
                {loading ? "Deleting..." : confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default DeleteConfirmationModal;
