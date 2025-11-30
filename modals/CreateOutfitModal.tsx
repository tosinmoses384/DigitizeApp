import { Ionicons } from "@expo/vector-icons";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Platform,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { SIZES } from "../constants/Colors";
import { useAppSelector } from "../redux/store";
 
import { LinearGradient } from "expo-linear-gradient";
import AppTextInput from "../components/AppTextInput";
import CustomButton from "../components/CustomButton";
import wardrobeServices from "../services/features/wardrobe-service/wardrobeServices";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import {
  setOutfitCanvasPosition,
  setOutfitType,
  setRefetchPlans,
  setSelectedDatePlan,
  setWardrobeType,
} from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import fileServerServices from "@services/features/file-server/fileServer";
import CalendarComp from "@components/CalenderComp";
import { setOutfitEditDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import moment from "moment";
import CustomToastNotification from "@helper/toast-message";
import { useI18n } from "@hooks/use-i18n";
import { useCollageSerialization } from "@hooks/use-collage-serialization";
interface ISelectItemCategoryModal {
  onClose: any;
  isShow: boolean;
  isMakePublic: boolean;
  // imageUploadIds: any;
  refNumber?: string;
}
const SelectItemBrandModal = ({
  onClose,
  isShow,
  isMakePublic,
  // imageUploadIds,
  refNumber,
}: ISelectItemCategoryModal) => {
  
  const toast = useToast();
  const { t } = useI18n();
  const { temporaryAddItemToOutfitSlice, outfitType, selectedDatePlan }: any =
    useAppSelector((state) => state?.temporaryAddItemToOutfitSlice);
  const { outfitEditDetails, isActiveCollageEdit }: any = useAppSelector(
    (state) => state?.outfitEditDetailsSlice
  );
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [loader, setLoader] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [outfitImage, setOutfitImage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isCreatePlan, setIsCreatePlan] = useState(false);
  const [toastDetails, setToastDetails]: any = useState(null);

  const dispatch = useDispatch();
  const { serializeCollageLayout, deserializeAndLoadCollage, hasCollageLayout } = useCollageSerialization();
  
  const safeRefNumber = refNumber || '';
  
  useEffect(() => {
    // Monitor refNumber changes
  }, [refNumber]);

  useEffect(() => {
    if (isActiveCollageEdit && outfitEditDetails?.imageUrl) {
      setImageVersion((prev) => prev + 1);
    }
  }, [isActiveCollageEdit, outfitEditDetails?.imageUrl]);

  const getImagesFromServer = useCallback(() => {
    if (!safeRefNumber) {
      return;
    }
    
    fileServerServices
      ?.getUserOutfitPicture(token, safeRefNumber)
      .then((res: any) => {
        if (res?.status === 200) {
          setOutfitImage(res?.data?.resourceUrl);
          return;
        }
      })
      .catch((err) => {
        // Image fetch failed
      });
  }, [token, safeRefNumber]);

  useEffect(() => {
    if (token && safeRefNumber) {
      getImagesFromServer();
    }
  }, [token, safeRefNumber, outfitType, getImagesFromServer]);

  const createOutfitValidationSchema = Yup?.object()?.shape({
    title: Yup.string().trim().required(t('validation.required', undefined, 'Required')),
    description: Yup.string().trim(),
  });

  const handleAddOutfitToPlan = (values: any, outfitId: string) => {
    setLoader(true);
    const planDateSource = selectedDatePlan || selectedDate;
    const trimmedTitle = values?.title?.trim() || '';
    const trimmedDescription = values?.description?.trim() || '';
    let data: any = {
      planDate: planDateSource ? moment(planDateSource).format("YYYY-MM-DD") : "",
      title: trimmedTitle,
      description: trimmedDescription,
      wardrobeAssetIds: [outfitId],
    };

    if (!data.planDate) {
      setLoader(false);
      return toast.show(t('wardrobe.plan.selectDateForPlan', undefined, 'Please select a date for your plan'), {
        type: 'danger',
        duration: 3000,
      });
    }

    wardrobeServices
      .postUserPlans(data, token)
      ?.then((res) => {
        setLoader(false);

        if (res?.status === 200 || res?.status === 201) {
          dispatch(setOutfitCanvasPosition([]));
          dispatch(setOutfitType(""));
          dispatch(setOutfitEditDetails(null));
          dispatch(setWardrobeType("third"));
          // Preserve date for navigation and trigger refresh
          dispatch(setSelectedDatePlan(data.planDate));
          dispatch(setRefetchPlans(true));
          onClose?.();
          setTimeout(() => {
            router.replace("/wardrobe");
          }, 0);
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          onClose?.();
          return router.push("/Onboarding");
        }
        onClose?.();

        return toast.show(`${res?.message || res?.detail}`, {
          type: "danger",
          duration: 4000,
        });
      })
      .catch((error) => {
        setLoader(false);
        return toast.show(t('errors.somethingWentWrong', undefined, 'An error occurred. Please try again later.'), {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const handleCreateOutfit = (
    values: any,
    distructureItemIds: string[],
    options?: { shouldAddToPlan?: boolean },
  ) => {
    const shouldAddToPlan = options?.shouldAddToPlan === true;

    setLoader(true);
    setToastDetails(null);

    const metadata = serializeCollageLayout();

    const data = {
      requestId: safeRefNumber,
      title: values?.title?.trim() || '',
      description: values?.description?.trim() || '',
      itemIds: distructureItemIds,
      isPrivate: isMakePublic,
      metadata,
    };

    let getServices = outfitEditDetails
      ? wardrobeServices.editUserOutfit(data, token, outfitEditDetails?.id)
      : wardrobeServices.createUserOutfit(data, token);

    getServices
      ?.then((res) => {
        if (!selectedDate) {
          setLoader(false);
        }

        if (res?.status === 200 || res?.status === 201) {
          const outfitId = (res as any)?.data?.id || outfitEditDetails?.id;

          if (shouldAddToPlan && outfitId) {
            return handleAddOutfitToPlan(values, outfitId);
          }

          if (shouldAddToPlan && !outfitId && selectedDatePlan && outfitEditDetails?.id) {
            return handleAddOutfitToPlan(values, outfitEditDetails.id);
          }
          dispatch(setWardrobeType("second"));
          onClose?.();
          dispatch(setOutfitCanvasPosition([]));
          dispatch(setOutfitType(""));
          dispatch(setOutfitEditDetails(null));
          return router.replace("/wardrobe");
        }
        if (res?.responseCode === "401" || res?.responseCode === 401 || res?.status === 401) {
          setLoader(false);
          onClose?.();
          return router.push("/Onboarding");
        }

        setLoader(false);
        const errorMessage = res?.detail || res?.message || t('wardrobe.plan.failedToSaveOutfit', undefined, 'Failed to save outfit');
        return setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setLoader(false);
        const errorMessage = error?.message || error?.detail || t('errors.somethingWentWrong', undefined, 'An error occurred. Please try again later.');
        return toast.show(errorMessage, {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const handleCreatePlan = (values: any, distructureItemIds: string[]) => {
    setLoader(true);
    setToastDetails(null);
    const getEditWardrobeAsset = outfitEditDetails?.items?.map(
      (list: any) => list?.id
    );

    const trimmedTitle = values?.title?.trim() || '';
    const trimmedDescription = values?.description?.trim() || '';
    let data: any = {
      planDate: outfitEditDetails
        ? selectedDatePlan
          ? moment(selectedDatePlan).format("YYYY-MM-DD")
          : moment(outfitEditDetails?.planDate).format("YYYY-MM-DD")
        : moment(selectedDatePlan).format("YYYY-MM-DD"),
      title: trimmedTitle,
      description: trimmedDescription,
      wardrobeAssetIds: outfitEditDetails
        ? getEditWardrobeAsset
        : distructureItemIds,
    };

    if (!data.planDate) {
      setLoader(false);
      return setToastDetails({
        message: t('wardrobe.plan.selectDateForPlan', undefined, 'Please select a date for your plan'),
        type: "error",
        duration: 4000,
      });
    }

    let getServices = outfitEditDetails
      ? wardrobeServices.editUserPlans(data, token, outfitEditDetails?.id)
      : wardrobeServices.postUserPlans(data, token);

    getServices
      ?.then((res) => {
        setLoader(false);
        if (res?.status === 200 || res?.status === 201) {
          onClose?.();
          dispatch(setOutfitCanvasPosition([]));
          dispatch(setOutfitType(""));
          dispatch(setOutfitEditDetails(null));

          dispatch(setWardrobeType("third"));
          dispatch(setRefetchPlans(true));

          return router.replace("/wardrobe");
        }
        if (res?.responseCode === "401" || res?.responseCode === 401 || res?.status === 401) {
          onClose?.();
          return router.push("/Onboarding");
        }

        const errorMessage = res?.detail || res?.message || t('wardrobe.plan.failedToSaveOutfitPlan', undefined, 'Failed to save outfit plan');
        return setToastDetails({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setLoader(false);
        const errorMessage = error?.message || error?.detail || t('errors.somethingWentWrong', undefined, 'An error occurred. Please try again later.');
        return toast.show(errorMessage, {
          type: "danger",
          duration: 4000,
        });
      });
  };

  const createOutfitFormik = useFormik({
    validationSchema: createOutfitValidationSchema,
    initialValues: {
      title: title || "",
      description: description || "",
    },
    enableReinitialize: true,
    onSubmit: async (values: any) => {
      if (
        temporaryAddItemToOutfitSlice?.length === 0 &&
        !outfitEditDetails?.id
      ) {
        onClose?.();
        return toast.show(t('wardrobe.plan.noOutfitFound', undefined, 'No outfit found.'), {
          type: "danger",
          duration: 4000,
        });
      }

      const distructureItemIds = (temporaryAddItemToOutfitSlice as { id: string }[] | undefined)?.map((list) => list.id) || [];

      if (isCreatePlan) {
        if (outfitEditDetails?.id) {
          return handleCreatePlan(values, distructureItemIds);
        }
        // For new outfits: create the outfit first, then add to plan with the new outfitId
        return handleCreateOutfit(values, distructureItemIds, {
          shouldAddToPlan: true,
        });
      }

      return handleCreateOutfit(values, distructureItemIds, {
        shouldAddToPlan: false,
      });

      // setLoader(true);
      // let data: any =
      //   outfitType === "create plan outfit" && isCreatePlan
      //     ? {
      //         planDate: selectedDatePlan,
      //         description: values?.description,
      //         wardrobeAssetIds: distructureItemIds,
      //       }
      //     : {
      //         requestId: outfitEditDetails?.id ? null : refNumber,
      //         title: values?.title,
      //         description: values?.description,
      //         itemIds: outfitEditDetails?.id ? null : distructureItemIds,
      //         isPrivate: isMakePublic,
      //       };

      // let getServices =
      //   outfitType === "create plan outfit" && isCreatePlan
      //     ? wardrobeServices.postUserPlans(data, token)
      //     : outfitEditDetails
      //     ? wardrobeServices.editUserOutfit(data, token, outfitEditDetails?.id)
      //     : wardrobeServices.createUserOutfit(data, token);

      // getServices
      //   ?.then((res) => {
      //     if (!selectedDate) {
      //       setLoader(false);
      //     }

      //     if (res?.status === 200) {
      //       onClose?.();
      //       dispatch(setOutfitCanvasPosition([]));
      //       dispatch(setOutfitType(""));
      //       dispatch(setOutfitEditDetails(null));

      //       if (outfitType === "create plan outfit" && isCreatePlan) {
      //         dispatch(setWardrobeType("third"));

      //         dispatch(setSelectedDatePlan(""));
      //         dispatch(setRefetchPlans(true));
      //       } else {
      //         if (selectedDate) {
      //           return handleAddOutfitToPlan(
      //             values?.description,
      //             distructureItemIds
      //           );
      //         }
      //         dispatch(setWardrobeType("second"));
      //       }

      //       return router.replace("/wardrobe");
      //     }
      //     if (res?.responseCode === "401" || res?.responseCode === 401) {
      //       onClose?.();
      //       return router.push("/Onboarding");
      //     }

      //     ("error>>>", res);

      //     return toast.show(`${res?.message || res?.detail}`, {
      //       type: "danger",
      //       duration: 4000,
      //     });
      //   })
      //   .catch((error) => {
      //     setLoader(false);
      //     return toast.show(`An error occurred. Please try again later.`, {
      //       type: "danger",
      //       duration: 4000,
      //     });
      //   });
    },
  });

  useEffect(() => {
    setDescription(outfitEditDetails?.description);
    setTitle(outfitEditDetails?.title);

    if (outfitEditDetails?.metadata && outfitEditDetails?.items && !isActiveCollageEdit) {
      const hasCollage = hasCollageLayout(outfitEditDetails.metadata);
      if (hasCollage) {
        const formattedItems = outfitEditDetails.items.map((item: { id: string; name: string; imageUrl: string }) => ({
          id: item.id,
          itemDefaultImageUrl: item.imageUrl,
          itemDefaultTransparentImageUrl: item.imageUrl,
        }));
        deserializeAndLoadCollage(outfitEditDetails.metadata, formattedItems);
      }
    }
  }, [outfitEditDetails, hasCollageLayout, deserializeAndLoadCollage, isActiveCollageEdit]);

  

  return (
    <Modal visible={isShow} animationType="slide" onRequestClose={onClose}>
      {toastDetails && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: Platform.OS === "ios" ? 20 : 10,
            left: 0,
          }}
        >
          <CustomToastNotification
            message={toastDetails?.message}
            type={toastDetails?.type}
            autoHideDuration={toastDetails?.duration}
          />
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20} // Adjust as needed
        style={{ flex: 1 }}
      >
        <View style={[styles.wrapper]}>
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [
                pressed && styles.pressed,
                styles.backwrapper,
              ]}
              onPress={() => {
                onClose?.();
                dispatch(setSelectedDatePlan(""));
              }}
            >
              <Ionicons
                name="chevron-back"
                color={"rgba(70, 79, 84, 1)"}
                size={20}
              />
            </Pressable>
            <Text style={styles.headerTitle}>{t('outfit.createOutfit', undefined, 'Create Outfit')}</Text>
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "transparent"]}
              style={styles.shadowGradient}
            />
          </View>

          <ScrollView style={styles.body}>
            <View style={styles.imageContainer}>
              {outfitEditDetails ? (
                <Image
                  source={{
                    uri:
                      imageVersion > 0 && outfitEditDetails?.imageUrl
                        ? `${outfitEditDetails.imageUrl}${
                            outfitEditDetails.imageUrl.includes("?") ? "&" : "?"
                          }v=${imageVersion}`
                        : outfitEditDetails?.imageUrl,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              ) : (
                <Image
                  source={{ uri: outfitImage }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              )}
            </View>

            <AppTextInput
              onChangeText={createOutfitFormik.handleChange("title")}
              value={createOutfitFormik?.values?.title}
              error={
                createOutfitFormik.submitCount > 0 &&
                createOutfitFormik.errors.title
              }
              placeholder={t('wardrobe.createOutfit.titlePlaceholder', undefined, 'What are you calling this outfit')}
              label={t('wardrobe.title', undefined, 'Title')}
            />
            <View style={{ marginVertical: 16 }}>
              <AppTextInput
                isMultiline
                onChangeText={createOutfitFormik.handleChange("description")}
                value={createOutfitFormik?.values?.description}
                error={
                  createOutfitFormik.submitCount > 0 &&
                  createOutfitFormik.errors.description
                }
                placeholder={t('wardrobe.createOutfit.descriptionPlaceholder', undefined, 'Describe this outfit')}
                label={t('wardrobe.createOutfit.descriptionOptionalLabel', undefined, 'Description (Optional)')}
              />
            </View>
            {outfitType !== "create plan outfit" && (
              <View style={styles.buttonView}>
                <CustomButton
                  title={outfitEditDetails ? t('common.saveChanges', undefined, 'Save Changes') : t('outfit.createOutfit', undefined, 'Create Outfit')}
                  buttonStyle={styles.buttonContainer}
                  textStyle={styles.buttonText}
                  onPress={() => {
                    setIsCreatePlan(false);
                    createOutfitFormik.handleSubmit();
                  }}
                  loader={!isCreatePlan && loader}
                />
              </View>
            )}

            {/* {outfitType === "create plan outfit" && ( */}
            <View style={styles.buttonViewAddPlan}>
              <CustomButton
                title={
                  outfitEditDetails?.id && outfitType === "create plan outfit"
                    ? t('common.saveChanges', undefined, 'Save Changes')
                    : t('wardrobe.addToPlan', undefined, 'Add to Plan')
                }
                buttonStyle={
                  outfitType === "create plan outfit"
                    ? styles.buttonContainer
                    : styles.buttonPlanContainer
                }
                textStyle={
                  outfitType === "create plan outfit"
                    ? styles.buttonText
                    : styles.buttonPlanText
                }
                onPress={
                  !outfitType
                    ? () => {
                        setIsCreatePlan(true);
                        setIsShowDateModal(true);
                      }
                    : () => {
                        setIsCreatePlan(true);
                        createOutfitFormik.handleSubmit();
                      }
                }
                loader={isCreatePlan && loader}
              />
            </View>
            {/* )} */}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {isShowDateModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setSelectedDate("");
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
              if (outfitEditDetails?.id) {
                dispatch(setSelectedDatePlan(""));
              } else {
                setSelectedDate("");
              }
              setIsShowDateModal(false);
            }}
          >
            <CalendarComp
              handleSelectedDate={(date: any) => {
                if (outfitEditDetails?.id) {
                  dispatch(setSelectedDatePlan(date));
                } else {
                  setSelectedDate(date);
                }
                setIsShowDateModal(false);
              }}
              selectedDate={
                outfitEditDetails?.id ? selectedDatePlan : selectedDate
              }
            />
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
};

export default SelectItemBrandModal;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ff9fafc",

    flex: 1,
    // paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : 0,
  },
  backwrapper: {
    width: 20,
    display: "flex",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1, // Take up the full screen *for the overlay*
    position: "absolute", // Key: Position the overlay absolutely
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    position: "relative",
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
    backgroundColor: "#f9fafc",
  },
  shadowGradient: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    height: 10, // Height of the shadow
    zIndex: -1,
  },
  buttonView: {
    paddingVertical: 16,
    // paddingHorizontal: 16,
  },
  buttonViewAddPlan: {
    // paddingHorizontal: 16,
    paddingBottom: 30,
  },
  buttonContainer: {
    padding: 14,
    backgroundColor: "rgba(255, 59, 74, 1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 74, 1)",
  },
  buttonPlanContainer: {
    padding: 14,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B4A",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontFamily: "DMSansMedium",
    width: "100%",
    fontSize: 16,
  },
  buttonPlanText: {
    textAlign: "center",
    color: "#FF3B4A",
    fontFamily: "DMSansMedium",
    width: "100%",
    fontSize: 16,
  },
  imageContainer: {
    height: 291,
    width: "100%",
    marginBottom: 12,
    backgroundColor: "white",
  },
});
