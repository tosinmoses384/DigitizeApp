import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ModalContainer from "../components/ModalContainer";
import DeleteIcon from "../assets/images/svg/delete-btn.svg";
import CustomButton from "../components/CustomButton";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { useAppSelector } from "@redux/store";
import { useI18n } from "../hooks/use-i18n";

interface IDeleteItemModal {
  onClose: any;
  deleteDetail?: any;
  refetch?: any;
  handleDelete?: any;
  loader?: boolean;
}
const DeleteItemModal = ({
  onClose,
  deleteDetail,
  refetch,
  handleDelete,
  loader,
}: IDeleteItemModal) => {
  const { t } = useI18n();
  const toast = useToast();
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  // ("deleteDetail>>>", deleteDetail?.id);

  return (
    <ModalContainer>
      <View style={styles.wrapper}>
        <View style={styles.deleteContainer}>
          <DeleteIcon width={71} height={71} />
        </View>
        <Text style={styles.deleteText}>
          {t('wardrobe.removeItemQuestion')}
        </Text>
        <View style={styles.deleteBtnView}>
          <View style={styles.notTodayView}>
            <CustomButton
              title={t('common.cancel')}
              buttonStyle={styles.notToday}
              textStyle={styles?.notTodayText}
              onPress={onClose}
            />
          </View>
          <View style={styles.yesView}>
            <CustomButton
              title={t('wardrobe.yes')}
              buttonStyle={styles.yesBtn}
              textStyle={styles?.yesText}
              onPress={handleDelete}
              loader={loader}
            />
          </View>
        </View>
      </View>
    </ModalContainer>
  );
};

export default DeleteItemModal;

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 1)",
    boxShadow: "0px 2.79px 20.91px 0px rgba(0, 0, 0, 0.15)",
    width: "100%",
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
