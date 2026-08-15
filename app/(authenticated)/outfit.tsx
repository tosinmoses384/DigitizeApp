import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import PlusIcon from "../../assets/images/svg/add-circle-plus.svg";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import CustomButton from "../../components/CustomButton";

import {
  setOutfitCanvasPosition,
  setRefNumber,
  setTemporaryAddItemToOutfit,
} from "../../redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { LinearGradient } from "expo-linear-gradient";
import CreateOutfitModal from "../../modals/CreateOutfitModal";
import DraggableCanvas from "../../components/DragableCanvas";
import fileServerServices from "../../services/features/file-server/fileServer";
import { useToast } from "react-native-toast-notifications";
import { generateGUID } from "../../helper/guid-number";
import { capitalizeFirstLetter } from "../../helper/capitalize-first-letter";
// Removed unused wardrobeServices import
// Removed unused setIsEdit import
import SelectItemModal from "modals/SelectItemModal";
import { useI18n } from "../../hooks/use-i18n";
import SelectItemsForPlanModal, { SelectItemsForPlanModalRef } from "../../modals/SelectItemsForPlanModal";
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { processBatchItemsBackgroundRemoval } from "../../utils/planItemBackgroundProcessor";
import { WardrobeItem } from "../../services/features/wardrobe-service/types";
import { COLLAGE_SKIA_ENABLED } from "../../constants/Constants";
import { useCollageStore } from "../../stores/collage-store";
import { getCollageCanvasSafely, isSkiaRuntimeUsable } from "../../services/skiaService";
import { syncCollageLayersWithWardrobeItems } from "../../utils/collage-layer-sync";

