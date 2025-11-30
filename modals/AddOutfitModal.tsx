import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import NewBottomModal from "@components/NewBottomModal";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { Colors } from "@constants/Colors";
import CustomButton from "@components/CustomButton";
import { useAppDispatch, useAppSelector } from "@redux/store";
import {
  setOutfitType,
  setSelectedDatePlan,
  setWardrobeType,
} from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { router } from "expo-router";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useToast } from "react-native-toast-notifications";
interface IAddoutfitModal {
  onClose: any;
  isShow: boolean;
}
const AddoutfitModal = ({ onClose, isShow }: IAddoutfitModal) => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token }: any = useAppSelector((state) => state?.userProfileSlice);
  const { outfitEditDetails }: any = useAppSelector(
    (state) => state?.outfitEditDetailsSlice
  );
  const { selectedDatePlan }: any = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );

  const [loader, setLoader] = useState(false);

  const handleAddOutfit = () => {
    // dispatch(setWardrobeType("third"));
    // onClose?.();
    // router.push("/wardrobe");

    setLoader(true);
    let data: any = {
      planDate: selectedDatePlan,
      title: outfitEditDetails?.title,
      description: outfitEditDetails?.description,
      wardrobeAssetIds: [outfitEditDetails?.id],
    };

    let getServices = wardrobeServices.postUserPlans(data, token);

    getServices
      ?.then((res) => {
        setLoader(false);

        if (res?.status === 200) {
          onClose?.();
          // toast.show(`Operation successful`, {
          //   type: "success",
          //   duration: 4000,
          // });

          dispatch(setWardrobeType("third"));
          dispatch(setOutfitType(""));
          dispatch(setSelectedDatePlan(""));

          return router.replace("/wardrobe");
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
    <NewBottomModal isShow={isShow} onClose={onClose} maxHeight={415}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Outfit</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeIconView,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
        </View>
        <View style={styles.body}>
          <View style={styles.imageOuterView}>
            <View style={styles.imageInnerView}>
              <Image
                source={{ uri: outfitEditDetails?.imageUrl }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </View>
          </View>
          <Text style={styles.content}>
            Are you sure you want to add this outfit to this date?
          </Text>
          <View style={styles.buttonsView}>
            <View style={styles.btnCancelView}>
              <CustomButton
                title="Cancel"
                buttonStyle={styles.btnCancel}
                textStyle={styles.btnCancelText}
                onPress={onClose}
              />
            </View>
            <View style={styles.btnYesView}>
              <CustomButton
                title="Yes"
                buttonStyle={styles.btnYes}
                textStyle={styles.btnYesText}
                onPress={handleAddOutfit}
                loader={loader}
              />
            </View>
          </View>
        </View>
      </View>
    </NewBottomModal>
  );
};

export default AddoutfitModal;

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    position: "relative",
  },
  headerText: {
    textAlign: "center",
    color: "#071827",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  closeIconView: {
    position: "absolute",
    right: 0,
    top: 16,
  },
  body: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageOuterView: {
    paddingVertical: 16,
    height: 180,
    flexDirection: "row",
    justifyContent: "center",
  },
  imageInnerView: {
    width: 156,
    height: "100%",
    // backgroundColor: "white",
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 44,
    textAlign: "center",
    fontSize: 16,
    color: "#393939",
    marginBottom: 16,
  },
  buttonsView: {
    flexDirection: "row",
  },
  btnCancelView: {
    flex: 1,
    marginRight: 5,
  },
  btnYesView: {
    flex: 1,
    marginLeft: 5,
  },
  btnCancel: {
    borderWidth: 1.5,
    borderColor: "#212C3D",
  },
  btnCancelText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "#212C3D",
  },
  btnYes: {
    borderWidth: 1.5,
    borderColor: "#FF3B4A",
    backgroundColor: "#FF3B4A",
  },
  btnYesText: {
    textAlign: "center",
    width: "100%",
    fontSize: 16,
    color: "white",
  },
});
