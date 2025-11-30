import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import StoryView from "@components/StoryComp/Stories/StoryView";
import WardrobeAndOutfits from "@components/wardrobeAndOutffit";
import { Colors, SIZES } from "@constants/Colors";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { useAppDispatch } from "@redux/store";

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
interface IStatusEditStoryModal {
  isShow: boolean;
  onClose: any;
}
const StatusEditStoryModal = ({ isShow, onClose }: IStatusEditStoryModal) => {
  const dispatch = useAppDispatch();
  return (
    <View>
      <NewBottomModal
        isShow={isShow}
        onClose={onClose}
        maxHeight={"100%"}
        contentStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 0,
          width: "100%", // Or a specific width (e.g., '80%')
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            paddingTop: Platform.OS === "android" ? 0 : 44,
            backgroundColor: Colors.light.background,
          }}
        >
          <WardrobeAndOutfits
            isDisplayOnModal
            type={"Tag item"}
            isTagItem
            onPress={(data: any) => {
              onClose?.();
            }}
            onGoback={() => {
              onClose?.();
              // setIsShowTag(false);
              dispatch(setTagedDetails(null));
            }}
          />
        </View>
      </NewBottomModal>
    </View>
  );
};

export default StatusEditStoryModal;

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
