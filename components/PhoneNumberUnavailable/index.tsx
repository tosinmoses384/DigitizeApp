import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Dimensions } from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import EnterPhoneNumber from "@components/EnterPhoneNumber";
import { Colors } from "@constants/Colors";
import { useI18n } from "@hooks/use-i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface IPhoneNumberUnavailable {
  onAddPress?: () => void;
}

const PhoneNumberUnavailable = ({ onAddPress }: IPhoneNumberUnavailable) => {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);

  const handleAddPress = () => {
    setShowModal(true);
    onAddPress?.();
  };

  const handleSave = () => {
    setShowModal(false);
    // Handle save logic here
  };

  return (
    <>
      <View style={styles.nophone}>
        <View style={styles.storeSetup}>
          <View style={styles.item}>
            <View style={styles.phoneNumberUnavailableWrapper}>
              <Text style={styles.phoneNumberUnavailable}>
                {t('settings.phoneNumberUnavailable')}
              </Text>
            </View>
            <Pressable style={styles.addToCart} onPress={handleAddPress}>
              <Text style={styles.add}>{t('settings.add')}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <NewBottomModal
        isShow={showModal}
        onClose={() => setShowModal(false)}
        removeKeybordAvoidingView={true}
        maxHeight={SCREEN_HEIGHT}
        contentStyle={{
          backgroundColor: Colors.light.background,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          height: SCREEN_HEIGHT,
          width: "100%",
          maxHeight: SCREEN_HEIGHT,
          minHeight: SCREEN_HEIGHT,
        }}
      >
        <EnterPhoneNumber 
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      </NewBottomModal>
    </>
  );
};

export default PhoneNumberUnavailable;

const styles = StyleSheet.create({
  nophone: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  storeSetup: {
    width: "100%",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  phoneNumberUnavailableWrapper: {
    flex: 1,
  },
  phoneNumberUnavailable: {
    fontSize: 12,
    color: "#393939",
    fontFamily: "DMSansMedium",
  },
  addToCart: {
    borderWidth: 1,
    borderColor: "#1C2533",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  add: {
    fontSize: 12,
    color: "#464F5D",
    fontFamily: "DMSansMedium",
  },
});

