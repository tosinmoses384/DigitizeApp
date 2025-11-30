import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Modal, SafeAreaView } from "react-native";
import { Platform, Text, View } from "react-native";
import MyResponsiveGrid from "@components/MyResponsiveGrid";
import { useAppSelector } from "@redux/store";
import { useI18n } from "@hooks/use-i18n";

interface HelpCenterModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const HelpCenterModal = ({ isVisible, onClose }: HelpCenterModalProps) => {
  const { t } = useI18n();
  const { helpCenterCategory } = useAppSelector(
    (state) => state.helpCenteCategorySlice
  );
  const [cardWidth, setCardWidth] = useState(172);

  const template = helpCenterCategory?.map((list: any) => {
    return (
      <Pressable
        key={list?.id}
        style={({ pressed }) => [
          styles.card,
          { width: cardWidth, ...(pressed ? { opacity: 0.5 } : null) },
        ]}
        onPress={() => {
          onClose();
          router.push(`/helpCenter/${list?.id}`);
        }}
      >
        <View style={styles.icon}>
          <Image
            source={{ uri: list?.imageUrl }}
            style={{ width: 84, height: 64, objectFit: "contain" }}
          />
        </View>
        <Text style={styles.title}>{list?.name}</Text>
      </Pressable>
    );
  });

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
          <StackHeader
            title={t('helpCenter.helpCentre')}
            onPress={onClose}
            isShowHeaderShadow
          />
          <ScrollView style={styles.wrapper}>
            <View style={{ paddingBottom: 20 }}>
              <MyResponsiveGrid
                template={template}
                getNumberOfRows={(data: any) => setCardWidth(data)}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default HelpCenterModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  wrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 1)",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  icon: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    color: "rgba(144, 149, 158, 1)",
    textAlign: "center",
    textTransform: "capitalize",
  },
});

