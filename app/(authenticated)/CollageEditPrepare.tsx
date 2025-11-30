import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useI18n } from "@hooks/use-i18n";
import { processBatchItemsBackgroundRemoval } from "@utils/planItemBackgroundProcessor";
import { WardrobeItem } from "@services/features/wardrobe-service/types";
import ProcessingItemsList, {
  ProcessingItem,
} from "modals/SelectItemsForPlanModal/ProcessingItemsList";
import {
  setRefNumber,
  setTemporaryAddItemToOutfit,
} from "@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice";
import { generateGUID } from "@helper/guid-number";

const CollageEditPrepare = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const { outfitEditDetails } = useAppSelector(
    (state) => state.outfitEditDetailsSlice,
  );
  const { token } = useAppSelector((state) => state.userProfileSlice);

  const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const outfitItemsForProcessing: WardrobeItem[] = useMemo(() => {
    if (!outfitEditDetails?.items || !outfitEditDetails.items.length) {
      return [];
    }

    return outfitEditDetails.items.map((item) => ({
      id: item.id,
      brandName: item.name,
      name: item.name,
      itemDefaultImageUrl: item.imageUrl,
      itemDefaultTransparentImageUrl: item.imageUrl,
      itemImageUrls: [item.imageUrl],
      type: "item",
      requestId: outfitEditDetails.requestId,
    }));
  }, [outfitEditDetails]);

  const handleNavigateBack = useCallback(() => {
    router.back();
  }, []);

  useEffect(() => {
    if (!token || !outfitItemsForProcessing.length || hasStarted) {
      return;
    }

    const startProcessing = async () => {
      setHasStarted(true);
      setIsProcessing(true);
      setErrorMessage(null);
      setTotalItems(outfitItemsForProcessing.length);

      try {
        const result = await processBatchItemsBackgroundRemoval(
          outfitItemsForProcessing,
          token,
          (progress) => {
            setProcessingItems(
              progress.itemsProgress.map((itemProgress) => ({
                item: itemProgress.item,
                status: itemProgress.status,
              })),
            );
            setCurrentIndex(progress.currentIndex);
            setTotalItems(progress.totalItems);
          },
          3,
        );

        const processedItems: WardrobeItem[] = result.processedItems.map(
          (item) => ({
            ...item,
            type: "item",
          }),
        );

        dispatch(setTemporaryAddItemToOutfit(processedItems));

        const newRefNumber =
          outfitEditDetails?.requestId || generateGUID();
        dispatch(setRefNumber(newRefNumber));

        setCurrentIndex(result.totalCount);
        setIsProcessing(false);

        setTimeout(() => {
          router.replace("/collage");
        }, 500);
      } catch {
        setIsProcessing(false);
        setErrorMessage(
          t(
            "errors.somethingWentWrong",
            undefined,
            "Error processing items. Please try again.",
          ),
        );
      }
    };

    startProcessing();
  }, [dispatch, hasStarted, outfitEditDetails, outfitItemsForProcessing, t, token]);

  const hasItems = totalItems > 0 || outfitItemsForProcessing.length > 0;

  return (
    <BottomSheetModalProvider>
      <View
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <StackHeader
            title={t(
              "wardrobe.editOutfit",
              undefined,
              "Edit Outfit",
            )}
            onPress={handleNavigateBack}
          />
        </View>

        <View style={styles.contentContainer}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>
                {t(
                  "errors.somethingWentWrong",
                  undefined,
                  "Something went wrong",
                )}
              </Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          ) : hasItems ? (
            <ProcessingItemsList
              items={processingItems}
              currentIndex={currentIndex}
              totalItems={totalItems}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primaryBase} />
              <Text style={styles.loadingText}>
                {t(
                  "wardrobe.plan.preparingItems",
                  undefined,
                  "Preparing items...",
                )}
              </Text>
            </View>
          )}
        </View>

        {isProcessing && !processingItems.length && !errorMessage && (
          <View style={styles.globalLoader}>
            <ActivityIndicator size="small" color={Colors.light.primaryBase} />
          </View>
        )}
      </View>
    </BottomSheetModalProvider>
  );
};

export default CollageEditPrepare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "#637381",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#071827",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: "DMSansRegular",
    color: "#637381",
    textAlign: "center",
    lineHeight: 20,
  },
  globalLoader: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
  },
});


