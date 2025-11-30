import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import StoryView from "@components/StoryComp/Stories/StoryView";
import { SIZES } from "@constants/Colors";

import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { View } from "react-native";
import CloseIcon from "../../assets/images/svg/x-close.svg";
interface IStatusViewActionModal {
  isShow: boolean;
  onClose: any;
  options: any;
  selectedOption: any;
}
const StatusViewActionModal = ({
  isShow,
  onClose,
  options,
  selectedOption,
}: IStatusViewActionModal) => {
  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={205}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: "100%", // Or a specific width (e.g., '80%')
          flex: 1,
        }}
      >
        <View style={styles.body}>
          <Pressable
            style={({ pressed }) => [
              styles.closeIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
          <View style={styles.optionBody}>
            {options?.map(
              (list: any) =>
                list?.title && (
                  <Pressable
                    key={list?.id}
                    style={({ pressed }) => [
                      styles.optionCover,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => selectedOption(list)}
                  >
                    <Text style={[styles.optionText, { color: list?.color }]}>
                      {list?.title}
                    </Text>
                  </Pressable>
                )
            )}
          </View>
        </View>
      </NewBottomModal>
    </View>
  );
};

export default StatusViewActionModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    zIndex: 3,
    left: 16,
    top: 16,
  },
  pressed: {
    opacity: 0.5,
  },
  optionBody: {
    marginTop: 10,
  },
  optionCover: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "#EDF2F7",
  },
  optionText: {
    textAlign: "center",
    color: "#1E2226",
    fontSize: 12,
  },
  //   header: {
  //     padding: 12,

  //     position: "relative",
  //   },
  //   headerCloseIcon: {
  //     position: "absolute",
  //     top: 12,
  //     right: 12,
  //   },
  //   pressed: {
  //     opacity: 0.5,
  //   },
  //   headerText: {
  //     textAlign: "center",
  //     fontSize: 14,
  //     color: "#071827",
  //     fontFamily: "DMSansMedium",
  //   },
  //   rootHeader: {
  //     position: "absolute",
  //     width: "100%",
  //     top: 50,
  //   },
});
