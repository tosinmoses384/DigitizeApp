import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import ShareIcon from "../../assets/images/svg/share-icon.svg";
import { capitalizeFirstLetter } from "@helper/capiterlize-first-letter";
import CreateOutfitModal from "modals/CreateOutfitModal";
import DeleteItemModal from "modals/DeleteItemModal";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import CalendarComp from "@components/CalenderComp";
import { setSelectedDatePlan } from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useDeleteOutfit } from "@hooks/use-delete-outfit";
import { useI18n } from "@hooks/use-i18n";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { setOutfitEditDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { useToast } from "react-native-toast-notifications";

const EditOutfitView = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isShowCreateOutfitModal, setIsShowCreateOutfitModal] = useState(false);
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false);
  const { outfitEditDetails }: any = useAppSelector(
    (state) => state.outfitEditDetailsSlice
  );
  const { refNumber, selectedDatePlan } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const [downloadshareImage, setDownloadshareImage] = useState("");
  const { deleteOutfit } = useDeleteOutfit();

  const fetchOutfitDetails = useCallback(async () => {
    if (!token || !outfitEditDetails?.id) {
      return;
    }

    try {
      setIsLoadingOutfit(true);
      const response = await wardrobeServices.getOutfit(token, outfitEditDetails.id);

      if (response?.status === 200 && response?.data) {
        dispatch(setOutfitEditDetails(response.data));
      } else if (response?.responseCode === 401 || response?.responseCode === '401') {
        router.push('/Onboarding');
      }
    } catch {
      toast.show(t('errors.failedToLoadOutfit', undefined, 'Failed to load outfit details'), {
        type: 'danger',
        duration: 3000,
      });
    } finally {
      setIsLoadingOutfit(false);
    }
  }, [token, outfitEditDetails?.id, dispatch, t, toast]);

  useEffect(() => {
    fetchOutfitDetails();
  }, [fetchOutfitDetails]);

  const shareImage = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        Alert.alert(
          t('wardrobe.downloadAndShare'),
          t('wardrobe.downloadAndShareMessage'),
          [
            {
              text: t('common.cancel'),
              style: "cancel",
            },
            {
              text: t('wardrobe.ok'),
              onPress: downloadAndShare,
            },
          ]
        );
      } else {
        Alert.alert(
          t('wardrobe.sharingNotAvailable'),
          t('wardrobe.sharingNotAvailableMessage')
        );
      }
    } catch {
      Alert.alert(t('common.error'), t('wardrobe.errorCheckSharing'));
    }
  };

  const downloadAndShare = async () => {
    if (downloadshareImage) {
      return await Sharing.shareAsync(downloadshareImage, {
        mimeType: "image/png", // Adjust based on the actual image type
        dialogTitle: t('wardrobe.shareImage'),
      });
    }
    try {
      Alert.alert(t('wardrobe.downloading'), t('wardrobe.downloadingImageMessage'));
      const { uri } = await FileSystem.downloadAsync(
        outfitEditDetails?.imageUrl,
        FileSystem.cacheDirectory + "sharedImage.png" // Choose a temporary local file path
      );

      if (uri) {
        setDownloadshareImage(uri);
        await Sharing.shareAsync(uri, {
          mimeType: "image/png", // Adjust based on the actual image type
          dialogTitle: t('wardrobe.shareImage'),
        }        );
      } else {
        Alert.alert(t('common.error'), t('wardrobe.failedToDownloadImage'));
      }
    } catch {
      Alert.alert(t('common.error'), t('wardrobe.failedToDownloadAndShare'));
    }
  };


  const handleDeleteOutfit = () => {
    setIsShowDeleteModal(true);
  };

  const performDeleteOutfit = () => {
    deleteOutfit(outfitEditDetails?.id, setDeleteLoader);
  };

  const handleEditOutfit = useCallback(() => {
    if (isLoadingOutfit) {
      return;
    }

    router.push("/CollageEditPrepare");
  }, [isLoadingOutfit]);

  return (
    <>
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: SIZES.padding,
          position: "relative",
          paddingHorizontal: 16,
          paddingBottom: 16,
        },
      ]}
    >
      <StackHeader
        title={outfitEditDetails?.title}
        onPress={() => router.back()}
      />
      <View style={styles?.calenderViewContainer}>
        <View style={styles?.calenderView}>
          <View style={styles?.calenderCircleView}>
            <Ionicons
              name="calendar-clear-outline"
              size={10}
              color={"#FF3B4A"}
            />
          </View>
          <Text style={styles?.calenderText}>
            {moment(outfitEditDetails?.planDate).format("MMM DD")}
          </Text>
        </View>
      </View>
      {/* <ScrollView style={styles?.scrollContainer}> */}
      <View style={styles?.imageView}>
        {outfitEditDetails?.imageUrl && (
          <Image
            source={{ uri: outfitEditDetails?.imageUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </View>
      <View style={styles?.bottomView}>
        <View style={styles?.bottomTopView}>
          <Text style={styles?.bottomTopText}>{outfitEditDetails?.title}</Text>
          <View>
            <CustomButton
              title={t('wardrobe.share')}
              buttonStyle={styles.shareBtn}
              icon={<ShareIcon />}
              textStyle={styles.shareTextBtn}
              onPress={downloadshareImage ? downloadAndShare : shareImage}
            />
          </View>
        </View>
        <Text style={styles.description}>
          {capitalizeFirstLetter(outfitEditDetails?.description || "")}
        </Text>
        <View style={styles.btnsView}>
          <View style={styles.btnEditView}>
            <CustomButton
              title={t('wardrobe.editOutfit')}
              buttonStyle={styles.btnEdit}
              textStyle={styles.btnEditText}
              onPress={handleEditOutfit}
              loader={isLoadingOutfit}
              disabled={isLoadingOutfit}
            />
          </View>
          <View style={styles.btnAddToPlanView}>
            <CustomButton
              title={t('wardrobe.addToPlan')}
              buttonStyle={styles.btnAddToPlan}
              textStyle={styles.btnAddToPlanText}
              onPress={() => setIsShowDateModal(true)}
            />
          </View>
          <View style={styles.btnDeleteView}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteOutfit}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B4A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* </ScrollView> */}
      {isShowCreateOutfitModal && (
        <CreateOutfitModal
          onClose={() => {
            setIsShowCreateOutfitModal(false);
          }}
          isShow={isShowCreateOutfitModal}
          isMakePublic={false}
          refNumber={refNumber}
        />
      )}
      {isShowDateModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            dispatch(setSelectedDatePlan(""));
            setIsShowDateModal(false);
          }}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
            onPress={() => {
              dispatch(setSelectedDatePlan(""));
              setIsShowDateModal(false);
            }}
          >
            <CalendarComp
              handleSelectedDate={(date: any) => {
                dispatch(setSelectedDatePlan(date));
                setIsShowDateModal(false);
              }}
              selectedDate={selectedDatePlan}
            />
          </Pressable>
        </Modal>
      )}
    </View>
    {isShowDeleteModal && (
        <DeleteItemModal
          deleteDetail={outfitEditDetails}
          onClose={() => setIsShowDeleteModal(false)}
          refetch={() => {
            router.back();
          }}
          loader={deleteLoader}
          handleDelete={performDeleteOutfit}
        />
      )}
    </>
  );
};