const Outfit = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const toast = useToast();
  const { temporaryAddItemToOutfitSlice, refNumber, outfitType, selectedDatePlan } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const { addLayer, removeLayer } = useCollageStore();

  const { outfitEditDetails, isEdit }: any = useAppSelector(
    (state) => state?.outfitEditDetailsSlice
  );

  const [imageLoader, setImageLoader] = useState(false);
  // Removed unused local image editing states

  const [isMakePublic, setIsMakePublic] = useState(false);
  const [isShowCreateOutfitModal, setIsShowCreateOutfitModal] = useState(false);
  const [showSelectItemModal] = useState(false);
  const [showSelectItemsForPlanModal, setShowSelectItemsForPlanModal] = useState(false);
  const [initialSelectedItems, setInitialSelectedItems] = useState<WardrobeItem[]>([]);
  const selectItemsModalRef = useRef<SelectItemsForPlanModalRef>(null);

  const handleDeleteImage = (imageData: any) => {
    const filterOutExistingData = temporaryAddItemToOutfitSlice?.filter(
      (list: any) => list?.id !== imageData?.id
    );

    dispatch(setTemporaryAddItemToOutfit(filterOutExistingData));
  };

  const distructureImage = temporaryAddItemToOutfitSlice?.map((list: any) => {
    return {
      ...list,
      images: list?.itemImageUrls?.[0],
    };
  });

  useEffect(() => {
    if (outfitEditDetails) {
      setIsMakePublic(outfitEditDetails?.status === "Public" ? true : false);
    }
  }, [outfitEditDetails]);

  useEffect(() => {
    if (!COLLAGE_SKIA_ENABLED || !temporaryAddItemToOutfitSlice) {
      return;
    }

    const collageDocument = useCollageStore.getState().document;
    const canvasWidth = collageDocument?.width ?? 400;
    const canvasHeight = collageDocument?.height ?? 600;

    syncCollageLayersWithWardrobeItems({
      items: temporaryAddItemToOutfitSlice as WardrobeItem[],
      canvasWidth,
      canvasHeight,
      existingLayers: collageDocument?.layers,
      addLayer,
      removeLayer,
    });
  }, [temporaryAddItemToOutfitSlice, addLayer, removeLayer]);

  const handleUploadImage = (imageDetails: any) => {
    if (token && imageDetails) {
      setImageLoader(true);
      const isPlatformAndroid = Platform.OS === "android";
      fileServerServices
        ?.outfitImageUpload([imageDetails], isPlatformAndroid, refNumber, token)
        ?.then((res: any) => {
          setImageLoader(false);
          // no-op (local images state removed)

          if (res?.status === 200) {
            return setIsShowCreateOutfitModal(true);
            // return toast.show(`${res?.message || res?.detail}`, {
            //   type: "success",
            //   duration: 4000,
            // });
          }
          if (res?.responseCode === "401" || res?.responseCode === 401) {
            return router.push("/Onboarding");
          }
          setImageLoader(false);
          return toast.show(`${res?.message || res?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        })
        .catch(() => {
          setImageLoader(false);
          // no-op (local images state removed)
        });
      return;
    }
  };

  const handleAddMoreItemsClick = useCallback(() => {
    setInitialSelectedItems(temporaryAddItemToOutfitSlice || []);
    setShowSelectItemsForPlanModal(true);
  }, [temporaryAddItemToOutfitSlice]);

  const handleSelectItemsForPlanNext = useCallback(async (selectedItems: WardrobeItem[]) => {
    if (!token || selectedItems.length === 0) {
      return;
    }

    try {
      const existingItemIds = new Set(initialSelectedItems.map(item => item.id));
      const newItems = selectedItems.filter(item => !existingItemIds.has(item.id));
      const selectedItemIds = new Set(selectedItems.map(item => item.id));
      
      const keptExistingItemsFromCanvas = temporaryAddItemToOutfitSlice?.filter(
        (item: any) => selectedItemIds.has(item.id)
      ) || [];

      if (newItems.length === 0) {
        if (keptExistingItemsFromCanvas.length < temporaryAddItemToOutfitSlice.length) {
          dispatch(setTemporaryAddItemToOutfit(keptExistingItemsFromCanvas));
          toast.show('Items updated', { type: 'success', duration: 2000 });
        }
        setShowSelectItemsForPlanModal(false);
        return;
      }

      const result = await processBatchItemsBackgroundRemoval(
        newItems,
        token,
        (progress) => {
          if (progress.itemsProgress && selectItemsModalRef.current) {
            selectItemsModalRef.current.updateProcessingProgress(progress.itemsProgress);
          }
        },
        3
      );

      if (selectItemsModalRef.current) {
        selectItemsModalRef.current.completeProcessing();
      }

      if (result.processedItems.length > 0 || keptExistingItemsFromCanvas.length > 0) {
        const allItems = [...keptExistingItemsFromCanvas, ...result.processedItems];
        dispatch(setTemporaryAddItemToOutfit(allItems));

        setTimeout(() => {
          setShowSelectItemsForPlanModal(false);
          
          if (result.skippedCount > 0 && result.itemsWithOriginalImage > 0) {
            toast.show(
              `${result.itemsWithOriginalImage} item${result.itemsWithOriginalImage !== 1 ? 's' : ''} using original image (background removal unavailable). ${result.skippedCount} item${result.skippedCount !== 1 ? 's were' : ' was'} skipped.`,
              {
                type: 'warning',
                duration: 4000,
              }
            );
          } else if (result.itemsWithOriginalImage > 0) {
            toast.show(
              `${result.itemsWithOriginalImage} item${result.itemsWithOriginalImage !== 1 ? 's' : ''} using original image - background removal unavailable at the moment.`,
              {
                type: 'info',
                duration: 4000,
              }
            );
          } else if (result.skippedCount > 0) {
            toast.show(
              `${result.skippedCount} item${result.skippedCount !== 1 ? 's were' : ' was'} skipped (no image available).`,
              {
                type: 'warning',
                duration: 3000,
              }
            );
          }
        }, 900);
      } else {
        toast.show('No items could be processed. Please select items with images.', {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error: any) {
      if (selectItemsModalRef.current) {
        selectItemsModalRef.current.completeProcessing();
      }
      
      setTimeout(() => {
        setShowSelectItemsForPlanModal(false);
        toast.show(error?.message || 'Error processing items. Please try again.', {
          type: 'danger',
          duration: 4000,
        });
      }, 900);
    }
  }, [token, dispatch, toast, initialSelectedItems, temporaryAddItemToOutfitSlice]);

  const handleSelectItemsForPlanClose = useCallback(() => {
    setShowSelectItemsForPlanModal(false);
  }, []);

  const handleSelectItemsForPlanSkip = useCallback(() => {
    setShowSelectItemsForPlanModal(false);
  }, []);

  const renderTemplate = (
    <View style={styles.createOutfitWrapper}>
      <View style={styles.createOutfitHeader}>
        <View style={styles.createOutfitHeader}>
          <View style={styles.createOutfitClear}>
            <CustomButton
              title={t('wardrobe.clear')}
              buttonStyle={styles.clearButtonWrapper}
              textStyle={styles.clearButtonText}
              onPress={() => {
                dispatch(setTemporaryAddItemToOutfit([]));
                setIsMakePublic(false);
                dispatch(setRefNumber(generateGUID()));
                dispatch(setOutfitCanvasPosition([]));
              }}
            />
            {/* {outfitEditDetails ? (
              <CustomButton
                title="Edit"
                buttonStyle={styles.editButtonWrapper}
                textStyle={styles.editButtonText}
                onPress={() => {
                  dispatch(setIsEdit(true));
                }}
              />
            ) : (
              <CustomButton
                title="Clear"
                buttonStyle={styles.clearButtonWrapper}
                textStyle={styles.clearButtonText}
                onPress={() => {
                  dispatch(setTemporaryAddItemToOutfit([]));
                  setIsMakePublic(false);
                  dispatch(setRefNumber(""));
                }}
              />
            )} */}
          </View>
        </View>
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "transparent"]}
          style={styles.shadowGradient}
        />
        {/* <View style={styles.createOutfitSwitch}>
          <Text style={styles.createOutfitSwitchText}>Make Public</Text>
          <Switch
            trackColor={{
              false: "rgba(203, 214, 224, 1)",
              true: "rgba(255, 59, 74, 1)",
            }}
            thumbColor={isMakePublic ? "white" : "rgba(255, 255, 255, 1)"}
            ios_backgroundColor="rgba(245, 245, 245, 1)"
            onValueChange={() => setIsMakePublic(!isMakePublic)}
            value={isMakePublic}
            style={{ padding: 0 }}
          />
        </View> */}
      </View>
      {isSkiaRuntimeUsable() && !outfitEditDetails && temporaryAddItemToOutfitSlice?.length > 0 ? (
        (() => {
          const CollageCanvasComp = getCollageCanvasSafely();
          return CollageCanvasComp ? <CollageCanvasComp /> : (
            <DraggableCanvas
              imageDetails={distructureImage}
              getImageCombined={handleUploadImage}
              imageLoader={imageLoader}
              handleRemoveimage={handleDeleteImage}
            />
          );
        })()
      ) : !outfitEditDetails && distructureImage ? (
        <DraggableCanvas
          imageDetails={distructureImage}
          getImageCombined={handleUploadImage}
          imageLoader={imageLoader}
          handleRemoveimage={handleDeleteImage}
        />
      ) : isEdit && distructureImage ? (
        <DraggableCanvas
          imageDetails={distructureImage}
          getImageCombined={handleUploadImage}
          imageLoader={imageLoader}
          handleRemoveimage={handleDeleteImage}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Image
              source={{ uri: outfitEditDetails?.imageUrl }}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </View>
          <View style={{ paddingBottom: 30, paddingHorizontal: 16 }}>
            <Text
              style={{
                textTransform: "capitalize",
                marginBottom: 6,
                fontFamily: "DMSansBold",
                fontSize: 16,
                color: "rgba(33, 44, 61, 1)",
              }}
            >
              {outfitEditDetails?.title}
            </Text>
            <Text
              style={{
                textTransform: "capitalize",
                color: "rgba(35, 35, 35, 1)",
                fontSize: 12,
              }}
            >
              {outfitEditDetails?.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <StackHeader
            title={
              outfitEditDetails?.title
                ? capitalizeFirstLetter(outfitEditDetails?.title)
                : t('outfit.createOutfit')
            }
            onPress={() => router.back()}
          />
        </View>
        {temporaryAddItemToOutfitSlice?.length === 0 ? (
          outfitEditDetails ? (
            renderTemplate
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View style={{ paddingHorizontal: 20 }}>
                  <Text style={{ textAlign: "center", color: "#637381" }}>
                    {t('wardrobe.selectItemMessage')}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )
        ) : (
          renderTemplate
        )}

        {/* Positioned Button */}
        {(!outfitEditDetails || isEdit) && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.circleIcon}
            onPress={handleAddMoreItemsClick}
          >
            <View style={styles.iconButton}>
              <PlusIcon />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* setShowSelectItemModal(false) */}
      {showSelectItemModal && <SelectItemModal isShow onClose={() => {}} />}

      {isShowCreateOutfitModal && (
        <CreateOutfitModal
          onClose={() => {
            setIsShowCreateOutfitModal(false);
            dispatch(setRefNumber(generateGUID()));
          }}
          isShow={isShowCreateOutfitModal}
          isMakePublic={isMakePublic}
          // imageUploadIds={imageUploadIds}
          refNumber={refNumber}
        />
      )}

      <SelectItemsForPlanModal
        ref={selectItemsModalRef}
        isVisible={showSelectItemsForPlanModal}
        onClose={handleSelectItemsForPlanClose}
        onSkip={handleSelectItemsForPlanSkip}
        onNext={handleSelectItemsForPlanNext}
        token={token || ''}
        loading={false}
        excludeItemIds={[]}
        initialSelectedItems={initialSelectedItems}
        headerAccessory={selectedDatePlan ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFD8DB', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color="#FF3B4A" />
            </View>
            <Text style={{ marginLeft: 8, color: '#071827', fontFamily: 'DMSansMedium' }}>
              {moment(selectedDatePlan).isSame(moment(), 'day') ? `Today, ${moment(selectedDatePlan).format('DD MMM')}` : `${moment(selectedDatePlan).format('ddd, DD MMM')}`}
            </Text>
          </View>
        ) : undefined}
      />
    </BottomSheetModalProvider>
  );
};

export default Outfit;

const styles = StyleSheet.create({
  circleIcon: {
    position: "absolute",
    right: 35,
    bottom: 120,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF5C68",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    backgroundColor: "#FF3B4A",
    borderRadius: 25,
  },
  createOutfitWrapper: {
    flex: 1,
  },
  createOutfitHeader: {
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  createOutfitClear: {},
  createOutfitBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    // backgroundColor: "green",
    flex: 1,
  },
  createOutfitSwitch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  createOutfitSwitchText: {
    marginRight: 12,
    color: "rgba(57, 57, 57, 1)",
    fontSize: 12,
    fontFamily: "DMSansMedium",
  },
  clearButtonWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 74, 1)",
    borderRadius: 20,
  },
  clearButtonText: {
    color: "rgba(255, 59, 74, 1)",
  },
  editButtonWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(7, 24, 39, 1)",
    borderRadius: 20,
  },
  editButtonText: {
    color: "rgba(7, 24, 39, 1)",
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
  },
  deleteIcon: {
    position: "absolute",
    top: 5,
    right: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
    resizeMode: "cover",
  },

  shadowGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20, // Height of the shadow
  },
  bottomShadowGradient: {
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    height: 15, // Height of the shadow
  },
});
