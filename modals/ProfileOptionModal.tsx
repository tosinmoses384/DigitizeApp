import BottomModal from "@components/BottomModal";
import React, { useState } from "react";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useAppSelector } from "@redux/store";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
interface IProfileOptionModal {
  onClose: any;
  isShow: boolean;
  handleSelect: any;
  itemDetails: any;
  refetch: any;
}
const ProfileOptionModal = ({
  onClose,
  isShow,
  handleSelect,
  itemDetails,
  refetch,
}: IProfileOptionModal) => {
  const toast = useToast();
  const { token }: any = useAppSelector((state) => state?.userProfileSlice);
  const [loader, setLoader] = useState(false);
  const [activeOptionId, setActiveOptionId]: any = useState(null);
  const isSoldItem = itemDetails?.status?.toLowerCase?.() === "itemsold";
  
  const options = [
    {
      id: 1,
      title: "Mark as sold",
      innerAction: true,
      isShow: itemDetails?.status?.toLowerCase?.() === "active" ? true : false,
    },
    // { id: 2, title: "Hide", innerAction: true, isShow: true },
    { id: 3, title: "Edit", isShow: !isSoldItem },
    { id: 4, title: "Delete", isShow: true },
  ];

  const markItemAsSold = () => {
    setLoader(true);
    let getServices = wardrobeServices.markItemAsSoldListItem(
      token,
      itemDetails?.id
    );
    getServices
      ?.then((res: any) => {
        setLoader(false);

        if (res?.status === 200 || res?.data?.succeeded) {
          onClose?.();
          return refetch?.();
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

  const handleInnerSelect = (data: string) => {
    if (data === "Mark as sold") {
      return markItemAsSold();
    }
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
        {options?.map(
          (list) =>
            list?.isShow && (
              <Pressable
                key={list?.id}
                style={({ pressed }) => [
                  styles.container,
                  pressed && { opacity: 0.5 },
                ]}
                onPress={
                  loader && activeOptionId === list?.id
                    ? () => {}
                    : () => {
                        if (list?.innerAction) {
                          setActiveOptionId(list?.id);
                          return handleInnerSelect(list?.title);
                        }
                        return handleSelect(list?.title);
                      }
                }
              >
                <Text style={styles.containerText}>
                  {loader && activeOptionId === list?.id ? "..." : list?.title}
                </Text>
              </Pressable>
            )
        )}
      </View>
    </BottomModal>
  );
};

export default ProfileOptionModal;

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
});
