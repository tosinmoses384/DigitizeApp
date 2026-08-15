import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '@redux/store';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import {
  setOutfitType,
  setRefNumber,
  setSelectedDatePlan,
  setTemporaryAddItemToOutfit,
} from '@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import { generateGUID } from '@helper/guid-number';
import { setOutfitEditDetails } from '@redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import PlusIcon from '../../assets/images/svg/add-circle-plus.svg';
import HorizontalDateSelector from './HorizontalDateSelector';
import PlanCalendarModal from '../../modals/PlanCalendarModal';
import RemoveOutfitFromDayModal from '../../modals/RemoveOutfitFromDayModal';
import PlanOutfitCard from './PlanOutfitCard';
import MyResponsiveGrid from '@components/MyResponsiveGrid';
import PlanEmptyState from './PlanEmptyState';
import LineLoader from '@components/LineLoader';
import { getEmptyStateCountLoader } from '@helper/get-empty-count-loader/getEmptyCountLoader';
import PlanActionSheetModal from '../../modals/PlanActionSheetModal';
import SelectOutfitModal from '../../modals/SelectOutfitModal';
import SelectItemsForPlanModal, { SelectItemsForPlanModalRef } from '../../modals/SelectItemsForPlanModal';
import OutfitCardActionModal from '../../modals/OutfitCardActionModal';
import MoveOutfitConfirmationModal from '../../modals/MoveOutfitConfirmationModal';
import { Ionicons } from '@expo/vector-icons';
import { processBatchItemsBackgroundRemoval } from '@utils/planItemBackgroundProcessor';
import { WardrobeItem } from '@services/features/wardrobe-service/types';
import { useI18n } from '@hooks/use-i18n';

interface WardrobeAssetRef {
  id: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  type?: 'WardrobeItem' | 'WardrobeOutfit';
}

interface OutfitData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  planDate?: string;
  wardrobeAssets?: WardrobeAssetRef[];
  wardrobeAssetIds?: string[];
}

type UserPlansResp = {
  data?: { dataset?: OutfitData[]; pageToken?: string | null; hasNextPage?: boolean };
  responseCode?: string | number;
  status?: number;
  message?: string;
  detail?: string;
};

type PlanErrorSource = {
  detail?: string;
  message?: string;
};

const getPlanErrorMessage = (source: PlanErrorSource | null | undefined, fallback: string): string => {
  if (source?.detail && typeof source.detail === 'string') {
    return source.detail;
  }

  if (source?.message && typeof source.message === 'string') {
    return source.message;
  }

  return fallback;
};

