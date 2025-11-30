import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { Colors } from "@constants/Colors";
import { RoundedPlus } from "@assets/icons/roundedPlus";
import { CollectionIcon } from "@assets/icons/collectionIcon";
import { useI18n } from "../hooks/use-i18n";

interface IAddToCollectionModal {
  onClose: () => void;
  isShow: boolean;
  onAddFromOutfits: () => void;
  onCreateNewOutfits: () => void;
  onCloseComplete?: () => void;
}

const AddToCollectionModal = ({
  onClose,
  isShow,
  onAddFromOutfits,
  onCreateNewOutfits,
  onCloseComplete,
}: IAddToCollectionModal) => {
  const { t } = useI18n();
  
  const handleAddFromOutfits = useCallback(() => {
    onAddFromOutfits();
  }, [onAddFromOutfits]);

  const handleCreateNewOutfits = useCallback(() => {
    onCreateNewOutfits();
  }, [onCreateNewOutfits]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <NewBottomModal isShow={isShow} onClose={handleClose} onCloseComplete={onCloseComplete} maxHeight={280}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('wardrobe.outfitCreation')}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeIconView,
              pressed && styles.pressed,
            ]}
            onPress={handleClose}
          >
            <CloseIcon />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.pressed,
            ]}
            onPress={handleAddFromOutfits}
          >
            <View style={styles.iconContainer}>
              <CollectionIcon />
            </View>
            <Text style={styles.optionText}>{t('wardrobe.createACollection')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.pressed,
            ]}
            onPress={handleCreateNewOutfits}
          >
            <View style={styles.iconContainer}>
              <View style={styles.plusIcon}>
                <RoundedPlus />
              </View>
            </View>
            <Text style={styles.optionText}>{t('wardrobe.createNewOutfit')}</Text>
          </Pressable>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default AddToCollectionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 12,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  headerText: {
    textAlign: "center",
    color: "#071827",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  closeIconView: {
    position: "absolute",
    right: 0,
    top: 16,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  listIcon: {
    width: 24,
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    position: "relative",
  },
  plusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    fontSize: 20,
    color: "#6B7280",
    fontFamily: "DMSansMedium",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "DMSansRegular",
  },
});

