import React from "react";
import { View, Text, ScrollView, Platform, StyleSheet, Modal, SafeAreaView } from "react-native";
import { Colors, SIZES } from "../constants/Colors";
import StackHeader from "../components/StackHeader";
import { useI18n } from "@hooks/use-i18n";
import { fontSz } from "../constants";

interface ItemVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ItemVerificationModal = ({ isVisible, onClose }: ItemVerificationModalProps) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          }}
        >
          <StackHeader title={t('aboutPages.itemVerification')} onPress={onClose} />

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Shop with confidence</Text>
              <Text style={styles.subtitle}>
                Item Verification (Coming Soon) - we are working in the background……..
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ItemVerificationModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSz(28),
    color: "#212C3D",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSz(18),
    color: "#1E2226",
    textAlign: 'center',
    lineHeight: fontSz(26),
    fontFamily: "DMSansRegular",
  },
});