const CreatePlanView: React.FC = React.memo(() => {
  const toast = useToast();
  const { t, formatDate } = useI18n();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const { selectedDatePlan, refetchPlans } = useAppSelector(
    (state) => state?.temporaryAddItemToOutfitSlice
  );

  const [selectedDate, setSelectedDate] = useState<Date>(() => (
    selectedDatePlan ? moment(selectedDatePlan, 'YYYY-MM-DD').toDate() : new Date()
  ));
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigatingLoading, setNavigatingLoading] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showOutfitActionModal, setShowOutfitActionModal] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMovingOutfit, setIsMovingOutfit] = useState(false);
  const [showMoveConfirmationModal, setShowMoveConfirmationModal] = useState(false);
  const [targetMoveDate, setTargetMoveDate] = useState<Date | null>(null);
  const [targetDateOutfits, setTargetDateOutfits] = useState<OutfitData[]>([]);
  const [loadingTargetDateOutfits, setLoadingTargetDateOutfits] = useState(false);
  const [confirmMoveLoading, setConfirmMoveLoading] = useState(false);
  const [pendingAfterPreview, setPendingAfterPreview] = useState<null | 'calendar'>(null);
  const [cardWidth, setCardWidth] = useState(172);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [allMonthDates, setAllMonthDates] = useState<string[]>([]);
  const [autoPlanAfterCalendar, setAutoPlanAfterCalendar] = useState(false);
  const [showPlanSheet, setShowPlanSheet] = useState(false);
  const [showSelectOutfitModal, setShowSelectOutfitModal] = useState(false);
  const [submittingPlans, setSubmittingPlans] = useState(false);
  const [pendingNextModal, setPendingNextModal] = useState<null | 'selectOutfits' | 'calendar' | 'selectItems'>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSelectItemsModal, setShowSelectItemsModal] = useState(false);
  const selectItemsModalRef = useRef<SelectItemsForPlanModalRef>(null);
  const [selectItemsMode, setSelectItemsMode] = useState<'create-outfit' | 'direct-add'>('create-outfit');



  useEffect(() => {
    if (selectedDatePlan) {
      const parsedDate = moment(selectedDatePlan, 'YYYY-MM-DD').toDate();
      setSelectedDate(parsedDate);
    }
  }, [selectedDatePlan]);

  const sectionTitle = useMemo(
    () => t('wardrobe.plan.sectionTitle', undefined, 'Outfits you planned for this day'),
    [t]
  );

  const fetchOutfitsForDate = useCallback(async (date: Date) => {
    if (!token) return;

    setLoading(true);
    try {
      const startDate = moment(date).format('YYYY-MM-DD');
      const endDate = moment(date).format('YYYY-MM-DD');

      const response = await wardrobeServices.userUserPlans(
        token,
        '50',
        '',
        startDate,
        endDate
      );

      const resp = response as unknown as UserPlansResp;
      if (resp?.data?.dataset) {
        setOutfits(resp.data.dataset as OutfitData[]);
      } else {
        setOutfits([]);
      }

      if (response?.responseCode === 401 || response?.responseCode === '401') {
        router.push('/Onboarding');
      }
    } catch {
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMonthOutfitDates = useCallback(async (date: Date) => {
    if (!token) return;

    try {
      const selected = moment(date);
      const startDate = selected.clone().subtract(7, 'days').format('YYYY-MM-DD');
      const endDate = selected.clone().add(23, 'days').format('YYYY-MM-DD');

      const response = await wardrobeServices.userUserPlans(
        token,
        '100',
        '',
        startDate,
        endDate
      );

      const resp = response as unknown as UserPlansResp;
      if (resp?.data?.dataset) {
        const dates = resp.data.dataset.map((item: OutfitData) =>
          moment(item.planDate).format('YYYY-MM-DD')
        );
        const uniqueDates = Array.from(new Set(dates)) as string[];
        setAllMonthDates(uniqueDates);
      }
    } catch {
      setAllMonthDates([]);
    }
  }, [token]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchOutfitsForDate(selectedDate),
        fetchMonthOutfitDates(selectedDate),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, fetchOutfitsForDate, fetchMonthOutfitDates]);

  const handleSelectItemsNext = useCallback(async (selectedItems: WardrobeItem[]) => {
    if (!token || selectedItems.length === 0) {
      return;
    }

    try {
      const result = await processBatchItemsBackgroundRemoval(
        selectedItems,
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

      if (result.processedItems.length > 0) {
        dispatch(setTemporaryAddItemToOutfit(result.processedItems));
        dispatch(setRefNumber(generateGUID()));
        dispatch(setOutfitType('create plan outfit'));
        dispatch(setSelectedDatePlan(moment(selectedDate).format('YYYY-MM-DD')));

        setTimeout(() => {
          if (result.skippedCount > 0 && result.itemsWithOriginalImage > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsOriginalAndSkipped', {
                itemsWithOriginalImage: result.itemsWithOriginalImage,
                skippedCount: result.skippedCount,
              }, `${result.itemsWithOriginalImage} item(s) using original image (background removal unavailable). ${result.skippedCount} item(s) skipped.`),
              { type: 'warning', duration: 4000 }
            );
          } else if (result.itemsWithOriginalImage > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsOriginal', { count: result.itemsWithOriginalImage }, `${result.itemsWithOriginalImage} item(s) using original image - background removal unavailable at the moment.`),
              { type: 'info', duration: 4000 }
            );
          } else if (result.skippedCount > 0) {
            toast.show(
              t('wardrobe.plan.processing.itemsSkipped', { count: result.skippedCount }, `${result.skippedCount} item(s) skipped (no image available).`),
              { type: 'warning', duration: 3000 }
            );
          }

          router.push('/collage');
        }, 900);
      } else {
        toast.show(t('wardrobe.plan.processing.none', undefined, 'No items could be processed. Please select items with images.'), {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error: any) {
      if (selectItemsModalRef.current) {
        selectItemsModalRef.current.completeProcessing();
      }

      setTimeout(() => {
        setShowSelectItemsModal(false);
        toast.show(error?.message || t('wardrobe.plan.errorProcessingItems', undefined, 'Error processing items. Please try again.'), {
          type: 'danger',
          duration: 4000,
        });
      }, 900);
    }
  }, [token, dispatch, toast, selectedDate, t]);

  const handleDirectAddItemsNext = useCallback(async (selectedItems: WardrobeItem[]) => {
    if (!token || selectedItems.length === 0) {
      setShowSelectItemsModal(false);
      return;
    }

    setSubmittingPlans(true);
    try {
      const request = {
        planDate: selectedDatePlan || moment(selectedDate).format('YYYY-MM-DD'),
        description: '',
        title: '',
        wardrobeAssetIds: selectedItems.map((item) => item.id),
      };

      const res = await wardrobeServices.postUserPlanAssets(request, token);
      if (res?.status === 200 || res?.status === 201) {
        setShowSelectItemsModal(false);
        await fetchOutfitsForDate(selectedDate);
        await fetchMonthOutfitDates(selectedDate);
        toast.show(
          t('wardrobe.plan.addedItemsToDate', {
            count: selectedItems.length,
            date: formatDate(selectedDate, { month: 'short', day: 'numeric' }),
          }, `Added ${selectedItems.length} item(s) to ${formatDate(selectedDate, { month: 'short', day: 'numeric' })}`),
          { type: 'success', duration: 3000 }
        );
      } else if (res?.responseCode === 401 || res?.responseCode === '401') {
        router.push('/Onboarding');
      } else {
        setShowSelectItemsModal(false);
        const errorMessage = getPlanErrorMessage(
          res,
          t('wardrobe.plan.failedToAddItems', undefined, 'Failed to add items')
        );
        toast.show(errorMessage, { type: 'danger', duration: 3000 });
      }
    } catch (e: any) {
      setShowSelectItemsModal(false);
      const errorMessage = getPlanErrorMessage(
        e,
        t('wardrobe.plan.errorAddingItems', undefined, 'Error adding items')
      );
      toast.show(errorMessage, { type: 'danger', duration: 3000 });
    } finally {
      setSubmittingPlans(false);
    }
  }, [token, selectedDatePlan, selectedDate, fetchOutfitsForDate, fetchMonthOutfitDates, toast, t, formatDate]);

  const handleSelectItemsSkip = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  const handleSelectItemsClose = useCallback(() => {
    setShowSelectItemsModal(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchOutfitsForDate(selectedDate);
      fetchMonthOutfitDates(selectedDate);
    }
  }, [token, selectedDate, fetchOutfitsForDate, fetchMonthOutfitDates, refetchPlans]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!loading && outfits.length === 0) {
      timer = setTimeout(() => {
        setShowEmptyState(true);
      }, 500);
    } else {
      setShowEmptyState(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, outfits]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    const dateDataStr = moment(date).format('YYYY-MM-DD');
    dispatch(setSelectedDatePlan(dateDataStr));
  }, [dispatch]);

  const handleCalendarPress = useCallback(() => {
    setShowCalendarModal(true);
  }, []);

  const handleCalendarClose = useCallback(() => {
    setShowCalendarModal(false);
    // Do not clear selectedOutfit here. It is needed for the confirmation modal.
    // Cleanup is handled by handleMoveConfirmationClose or when user cancels flows explicitly.
    setIsMovingOutfit(false);
  }, []);

  const handleCalendarDateSelect = useCallback(async (date: Date) => {
    if (isMovingOutfit && selectedOutfit && token) {
      setTargetMoveDate(date);
      setShowCalendarModal(false);
      setLoadingTargetDateOutfits(true);
      setShowMoveConfirmationModal(true);

      try {
        const startDate = moment(date).format('YYYY-MM-DD');
        const endDate = moment(date).format('YYYY-MM-DD');

        const response = await wardrobeServices.userUserPlans(
          token,
          '10',
          '',
          startDate,
          endDate
        );

        const resp = response as unknown as UserPlansResp;
        if (resp?.data?.dataset) {
          setTargetDateOutfits(resp.data.dataset as OutfitData[]);
        } else if (resp?.responseCode === 401 || resp?.responseCode === '401') {
          router.push('/Onboarding');
        } else {
          setTargetDateOutfits([]);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error fetching target date outfits:', error);
        }
        setTargetDateOutfits([]);
      } finally {
        setLoadingTargetDateOutfits(false);
      }
    } else {
      handleDateSelect(date);
      if (autoPlanAfterCalendar && !moment(date).isBefore(moment(), 'day')) {
        setAutoPlanAfterCalendar(false);
        setTimeout(() => {
          setShowPlanSheet(true);
        }, 0);
      } else {
        setAutoPlanAfterCalendar(false);
      }
    }
  }, [handleDateSelect, autoPlanAfterCalendar, isMovingOutfit, selectedOutfit, token]);

  const handleOutfitPress = useCallback(async (outfit: OutfitData) => {
    if (!outfit.wardrobeAssets || outfit.wardrobeAssets.length === 0) {
      toast.show(t('wardrobe.plan.noAssetData', undefined, 'No asset data available'), {
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const firstAsset = outfit.wardrobeAssets[0];
    const assetType = firstAsset.type;
    const assetId = firstAsset.id;

    if (assetType === 'WardrobeItem') {
      try {
        setNavigatingLoading(true);
        let itemResponse = await wardrobeServices.getItemByIdUpdated(token, assetId);

        if (!itemResponse?.data) {
          // Fallback to getItemById if updated endpoint fails to return data
          try {
            itemResponse = await wardrobeServices.getItemById(token, assetId);
          } catch (e) {
            // Ignore fallback error to show original or generic error
          }
        }

        if (itemResponse?.data) {
          router.push({
            pathname: '/itemDetail',
            params: { item: JSON.stringify(itemResponse.data) },
          });
        } else if (itemResponse?.responseCode === 401 || itemResponse?.responseCode === '401') {
          router.push('/Onboarding');
        } else {
          toast.show(t('wardrobe.plan.failedToLoadItem', undefined, 'Failed to load item details'), {
            type: 'danger',
            duration: 3000,
          });
        }
      } catch (error: any) {
        toast.show(error?.message || t('wardrobe.plan.errorLoadingItem', undefined, 'Error loading item details'), {
          type: 'danger',
          duration: 3000,
        });
      } finally {
        setNavigatingLoading(false);
      }
    } else if (assetType === 'WardrobeOutfit') {
      try {
        setNavigatingLoading(true);
        const outfitResponse = await wardrobeServices.getOutfit(token, assetId);

        if (outfitResponse?.data) {
          dispatch(setOutfitEditDetails(outfitResponse.data));
          dispatch(setOutfitType('create plan outfit'));
          router.push('/EditOutfitView');
        } else if (outfitResponse?.responseCode === 401 || outfitResponse?.responseCode === '401') {
          router.push('/Onboarding');
        } else {
          toast.show(t('wardrobe.plan.failedToLoadOutfit', undefined, 'Failed to load outfit details'), {
            type: 'danger',
            duration: 3000,
          });
        }
      } catch (error: any) {
        toast.show(error?.message || t('wardrobe.plan.errorLoadingOutfit', undefined, 'Error loading outfit details'), {
          type: 'danger',
          duration: 3000,
        });
      } finally {
        setNavigatingLoading(false);
      }
    } else {
      toast.show(t('wardrobe.plan.unknownAssetType', undefined, 'Unknown asset type'), {
        type: 'warning',
        duration: 3000,
      });
    }
  }, [dispatch, token, toast, t]);

  const handleOutfitMenuPress = useCallback((outfit: OutfitData) => {
    setSelectedOutfit(outfit);
    setShowOutfitActionModal(true);
  }, []);

  const handleOutfitActionModalClose = useCallback(() => {
    setShowOutfitActionModal(false);
    // Don't clear selectedOutfit here - it's needed by the actions that execute after modal closes
  }, []);

  const handleOutfitActionModalCloseComplete = useCallback(() => {
    // Intentionally no-op.
    // Do NOT clear selectedOutfit here because follow-up actions
    // (opening calendar or remove modal) may run in the same tick.
    // Cleanup is handled explicitly by the respective flows:
    // - handleCalendarClose / handleMoveConfirmationClose
    // - handleRemoveModalClose
  }, []);

  const handlePlanForLater = useCallback(() => {
    // This is called AFTER OutfitCardActionModal closes completely
    // Safe to open calendar modal now - no race condition
    if (selectedOutfit) {
      setIsMovingOutfit(true);
      setShowCalendarModal(true);
    }
  }, [selectedOutfit]);

  const handleRemoveFromAction = useCallback(() => {
    // This is called AFTER OutfitCardActionModal closes completely
    // Safe to open remove modal now - no race condition
    setShowRemoveModal(true);
  }, []);

  const handleMoveConfirmationClose = useCallback(() => {
    setShowMoveConfirmationModal(false);
    setIsMovingOutfit(false);
    setTargetMoveDate(null);
    setTargetDateOutfits([]);
    setSelectedOutfit(null);
  }, []);

  const handleConfirmMove = useCallback(async () => {
    if (!selectedOutfit || !token || !targetMoveDate) return;

    setConfirmMoveLoading(true);

    try {
      const existingIdsFromArray = Array.isArray(selectedOutfit.wardrobeAssetIds)
        ? selectedOutfit.wardrobeAssetIds
        : [];
      const existingIdsFromObjects = Array.isArray(selectedOutfit.wardrobeAssets)
        ? selectedOutfit.wardrobeAssets.map((a) => a.id).filter(Boolean)
        : [];
      const wardrobeAssetIds = existingIdsFromArray.length > 0
        ? existingIdsFromArray
        : existingIdsFromObjects;

      if (wardrobeAssetIds.length === 0) {
        toast.show(t('wardrobe.plan.cannotMoveOutfitMissingAssets', undefined, 'Cannot move outfit: wardrobe assets missing.'), {
          type: 'danger',
          duration: 3000,
        });
        setConfirmMoveLoading(false);
        return;
      }

      const request = {
        planDate: moment(targetMoveDate).format('YYYY-MM-DD'),
        description: selectedOutfit.description || selectedOutfit.title || '',
        wardrobeAssetIds,
      };

      const res = await wardrobeServices.editUserPlans(request, token, selectedOutfit.id);

      if (res?.status === 200 || res?.status === 201) {
        await fetchOutfitsForDate(selectedDate);
        await fetchMonthOutfitDates(selectedDate);

        if (!moment(targetMoveDate).isSame(selectedDate, 'day')) {
          await fetchMonthOutfitDates(targetMoveDate);
        }

        setShowMoveConfirmationModal(false);
        setIsMovingOutfit(false);
        setTargetMoveDate(null);
        setTargetDateOutfits([]);
        setSelectedOutfit(null);

        toast.show(
          t('wardrobe.plan.movedOutfitToDate', {
            date: formatDate(targetMoveDate, { month: 'short', day: 'numeric', year: 'numeric' })
          }, `Outfit moved to ${formatDate(targetMoveDate, { month: 'short', day: 'numeric', year: 'numeric' })}`),
          { type: 'success', duration: 3000 }
        );

        if (!moment(targetMoveDate).isSame(selectedDate, 'day')) {
          handleDateSelect(targetMoveDate);
        }
      } else if (res?.responseCode === 401 || res?.responseCode === '401') {
        router.push('/Onboarding');
      } else {
        toast.show(res?.message || t('wardrobe.plan.failedToMoveOutfit', undefined, 'Failed to move outfit'), {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error: any) {
      toast.show(error?.message || t('wardrobe.plan.errorMovingOutfit', undefined, 'Error moving outfit'), {
        type: 'danger',
        duration: 3000,
      });
    } finally {
      setConfirmMoveLoading(false);
    }
  }, [selectedOutfit, token, targetMoveDate, selectedDate, fetchOutfitsForDate, fetchMonthOutfitDates, toast, handleDateSelect, t, formatDate]);

  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
    setSelectedOutfit(null);
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!selectedOutfit || !token) return;

    setDeleteLoading(true);
    try {
      const response = await wardrobeServices.deleteUserPlan(
        token,
        selectedOutfit.id
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.show(t('wardrobe.plan.removedOutfitFromDay', undefined, 'Outfit removed from this day'), {
          type: 'success',
          duration: 3000,
        });

        setOutfits((prev) => prev.filter((o) => o.id !== selectedOutfit.id));
        fetchMonthOutfitDates(selectedDate);
        setShowRemoveModal(false);
        setSelectedOutfit(null);
      } else {
        toast.show(response?.message || t('wardrobe.plan.failedToRemoveOutfit', undefined, 'Failed to remove outfit'), {
          type: 'danger',
          duration: 3000,
        });
      }
    } catch {
      toast.show(t('wardrobe.plan.errorRemovingOutfit', undefined, 'Error removing outfit'), {
        type: 'danger',
        duration: 3000,
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedOutfit, token, toast, selectedDate, fetchMonthOutfitDates, t]);



  const emptyLoadingTemplate = useMemo(() => {
    return getEmptyStateCountLoader(4)?.map((list: any, index: number) => (
      <View style={[styles.cardContainer, { width: cardWidth }]} key={index}>
        <View style={styles.loadingImageView}>
          <LineLoader />
        </View>
      </View>
    ));
  }, [cardWidth]);

  const outfitCardsTemplate = useMemo(() => {
    return outfits.map((outfit) => (
      <PlanOutfitCard
        key={outfit.id}
        outfit={outfit}
        onPress={handleOutfitPress}
        onMenuPress={handleOutfitMenuPress}
        cardWidth={cardWidth}
      />
    ));
  }, [outfits, cardWidth, handleOutfitPress, handleOutfitMenuPress]);

  const isEmpty = useMemo(() => !loading && outfits.length === 0 && showEmptyState, [loading, outfits, showEmptyState]);
  const isPastSelected = useMemo(() => moment(selectedDate).isBefore(moment(), 'day'), [selectedDate]);

  return (
    <View style={styles.container}>
      <HorizontalDateSelector
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onCalendarPress={handleCalendarPress}
        outfitDates={allMonthDates}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF3B4A"
            colors={['#FF3B4A']}
          />
        }
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>

          <View style={styles.outfitsContainer}>
            {loading ? (
              <MyResponsiveGrid
                template={emptyLoadingTemplate}
                getNumberOfRows={(width: number) => setCardWidth(width)}
              />
            ) : outfits.length > 0 ? (
              <MyResponsiveGrid
                template={outfitCardsTemplate}
                getNumberOfRows={(width: number) => setCardWidth(width)}
              />
            ) : (
              showEmptyState && (
                <PlanEmptyState
                  selectedDate={selectedDate}
                  onPrimaryPress={() => {
                    if (isPastSelected) {
                      setAutoPlanAfterCalendar(true);
                      setShowCalendarModal(true);
                    } else {
                      setShowPlanSheet(true);
                    }
                  }}
                />
              )
            )}
          </View>
        </View>
      </ScrollView>

      {!isEmpty && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowPlanSheet(true)}
          accessibilityRole="button"
          accessibilityLabel={t('wardrobe.plan.a11y.addOutfitToPlan', undefined, 'Add outfit to plan')}
        >
          <PlusIcon />
        </TouchableOpacity>
      )}

      <PlanCalendarModal
        isVisible={showCalendarModal}
        onClose={handleCalendarClose}
        onSelectDate={handleCalendarDateSelect}
        selectedDate={selectedDate}
        outfitDates={allMonthDates}
      />

      <OutfitCardActionModal
        isVisible={showOutfitActionModal}
        onClose={handleOutfitActionModalClose}
        onCloseComplete={handleOutfitActionModalCloseComplete}
        onPlanForLater={handlePlanForLater}
        onRemove={handleRemoveFromAction}
      />

      <MoveOutfitConfirmationModal
        isVisible={showMoveConfirmationModal}
        onClose={handleMoveConfirmationClose}
        onCloseComplete={() => {
          if (pendingAfterPreview === 'calendar') {
            setPendingAfterPreview(null);
            setIsMovingOutfit(true);
            setShowCalendarModal(true);
          }
        }}
        onChangeDate={() => {
          setPendingAfterPreview('calendar');
          setShowMoveConfirmationModal(false);
        }}
        onConfirm={handleConfirmMove}
        outfit={selectedOutfit}
        targetDate={targetMoveDate}
        existingOutfits={targetDateOutfits}
        loading={loadingTargetDateOutfits}
        confirmLoading={confirmMoveLoading}
      />

      <RemoveOutfitFromDayModal
        isVisible={showRemoveModal}
        onClose={handleRemoveModalClose}
        onConfirm={handleRemoveConfirm}
        outfit={selectedOutfit}
        loading={deleteLoading}
      />

      <PlanActionSheetModal
        isVisible={showPlanSheet}
        onClose={() => setShowPlanSheet(false)}
        onAddFromOutfits={() => {
          if (moment(selectedDate).isBefore(moment(), 'day')) {
            setPendingNextModal('calendar');
          } else {
            setPendingNextModal('selectOutfits');
          }
          setShowPlanSheet(false);
        }}
        onAddFromItems={() => {
          setSelectItemsMode('direct-add');
          setPendingNextModal('selectItems');
          setShowPlanSheet(false);
        }}
        onCreateNewOutfit={() => {
          setSelectItemsMode('create-outfit');
          if (moment(selectedDate).isBefore(moment(), 'day')) {
            setPendingNextModal('selectItems');
            setShowCalendarModal(true);
          } else {
            setPendingNextModal('selectItems');
          }
          setShowPlanSheet(false);
        }}
        onCloseComplete={() => {
          if (pendingNextModal === 'selectOutfits') {
            setPendingNextModal(null);
            setShowSelectOutfitModal(true);
          } else if (pendingNextModal === 'calendar') {
            setPendingNextModal(null);
            setAutoPlanAfterCalendar(true);
            setShowCalendarModal(true);
          } else if (pendingNextModal === 'selectItems') {
            setPendingNextModal(null);
            setShowSelectItemsModal(true);
          }
        }}
      />

      <SelectOutfitModal
        isVisible={showSelectOutfitModal}
        onClose={() => setShowSelectOutfitModal(false)}
        onSkip={() => setShowSelectOutfitModal(false)}
        onNext={async (selectedIds: string[]) => {
          if (!token || selectedIds.length === 0) {
            setShowSelectOutfitModal(false);
            return;
          }
          setSubmittingPlans(true);
          try {
            const request = {
              planDate: moment(selectedDate).format('YYYY-MM-DD'),
              description: '',
              title: '',
              wardrobeAssetIds: selectedIds,
            };
            const res = await wardrobeServices.postUserPlanAssets(request, token);
            if (res?.status === 200 || res?.status === 201) {
              setShowSelectOutfitModal(false);
              await fetchOutfitsForDate(selectedDate);
              await fetchMonthOutfitDates(selectedDate);
              toast.show(
                t('wardrobe.plan.addedOutfitsToDate', {
                  count: selectedIds.length,
                  date: formatDate(selectedDate, { month: 'short', day: 'numeric' }),
                }, `Added ${selectedIds.length} outfit${selectedIds.length !== 1 ? 's' : ''} to ${formatDate(selectedDate, { month: 'short', day: 'numeric' })}`),
                { type: 'success', duration: 3000 }
              );
            } else if (res?.responseCode === 401 || res?.responseCode === '401') {
              router.push('/Onboarding');
            } else {
              setShowSelectOutfitModal(false);
              const errorMessage = getPlanErrorMessage(
                res,
                t('wardrobe.plan.failedToAddOutfits', undefined, 'Failed to add outfits')
              );
              toast.show(errorMessage, { type: 'danger', duration: 3000 });
            }
          } catch (e: any) {
            setShowSelectOutfitModal(false);
            const errorMessage = getPlanErrorMessage(
              e,
              t('wardrobe.plan.errorAddingOutfits', undefined, 'Error adding outfits')
            );
            toast.show(errorMessage, { type: 'danger', duration: 3000 });
          } finally {
            setSubmittingPlans(false);
          }
        }}
        collectionId=""
        collectionName=""
        token={token}
        loading={submittingPlans}
        excludeOutfitIds={outfits.map(o => o.id)}
        headerAccessory={(
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFD8DB', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color="#FF3B4A" />
            </View>
            <Text style={{ marginLeft: 8, color: '#071827', fontFamily: 'DMSansMedium' }}>
              {moment(selectedDate).isSame(moment(), 'day')
                ? `${t('common.today', undefined, 'Today')}, ${formatDate(selectedDate, { day: 'numeric', month: 'short' })}`
                : formatDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
        )}
      />

      <SelectItemsForPlanModal
        ref={selectItemsModalRef}
        isVisible={showSelectItemsModal}
        onClose={handleSelectItemsClose}
        onSkip={handleSelectItemsSkip}
        onNext={selectItemsMode === 'direct-add' ? handleDirectAddItemsNext : handleSelectItemsNext}
        token={token}
        loading={selectItemsMode === 'direct-add' ? submittingPlans : false}
        excludeItemIds={[]}
        skipProcessing={selectItemsMode === 'direct-add'}
        headerAccessory={(
          <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFD8DB', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color="#FF3B4A" />
            </View>
            <Text style={{ marginLeft: 8, color: '#071827', fontFamily: 'DMSansMedium' }}>
              {moment(selectedDate).isSame(moment(), 'day')
                ? `${t('common.today', undefined, 'Today')}, ${formatDate(selectedDate, { day: 'numeric', month: 'short' })}`
                : formatDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' })}
            </Text>
          </View>
        )}
      />

      {navigatingLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF3B4A" />
        </View>
      )}
    </View>
  );
});

CreatePlanView.displayName = 'CreatePlanView';

export default CreatePlanView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140, // Ensure cards aren't cut off at bottom, accounting for tab bar + add button
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 16,
  },
  outfitsContainer: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 20,
  },
  loadingImageView: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#FF3B4A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
