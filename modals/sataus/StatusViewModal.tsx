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
interface IStatusViewModal {
  isShow: boolean;
  onClose: any;
  userStories: any;
  refetch: any;
  setCurrentUserStory: any;
  profileId: any;
}
const StatusViewModal = ({
  isShow,
  onClose,
  userStories,
  refetch,
  setCurrentUserStory,
  profileId,
}: IStatusViewModal) => {
  return (
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
      <StoryView
        onFinishStory={onClose}
        userStories={userStories}
        refetch={refetch}
        setCurrentUserStory={setCurrentUserStory}
        profileId={profileId}
      />
    </NewBottomModal>
  );
};

export default StatusViewModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    position: "relative",
  },
  header: {
    padding: 12,

    position: "relative",
  },
  headerCloseIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansMedium",
  },
  rootHeader: {
    position: "absolute",
    width: "100%",
    top: 50,
  },
});