export default EditOutfitView;

const styles = StyleSheet.create({
  imageView: {
    flex: 1,
  },
  bottomView: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 16,
  },
  bottomTopView: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bottomTopText: {
    flex: 1,
    textTransform: "capitalize",
    fontFamily: "DMSansSemiBold",
    color: "#212C3D",
  },
  shareBtn: {
    borderWidth: 1,
    borderColor: "#212C3D",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shareTextBtn: {
    fontSize: 12,
    color: "#212C3D",
  },
  description: {
    fontSize: 12,
    color: "#232323",
    marginBottom: 16,
  },
  btnsView: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnEditView: {
    flex: 1,
    marginRight: 6,
    maxWidth: "40%",
  },
  btnAddToPlanView: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    maxWidth: "40%",
  },
  btnDeleteView: {
    width: 50,
    alignItems: "center",
    flexShrink: 0,
    marginLeft: 6,
  },
  btnEdit: {
    borderWidth: 1,
    borderColor: "#FF3B4A",
    padding: 9,
    borderRadius: 12,
  },
  btnEditText: {
    fontSize: 12,
    color: "#FF3B4A",
    fontFamily: "DMSansMedium",
    textAlign: "center",
    width: "100%",
  },
  btnAddToPlan: {
    borderWidth: 1,
    borderColor: "#FF3B4A",
    padding: 9,
    borderRadius: 12,
    backgroundColor: "#FF3B4A",
  },
  btnAddToPlanText: {
    fontSize: 12,
    color: "white",
    fontFamily: "DMSansMedium",
    textAlign: "center",
    width: "100%",
  },
  calenderViewContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 5,
  },
  calenderView: {
    padding: 4,
    width: 57,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
  },
  calenderText: {
    marginLeft: 4,
    fontSize: 10,
    color: "#000000",
    fontFamily: "DMSansMedium",
  },
  calenderCircleView: {
    backgroundColor: "#FFEBED",
    width: 12,
    height: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FFD8DB",
    borderWidth: 1,
    borderColor: "#FF3B4A",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 40,
  },
});
