import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TextInput,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import NewBottomModal from "@components/NewBottomModal";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { Colors } from "@constants/Colors";
import CustomButton from "@components/CustomButton";
import AppTextInput from "@components/AppTextInput";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { ICreateCollectionResponse } from "@services/features/wardrobe-service/types";
import { useToast } from "react-native-toast-notifications";

interface IEditCollectionModal {
  onClose: () => void;
  isShow: boolean;
  collectionId: string;
  currentTitle: string;
  currentDescription: string;
  token: string;
  onSuccess: (title: string, description: string) => void;
}

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

const EditCollectionModal = ({
  onClose,
  isShow,
  collectionId,
  currentTitle,
  currentDescription,
  token,
  onSuccess,
}: IEditCollectionModal) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [collectionName, setCollectionName] = useState(currentTitle);
  const [collectionDescription, setCollectionDescription] = useState(
    currentDescription,
  );
  const [nameError, setNameError] = useState("");
  const descriptionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isShow) {
      setCollectionName(currentTitle);
      setCollectionDescription(currentDescription);
      setNameError("");
    }
  }, [isShow, currentTitle, currentDescription]);

  const updateCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await wardrobeServices.updateOutfitCollection(
        collectionId,
        data,
        token,
      );
      return response;
    },
    onSuccess: (response) => {
      if (response?.status === 200) {
        const responseData = (response?.data || {}) as ICreateCollectionResponse;
        const updatedTitle = responseData?.name || collectionName;
        const updatedDescription = responseData?.description || collectionDescription;

        queryClient.invalidateQueries({ queryKey: ['collections', token] });

        setCollectionName("");
        setCollectionDescription("");
        setNameError("");

        onSuccess(updatedTitle, updatedDescription);

        toast.show("Collection updated successfully", {
          type: "success",
          duration: 3000,
        });
      } else {
        toast.show(response?.message || "Failed to update collection", {
          type: "danger",
          duration: 3000,
        });
      }
    },
    onError: (error: any) => {
      toast.show(
        error?.message || "An error occurred. Please try again.",
        {
          type: "danger",
          duration: 3000,
        },
      );
    },
  });

  const handleClose = useCallback(() => {
    if (updateCollectionMutation.isPending) return;

    Keyboard.dismiss();
    setNameError("");
    onClose();
  }, [onClose, updateCollectionMutation.isPending]);

  const handleUpdateCollection = useCallback(() => {
    if (updateCollectionMutation.isPending) return;

    const trimmedName = collectionName.trim();

    if (!trimmedName) {
      setNameError("Collection name is required");
      return;
    }

    if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    Keyboard.dismiss();

    updateCollectionMutation.mutate({
      name: trimmedName,
      description: collectionDescription.trim(),
    });
  }, [collectionName, collectionDescription, updateCollectionMutation]);

  const handleNameChange = useCallback(
    (text: string) => {
      if (text.length <= MAX_NAME_LENGTH) {
        setCollectionName(text);
        if (nameError && text.trim().length >= 2) {
          setNameError("");
        }
      }
    },
    [nameError],
  );

  const handleDescriptionChange = useCallback((text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setCollectionDescription(text);
    }
  }, []);

  const isButtonDisabled =
    !collectionName.trim() || updateCollectionMutation.isPending;

  return (
    <NewBottomModal 
      isShow={isShow} 
      onClose={handleClose} 
      maxHeight={460}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Collection</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeIconView,
              pressed && styles.pressed,
            ]}
            onPress={handleClose}
            disabled={updateCollectionMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.inputContainer}>
            <AppTextInput
              value={collectionName}
              onChangeText={handleNameChange}
              placeholder="Enter Name of Collection"
              placeholderTextColor="#9CA3AF"
              customBackgroundColor="#F3F4F6"
              customBorderRadius={12}
              inputHeight={56}
              inputStyle={styles.customInput}
              errorMessageStyle={styles.customErrorText}
              error={nameError}
              maxLength={MAX_NAME_LENGTH}
              returnKeyType="next"
              onSubmitEditing={() => descriptionInputRef.current?.focus()}
              blurOnSubmit={false}
              editable={!updateCollectionMutation.isPending}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppTextInput
              ref={descriptionInputRef}
              value={collectionDescription}
              onChangeText={handleDescriptionChange}
              placeholder="Describe this collection (Optional)"
              placeholderTextColor="#9CA3AF"
              customBackgroundColor="#F3F4F6"
              customBorderRadius={12}
              isMultiline
              multilineHeight={120}
              inputStyle={styles.customInput}
              maxLength={MAX_DESCRIPTION_LENGTH}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              editable={!updateCollectionMutation.isPending}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Update Collection"
              buttonStyle={[
                styles.btn,
                isButtonDisabled
                  ? styles.updateButtonDisabled
                  : styles.updateButton,
              ]}
              textStyle={
                isButtonDisabled
                  ? styles.updateButtonTextDisabled
                  : styles.updateButtonText
              }
              onPress={handleUpdateCollection}
              loader={updateCollectionMutation.isPending}
            />
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default EditCollectionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    position: "relative",
  },
  headerText: {
    textAlign: "left",
    color: "#111827",
    fontSize: 18,
    fontFamily: "DMSansSemiBold",
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.5,
  },
  closeIconView: {
    position: "absolute",
    right: 0,
    top: 8,
    padding: 4,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  customInput: {
    fontSize: 15,
    fontFamily: "DMSansRegular",
    color: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  customErrorText: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "DMSansRegular",
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  updateButton: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 16,
    borderRadius: 12,
  },
  updateButtonDisabled: {
    backgroundColor: "#FFD8DB",
    paddingVertical: 16,
    borderRadius: 12,
  },
  updateButtonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
  updateButtonTextDisabled: {
    textAlign: "center",
    color: "#FFAAAF",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

