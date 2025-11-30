import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Colors, SIZES } from '../../constants/Colors';
import StackHeader from '../../components/StackHeader';
import PlusIcon from '../../assets/images/svg/add-circle-plus.svg';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useI18n } from '../../hooks/use-i18n';
import { useCollageStore } from '../../stores/collage-store';
import CustomButton from '../../components/CustomButton/index';
import CreateOutfitModal from '../../modals/CreateOutfitModal';
import fileServerServices from '../../services/features/file-server/fileServer';
import { useToast } from 'react-native-toast-notifications';
import { generateGUID } from '../../helper/guid-number';
import { setRefNumber, setTemporaryAddItemToOutfit } from '../../redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import { useCollageSerialization } from '../../hooks/use-collage-serialization';
import { ImageFormat, type CanvasRef, type SkRect } from '@shopify/react-native-skia';
import { setOutfitEditDetails, setIsActiveCollageEdit } from '../../redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import { getCollageCanvasSafely, isSkiaRuntimeUsable } from '../../services/skiaService';
import { calculateUnionBoundingBox } from '../../utils/collage-geometry';
import { getFileNameFromUrl } from '../../utils/url-formatter';
import SelectItemsForPlanModal, { SelectItemsForPlanModalRef } from '../../modals/SelectItemsForPlanModal';
import { processBatchItemsBackgroundRemoval } from '../../utils/planItemBackgroundProcessor';
import type { WardrobeItem } from '../../services/features/wardrobe-service/types';
import { syncCollageLayersWithWardrobeItems } from '../../utils/collage-layer-sync';

