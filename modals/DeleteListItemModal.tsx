import BottomModal from "@components/BottomModal";
import React, { useState } from "react";
import CloseIcon from "../assets/images/svg/x-close.svg";
import DeleteIcon from "../assets/images/svg/delete-btn.svg";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import CustomButton from "@components/CustomButton";
import { useToast } from "react-native-toast-notifications";
import { useAppSelector } from "@redux/store";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
interface IDeleteListItemModal {
  onClose: any;
  isShow: boolean;
  deleteDetail: string;
  refetch: any;
}
const DeleteListItemModal = ({
  onClose,
  isShow,
  refetch,
  deleteDetail,
}: IDeleteListItemModal) => {
  const toast = useToast();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [loader, setLoader] = useState(false);
  // ("deleteDetail>>>", deleteDetail?.id);

  const handleDelete = () => {
    setLoader(true);
    let getServices = wardrobeServices.deleteUserListItem(token, deleteDetail);
    getServices
      ?.then((res) => {
        setLoader(false);
        if (res?.status === 200) {
          //   toast.show(`${res?.message || res?.detail}`, {
          //     type: "success",
          //     duration: 4000,
          //   });
          refetch?.();
          return onClose?.();
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          onClose?.();
          return router.push("/Onboarding");
        }
        return toast.show(`${res?.message || res?.detail}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error) => {
        setLoader(false);
        return toast.show(`An error occurred. Please try again later.`, {
          type: "danger",
          duration: 4000,
        });
      });
  };
  return (
    <BottomModal onClose={onClose} isShow={isShow}>
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
          },
        ]}
      >
        <View style={styles.closeViewContainer}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeContainer,
              pressed && { opacity: 0.5 },
            ]}
          >
            <CloseIcon width={17} height={17} />
          </Pressable>
        </View>
        <View style={styles.bodyContainer}>
          <View style={styles.deleteContainer}>
            <DeleteIcon width={71} height={71} />
          </View>
          <Text style={styles.deleteText}>
            Are you sure you want to remove this item?
          </Text>
          <View style={styles.deleteBtnView}>
            <View style={styles.notTodayView}>
              <CustomButton
                title="Not Today"
                buttonStyle={styles.notToday}
                textStyle={styles?.notTodayText}
                onPress={onClose}
              />
            </View>
            <View style={styles.yesView}>
              <CustomButton
                title="Yes"
                buttonStyle={styles.yesBtn}
                textStyle={styles?.yesText}
                onPress={handleDelete}
                loader={loader}
              />
            </View>
          </View>
        </View>
      </View>
    </BottomModal>
  );
};

export default DeleteListItemModal;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7CC",
  },
  containerText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "DMSansMedium",
    color: "rgba(30, 34, 38, 1)",
  },
  closeViewContainer: {
    position: "relative",
    marginBottom: 11,
  },
  closeContainer: {
    position: "absolute",
    zIndex: 3,
  },
  bodyContainer: {
    marginTop: 20,
  },
  deleteContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 19,
  },
  deleteText: {
    color: "rgba(57, 57, 57, 1)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 24,
  },
  deleteBtnView: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 16,
    // justifyContent: "space-between",
  },
  notTodayView: {
    width: "50%",
  },
  notToday: {
    borderWidth: 1.5,
    borderColor: "rgba(33, 44, 61, 1)",
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  yesView: {
    width: "50%",
    marginHorizontal: 5,
  },
  yesBtn: {
    backgroundColor: "rgba(255, 59, 74, 1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 59, 74, 1)",
    flexDirection: "row",
    justifyContent: "center",
  },
  notTodayText: {
    textAlign: "center",
  },
  yesText: {
    textAlign: "center",
    color: "white",
  },
});
