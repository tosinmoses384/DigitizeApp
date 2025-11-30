import React, { forwardRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import Pics1 from "../../assets/images/svg/pics1.svg";
import Pics2 from "../../assets/images/svg/pics2.svg";
import { useI18n } from "../../hooks/use-i18n";

const { width: screenWidth } = Dimensions.get("window");

interface PhotoTipsModalProps {
  onClose?: () => void;
}

const PhotoTipsModal = forwardRef<BottomSheetModal, PhotoTipsModalProps>(
  ({ onClose }, ref) => {
    const { t } = useI18n();
    const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

    const handleSheetChanges = useCallback((index: number) => {
      // Handle sheet changes if needed
    }, []);

    const handleCloseModal = useCallback(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
      onClose?.();
    }, [ref, onClose]);

    const photoTipsData = [
      {
        image1: (
          <Pics1
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        image2: (
          <Pics2
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        text: t('upload.wellLitAreaDescription'),
        text1: t('upload.chooseNaturalLight'),
      },
      {
        image1: (
          <Pics1
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        image2: (
          <Pics1
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        text: t('upload.wellLitAreaDescription'),
        text1: t('upload.pickNeutralBackground'),
      },
      {
        image1: (
          <Pics1
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        image2: (
          <Pics1
            width={screenWidth * 0.4}
            height={screenWidth * 0.45}
          />
        ),
        text: t('upload.wellLitAreaDescription'),
        text1: t('upload.dontUseFlash'),
      },
    ];

    return (
      <BottomSheetModal
        ref={ref}
        index={2}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enableDismissOnClose={true}
        enablePanDownToClose={true}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{t('upload.photoTips')}</Text>
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={handleCloseModal}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
        >
          {photoTipsData.map(({ image1, image2, text, text1 }, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.rowTextMain}>{text1}</Text>

              <View style={styles.imageContainerPics}>
                {image1}
                {image2}
              </View>
              <Text style={styles.rowText}>{text}</Text>
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

PhotoTipsModal.displayName = "PhotoTipsModal";

export default PhotoTipsModal;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    textAlign: "center",
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeIconContainer: {
    position: "absolute",
    right: 10,
    zIndex: 1,
  },
  rowText: {
    textAlign: "left",
    paddingTop: 10,
    color: "#787878",
    fontFamily: "DMSans",
  },
  rowTextMain: {
    textAlign: "left",
    paddingTop: 10,
    fontFamily: "DMSans",
    fontWeight: "bold",
  },
  imageContainerPics: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    gap: 20,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tipItem: {
    marginBottom: 24,
  },
});
