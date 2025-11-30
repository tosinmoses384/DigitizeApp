import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Image,
  Pressable,
} from "react-native";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
import { TouchableOpacity } from "react-native-gesture-handler";
import SeeAllIcon from "../assets/images/svg/seeAllIcon.svg";
import { ScrollView } from "react-native";
import SearchInput from "../components/SearchInput";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import CustomButton from "@components/CustomButton";
interface ISelecParcelModal {
  onClose: any;
  isShow: boolean;
  name: string;
  onSelect: any;
  value: string;
}
const SelecParcelModal = ({
  onClose,
  isShow,
  name,
  onSelect,
  value,
}: ISelecParcelModal) => {
  const { parcelSize } = useAppSelector((state) => state?.parcelSizeSlice);

  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.wrapper]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              pressed && styles.pressed,
              styles.backwrapper,
            ]}
            onPress={onClose}
          >
            <Ionicons
              name="chevron-back"
              color={"rgba(70, 79, 84, 1)"}
              size={20}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Parcel Size</Text>
        </View>

        <ScrollView style={styles.body}>
          {parcelSize?.map((item: any) => (
            <Pressable
              style={({ pressed }) => [
                pressed && styles.pressed,
                styles.bodyWithChildren,
              ]}
              key={item.id}
              onPress={() => {
                onSelect({
                  target: { value: item.label, name, id: item.id },
                });
              }}
            >
              <View style={styles.bodyWithChildrenName}>
                <View>
                  <Text style={styles.categoryName}>{item.label}</Text>
                  <Text style={styles.categoryDescription}>
                    {item?.description || item?.parcelBox || 'No description available'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.categoryRadio,
                  value === item.id && { borderColor: "#FF3B4A" },
                ]}
              >
                {value === item.id && (
                  <View style={styles.categoryRadioActive} />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <CustomButton
            title="Done"
            buttonStyle={styles.btn}
            textStyle={styles.btnText}
            onPress={() => onClose()}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SelecParcelModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ff9fafc",
    flex: 1,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  backwrapper: {
    width: 40,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 1,
    left: 20,
    top: "30%",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,

    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTitle: {
    paddingVertical: 12,
    flex: 1,
    textAlign: "center",
    color: "rgba(7, 24, 39, 1)",
    fontFamily: "DMSansSemiBold",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bodyWithChildren: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(237, 242, 247, 1)",
  },
  bodyWithChildrenName: {
    flex: 1,
    flexDirection: "row",
  },
  categoryName: {
    fontSize: 12,
    color: "rgba(30, 34, 38, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  categoryDescription: {
    marginTop: 4,
    color: "#5C6F7F",
    fontSize: 10,
  },
  categoryIconContainer: {
    width: 16,
    height: 16,

    marginRight: 8,
  },
  categoryRadio: {
    width: 17,
    height: 17,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(107, 114, 126, 1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRadioActive: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: "#FF3B4A",
  },
  btn: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
  },
});
