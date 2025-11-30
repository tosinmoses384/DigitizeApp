import React, { useCallback, useState, useRef } from "react";
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
import { useI18n } from "../hooks/use-i18n";

interface ICreateCollectionModal {
  onClose: () => void;
  isShow: boolean;
  onSuccess: (collectionId: string, collectionName: string) => void;
  token: string;
  onCloseComplete?: () => void;
}

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

const CreateCollectionModal = ({
  onClose,
  isShow,
  onSuccess,
  token,
  onCloseComplete,
}: ICreateCollectionModal) => {
  const { t } = useI18n();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const descriptionInputRef = useRef<TextInput>(null);

  const createCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await wardrobeServices.createOutfitCollection(data, token);
      return response;
    },
    onSuccess: (response) => {
      if (response?.status === 200 || response?.status === 201) {
        const responseData = (response?.data || {}) as ICreateCollectionResponse;
        const collectionId = responseData?.id || "";
        const collectionTitle = responseData?.name || collectionName;
        
        if (!collectionId) {
          toast.show(t('wardrobe.failedToCreateCollection'), {
            type: "danger",
            duration: 3000,
          });
          return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['collections', token] });
        
        setCollectionName("");
        setCollectionDescription("");
        setNameError("");
        
        onSuccess(collectionId, collectionTitle);
      } else {
        toast.show(response?.message || t('wardrobe.failedToCreateCollection'), {
          type: "danger",
          duration: 3000,
        });
      }
    },
    onError: (error: any) => {
      toast.show(
        error?.message || t('wardrobe.errorOccurred'),
        {
          type: "danger",
          duration: 3000,
        }
      );
    },
  });

  const handleClose = useCallback(() => {
    if (createCollectionMutation.isPending) return;
    
    Keyboard.dismiss();
    setCollectionName("");
    setCollectionDescription("");
    setNameError("");
    onClose();
  }, [onClose, createCollectionMutation.isPending]);

  const handleCreateCollection = useCallback(() => {
    if (createCollectionMutation.isPending) return;

    const trimmedName = collectionName.trim();
    
    if (!trimmedName) {
      setNameError(t('wardrobe.collectionNameRequired'));
      return;
    }

    if (trimmedName.length < 2) {
      setNameError(t('wardrobe.nameMinLength'));
      return;
    }

    Keyboard.dismiss();

    createCollectionMutation.mutate({
      name: trimmedName,
      description: collectionDescription.trim(),
    });
  }, [collectionName, collectionDescription, createCollectionMutation, t]);

  const handleNameChange = useCallback((text: string) => {
    if (text.length <= MAX_NAME_LENGTH) {
      setCollectionName(text);
      if (nameError && text.trim().length >= 2) {
        setNameError("");
      }
    }
  }, [nameError]);

  const handleDescriptionChange = useCallback((text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setCollectionDescription(text);
    }
  }, []);

  const isButtonDisabled = !collectionName.trim() || createCollectionMutation.isPending;

  return (
    <NewBottomModal isShow={isShow} onClose={handleClose} onCloseComplete={onCloseComplete} maxHeight={460}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('wardrobe.createNewCollection')}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeIconView,
              pressed && styles.pressed,
            ]}
            onPress={handleClose}
            disabled={createCollectionMutation.isPending}
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.inputContainer}>
            <AppTextInput
              value={collectionName}
              onChangeText={handleNameChange}
              placeholder={t('wardrobe.enterNameOfCollection')}
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
              editable={!createCollectionMutation.isPending}
            />
          </View>

          <View style={styles.inputContainer}>
            <AppTextInput
              ref={descriptionInputRef}
              value={collectionDescription}
              onChangeText={handleDescriptionChange}
              placeholder={t('wardrobe.describeCollection')}
              placeholderTextColor="#9CA3AF"
              customBackgroundColor="#F3F4F6"
              customBorderRadius={12}
              isMultiline
              multilineHeight={120}
              inputStyle={styles.customInput}
              maxLength={MAX_DESCRIPTION_LENGTH}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              editable={!createCollectionMutation.isPending}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t('wardrobe.createCollection')}
              buttonStyle={[ styles.btn,
                isButtonDisabled
                  ? styles.createButtonDisabled
                  : styles.createButton]
              }
              textStyle={
                isButtonDisabled
                  ? styles.createButtonTextDisabled
                  : styles.createButtonText
              }
              onPress={handleCreateCollection}
              loader={createCollectionMutation.isPending}
            />
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default CreateCollectionModal;

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
  createButton: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonDisabled: {
    backgroundColor: "#FFD8DB",
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
  createButtonTextDisabled: {
    textAlign: "center",
    color: "#FFAAAF",
    fontSize: 16,
    fontFamily: "DMSansSemiBold",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  }
});