const CollageScreen: React.FC = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const { temporaryAddItemToOutfitSlice, refNumber } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const { outfitEditDetails } = useAppSelector((state) => state?.outfitEditDetailsSlice);

  const { addLayer, clearDocument, document, stageTransform, removeLayer } = useCollageStore();
  const { deserializeAndLoadCollage, hasCollageLayout } = useCollageSerialization();

  const [showSelectItemsModal, setShowSelectItemsModal] = useState(false);
  const [initialSelectedItems, setInitialSelectedItems] = useState<WardrobeItem[]>([]);
  const selectItemsModalRef = useRef<SelectItemsForPlanModalRef | null>(null);

  const isSkiaAvailable = useMemo(() => isSkiaRuntimeUsable(), []);
  const [hasDeserializedMetadata, setHasDeserializedMetadata] = useState(false);
  const [isLoadingTransforms, setIsLoadingTransforms] = useState(false);
  const [showDraftRecoveryModal, setShowDraftRecoveryModal] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!isSkiaAvailable) {
      router.replace('/outfit');
      return;
    }
  }, [isSkiaAvailable]);

  useEffect(() => {
    const checkForDraft = async () => {
      if (hasMountedRef.current) return;
      hasMountedRef.current = true;

      if (!outfitEditDetails?.id && temporaryAddItemToOutfitSlice?.length === 0) {
        try {
          const { loadDraftFromFile } = await import('../../utils/collage-io');
          const result = await loadDraftFromFile();

          if (result.success && result.document && result.document.layers.length > 0) {
            setShowDraftRecoveryModal(true);
          }
        } catch {
          // Draft check failed
        }
      }
    };

    checkForDraft();
  }, [outfitEditDetails?.id, temporaryAddItemToOutfitSlice?.length]);

  useEffect(() => {
    const deserializeMetadata = async () => {
      if (outfitEditDetails?.metadata && !hasDeserializedMetadata && temporaryAddItemToOutfitSlice?.length > 0) {
        setIsLoadingTransforms(true);

        try {
          const hasCollage = hasCollageLayout(outfitEditDetails.metadata);
          if (hasCollage) {
            const success = deserializeAndLoadCollage(
              outfitEditDetails.metadata,
              temporaryAddItemToOutfitSlice as unknown as WardrobeItem[]
            );

            if (success) {
              setHasDeserializedMetadata(true);
            }
          }
        } catch {
          // Deserialization failed
        } finally {
          setTimeout(() => {
            setIsLoadingTransforms(false);
          }, 300);
        }
      }
    };

    deserializeMetadata();
  }, [outfitEditDetails?.metadata, hasDeserializedMetadata, temporaryAddItemToOutfitSlice, hasCollageLayout, deserializeAndLoadCollage]);

  useEffect(() => {
    const collageDocument = useCollageStore.getState().document;

    if (!temporaryAddItemToOutfitSlice || temporaryAddItemToOutfitSlice.length === 0) {
      return;
    }

    const canvasWidth = collageDocument?.width ?? 400;
    const canvasHeight = collageDocument?.height ?? 600;

    syncCollageLayersWithWardrobeItems({
      items: temporaryAddItemToOutfitSlice as unknown as WardrobeItem[],
      canvasWidth,
      canvasHeight,
      existingLayers: collageDocument?.layers,
      addLayer,
      removeLayer,
    });
  }, [temporaryAddItemToOutfitSlice, addLayer, removeLayer]);

  const handleAddMoreItemsClick = useCallback(() => {
    setInitialSelectedItems((temporaryAddItemToOutfitSlice as unknown as WardrobeItem[]) || []);
    setShowSelectItemsModal(true);
  }, [temporaryAddItemToOutfitSlice]);

  const handleSelectItemsClose = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  const handleSelectItemsSkip = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  const handleSelectItemsNext = useCallback(
    async (selectedItems: WardrobeItem[]) => {
      if (!token || selectedItems.length === 0) {
        return;
      }

      try {
        const existingItemIds = new Set(initialSelectedItems.map(item => item.id));
        const newItems = selectedItems.filter(item => !existingItemIds.has(item.id));
        const selectedItemIds = new Set(selectedItems.map(item => item.id));

        const keptExistingItemsFromCanvas =
          temporaryAddItemToOutfitSlice?.filter((item: any) => selectedItemIds.has(item.id)) || [];

        if (newItems.length === 0) {
          if (keptExistingItemsFromCanvas.length < temporaryAddItemToOutfitSlice.length) {
            dispatch(setTemporaryAddItemToOutfit(keptExistingItemsFromCanvas));
            toast.show('Items updated', { type: 'success', duration: 2000 });
          }
          setShowSelectItemsModal(false);
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
            setShowSelectItemsModal(false);

            if (result.skippedCount > 0 && result.itemsWithOriginalImage > 0) {
              toast.show(
                `${result.itemsWithOriginalImage} item${result.itemsWithOriginalImage !== 1 ? 's' : ''
                } using original image (background removal unavailable). ${result.skippedCount} item${result.skippedCount !== 1 ? 's were' : ' was'
                } skipped.`,
                {
                  type: 'warning',
                  duration: 4000,
                }
              );
            } else if (result.itemsWithOriginalImage > 0) {
              toast.show(
                `${result.itemsWithOriginalImage} item${result.itemsWithOriginalImage !== 1 ? 's' : ''
                } using original image - background removal unavailable at the moment.`,
                {
                  type: 'info',
                  duration: 4000,
                }
              );
            } else if (result.skippedCount > 0) {
              toast.show(
                `${result.skippedCount} item${result.skippedCount !== 1 ? 's were' : ' was'
                } skipped (no image available).`,
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
      } catch (error: unknown) {
        if (selectItemsModalRef.current) {
          selectItemsModalRef.current.completeProcessing();
        }

        setTimeout(() => {
          setShowSelectItemsModal(false);
          const errorMessage =
            error instanceof Error ? error.message : 'Error processing items. Please try again.';
          toast.show(errorMessage, {
            type: 'danger',
            duration: 4000,
          });
        }, 900);
      }
    },
    [token, dispatch, toast, initialSelectedItems, temporaryAddItemToOutfitSlice]
  );

  const handleClear = useCallback(async () => {
    dispatch(setTemporaryAddItemToOutfit([]));
    dispatch(setRefNumber(generateGUID()));
    clearDocument();
    setHasDeserializedMetadata(false);

    try {
      const { deleteDraftFile } = await import('../../utils/collage-io');
      await deleteDraftFile();
    } catch {
      // Draft clear failed
    }
  }, [dispatch, clearDocument]);

  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasRef = useRef<CanvasRef | null>(null);

  useEffect(() => {
    if (!temporaryAddItemToOutfitSlice || temporaryAddItemToOutfitSlice.length === 0) {
      setCanvasReady(false);
    }
  }, [temporaryAddItemToOutfitSlice]);

  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleRestoreDraft = useCallback(async () => {
    try {
      const { loadDraftFromFile } = await import('../../utils/collage-io');
      const result = await loadDraftFromFile();

      if (result.success && result.document) {
        useCollageStore.getState().setDocument(result.document);
        toast.show(t('collage.draftRestored', undefined, 'Draft restored successfully'), {
          type: 'success',
          duration: 2000
        });
      }
    } catch {
      toast.show(t('errors.somethingWentWrong', undefined, 'Failed to restore draft'), {
        type: 'danger',
        duration: 3000
      });
    } finally {
      setShowDraftRecoveryModal(false);
    }
  }, [toast, t]);

  const handleDiscardDraft = useCallback(async () => {
    try {
      const { deleteDraftFile } = await import('../../utils/collage-io');
      await deleteDraftFile();
    } catch {
      // Draft discard failed
    } finally {
      setShowDraftRecoveryModal(false);
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (!token) {
      toast.show(t('errors.somethingWentWrong', undefined, 'Authentication required'), { type: 'danger', duration: 3000 });
      return;
    }

    if (!canvasRef.current) {
      toast.show(t('errors.somethingWentWrong', undefined, 'Canvas not ready'), { type: 'danger', duration: 3000 });
      return;
    }

    if (!temporaryAddItemToOutfitSlice || temporaryAddItemToOutfitSlice.length === 0) {
      toast.show(t('outfit.selectItemsFirst', undefined, 'Please add items to your outfit first'), { type: 'info', duration: 3000 });
      return;
    }

    const currentRefNumber = refNumber || generateGUID();
    if (!refNumber) {
      dispatch(setRefNumber(currentRefNumber));
    }

    const isEditMode = Boolean(outfitEditDetails?.id);
    let oldResourceName: string | null = null;

    if (isEditMode) {
      oldResourceName = getFileNameFromUrl(outfitEditDetails?.imageUrl);

      if (!oldResourceName) {
        toast.show(
          t('errors.somethingWentWrong', undefined, 'Unable to find existing outfit image'),
          { type: 'danger', duration: 3000 }
        );
        return;
      }
    }

    let fileUri: string | null = null;

    try {
      setExporting(true);

      // Clear selection before capturing to avoid capturing handles/borders
      useCollageStore.getState().clearSelection();

      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const visibleLayers = document?.layers.filter(layer => !layer.isHidden) || [];

      if (visibleLayers.length === 0) {
        toast.show(t('outfit.noVisibleItems', undefined, 'No visible items to export'), { type: 'info', duration: 3000 });
        setExporting(false);
        return;
      }

      const contentBounds = calculateUnionBoundingBox(visibleLayers);

      if (!contentBounds) {
        toast.show(t('errors.somethingWentWrong', undefined, 'Unable to calculate content bounds'), { type: 'danger', duration: 3000 });
        setExporting(false);
        return;
      }

      const PADDING = 40;
      const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
      const CANVAS_WIDTH = SCREEN_WIDTH;
      const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.7;

      const stageScale = stageTransform.scale ?? 1;
      const stageTx = stageTransform.translateX ?? 0;
      const stageTy = stageTransform.translateY ?? 0;

      const viewX = contentBounds.x * stageScale + stageTx;
      const viewY = contentBounds.y * stageScale + stageTy;
      const viewWidth = contentBounds.width * stageScale;
      const viewHeight = contentBounds.height * stageScale;

      const paddedX = Math.max(0, viewX - PADDING);
      const paddedY = Math.max(0, viewY - PADDING);
      const paddedWidth = Math.min(CANVAS_WIDTH - paddedX, viewWidth + (PADDING * 2));
      const paddedHeight = Math.min(CANVAS_HEIGHT - paddedY, viewHeight + (PADDING * 2));

      const exportRect: SkRect = {
        x: paddedX,
        y: paddedY,
        width: paddedWidth,
        height: paddedHeight,
      };

      if (exportRect.width <= 0 || exportRect.height <= 0) {
        toast.show(t('errors.somethingWentWrong', undefined, 'Invalid export dimensions'), { type: 'danger', duration: 3000 });
        setExporting(false);
        return;
      }

      const image = await canvasRef.current.makeImageSnapshotAsync(exportRect);

      if (!image) {
        toast.show(t('errors.somethingWentWrong', undefined, 'Unable to capture canvas'), { type: 'danger', duration: 3000 });
        setExporting(false);
        return;
      }

      const MAX_EXPORT_SIZE = 4096;
      const w = image.width() ?? 0;
      const h = image.height() ?? 0;

      if (w === 0 || h === 0) {
        toast.show(t('errors.somethingWentWrong', undefined, 'Invalid canvas dimensions'), { type: 'danger', duration: 3000 });
        setExporting(false);
        return;
      }

      const FileSystem = require('expo-file-system');
      const ImageManipulator = require('expo-image-manipulator');

      const base64 = image.encodeToBase64(ImageFormat.PNG, 100);

      if (!base64) {
        toast.show(t('errors.somethingWentWrong', undefined, 'Failed to encode image'), { type: 'danger', duration: 3000 });
        setExporting(false);
        return;
      }

      fileUri = `${FileSystem.cacheDirectory}collage_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

      if (Math.max(w, h) > MAX_EXPORT_SIZE) {
        const scale = MAX_EXPORT_SIZE / Math.max(w, h);
        const targetW = Math.round(w * scale);
        const targetH = Math.round(h * scale);
        const resized = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: targetW, height: targetH } }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch {
          // Delete failed
        }
        fileUri = resized.uri;
      }

      const isPlatformAndroid = Platform.OS === 'android';
      const imageData = { imageUri: fileUri, type: 'image/png' };
      const result = isEditMode
        ? await fileServerServices.updateOutfitImage(
          [imageData],
          isPlatformAndroid,
          currentRefNumber,
          token,
          oldResourceName as string
        )
        : await fileServerServices.outfitImageUpload([imageData], isPlatformAndroid, currentRefNumber, token);

      if (result?.status === 200) {
        try {
          const { deleteDraftFile } = await import('../../utils/collage-io');
          await deleteDraftFile();
        } catch {
          // Draft clear failed
        }

        if (outfitEditDetails?.id) {
          try {
            const imageResponse = await fileServerServices.getUserOutfitPicture(token, currentRefNumber);
            if (imageResponse?.status === 200 && imageResponse?.data) {
              const imageUrl = (imageResponse.data as any)?.resourceUrl;
              if (imageUrl) {
                dispatch(setOutfitEditDetails({
                  ...outfitEditDetails,
                  imageUrl,
                }));
              }
            }
          } catch {
            // Image fetch failed
          }
        }

        dispatch(setIsActiveCollageEdit(true));
        setShowCreateModal(true);
        setExporting(false);
        return;
      }

      if (result?.responseCode === 401 || result?.responseCode === '401') {
        router.push('/Onboarding');
        setExporting(false);
        return;
      }

      setExporting(false);
      toast.show(result?.message || result?.detail || t('errors.somethingWentWrong', undefined, 'Upload failed'), { type: 'danger', duration: 4000 });
    } catch (error: unknown) {
      setExporting(false);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast.show(t('errors.somethingWentWrong', undefined, errorMessage), { type: 'danger', duration: 3000 });
    } finally {
      if (fileUri) {
        try {
          const FileSystem = require('expo-file-system');
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch {
          // Cleanup failed
        }
      }
    }
  }, [token, refNumber, toast, t, temporaryAddItemToOutfitSlice, canvasRef, document, stageTransform, dispatch, outfitEditDetails]);

  const CollageCanvasComp = useMemo(() => (isSkiaAvailable ? getCollageCanvasSafely() : null), [isSkiaAvailable]);

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === 'ios' ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <StackHeader
            title={t('outfit.createOutfit')}
            onPress={() => router.back()}
            rightElement={
              <CustomButton
                title={t('wardrobe.clear')}
                buttonStyle={{ paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255, 59, 74, 1)', borderRadius: 20 }}
                textStyle={{ color: 'rgba(255, 59, 74, 1)' }}
                onPress={handleClear}
              />
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          {CollageCanvasComp && isSkiaAvailable && temporaryAddItemToOutfitSlice?.length > 0 ? (
            <CollageCanvasComp ref={canvasRef} onCanvasReady={handleCanvasReady} />
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateContent}>
                <Text style={styles.emptyStateTitle}>
                  {t('outfit.createYourOutfit', undefined, 'Create Your Outfit')}
                </Text>
                <Text style={styles.emptyStateDescription}>
                  {t('outfit.emptyStateMessage', undefined, 'Tap the + button to add items from your wardrobe')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.circleIcon}
          onPress={handleAddMoreItemsClick}
          accessibilityLabel="Add more items to outfit"
          accessibilityRole="button"
        >
          <View style={styles.iconButton}>
            <PlusIcon />
          </View>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <CustomButton
            title={t('common.continue', undefined, 'Continue')}
            buttonStyle={{
              padding: 14,
              backgroundColor: (!canvasReady || exporting || !temporaryAddItemToOutfitSlice?.length) ? 'rgba(255, 59, 74, 0.5)' : 'rgba(255, 59, 74, 1)',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            textStyle={{ color: 'white', textAlign: 'center', fontFamily: 'DMSansMedium', fontSize: 16, width: '100%' }}
            onPress={handleContinue}
            loader={exporting}
            disabled={!canvasReady || exporting || !temporaryAddItemToOutfitSlice?.length}
          />
        </View>

        {showCreateModal && (
          <CreateOutfitModal
            isShow={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              dispatch(setRefNumber(generateGUID()));
              dispatch(setIsActiveCollageEdit(false));
            }}
            isMakePublic={false}
            refNumber={refNumber}
          />
        )}

        <SelectItemsForPlanModal
          ref={selectItemsModalRef}
          isVisible={showSelectItemsModal}
          onClose={handleSelectItemsClose}
          onSkip={handleSelectItemsSkip}
          onNext={handleSelectItemsNext}
          token={token || ''}
          loading={false}
          excludeItemIds={[]}
          initialSelectedItems={initialSelectedItems}
        />

        {isLoadingTransforms && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3B4A" />
              <Text style={styles.loadingText}>
                {t('collage.loadingTransforms', undefined, 'Restoring outfit layout...')}
              </Text>
            </View>
          </View>
        )}

        {showDraftRecoveryModal && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={handleDiscardDraft}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.draftRecoveryModal}>
                <Text style={styles.draftRecoveryTitle}>
                  {t('collage.draftFound', undefined, 'Draft Found')}
                </Text>
                <Text style={styles.draftRecoveryMessage}>
                  {t('collage.draftFoundMessage', undefined, 'We found a previous draft. Would you like to restore it?')}
                </Text>
                <View style={styles.draftRecoveryButtons}>
                  <CustomButton
                    title={t('common.discard', undefined, 'Discard')}
                    buttonStyle={styles.draftDiscardButton}
                    textStyle={styles.draftDiscardButtonText}
                    onPress={handleDiscardDraft}
                  />
                  <CustomButton
                    title={t('common.restore', undefined, 'Restore')}
                    buttonStyle={styles.draftRestoreButton}
                    textStyle={styles.draftRestoreButtonText}
                    onPress={handleRestoreDraft}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </BottomSheetModalProvider>
  );
};

export default CollageScreen;

const styles = StyleSheet.create({
  circleIcon: {
    position: 'absolute',
    right: 35,
    bottom: 120,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5C68',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#FF3B4A',
    borderRadius: 25,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'DMSansBold',
    color: '#071827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#071827',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  draftRecoveryModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  draftRecoveryTitle: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 12,
    textAlign: 'center',
  },
  draftRecoveryMessage: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  draftRecoveryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  draftDiscardButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#637381',
    backgroundColor: 'white',
  },
  draftDiscardButtonText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#637381',
    textAlign: 'center',
  },
  draftRestoreButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FF3B4A',
  },
  draftRestoreButtonText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: 'white',
    textAlign: 'center',
  },
});
