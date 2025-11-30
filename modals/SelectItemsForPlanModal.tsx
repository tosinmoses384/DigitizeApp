import React, { useState, useCallback, useMemo, useEffect, useRef, ReactNode, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  InteractionManager,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import NewBottomModal from '@components/NewBottomModal';
import SearchBar from './tagItem/components/SearchBar';
import ItemGrid from './tagItem/components/ItemGrid';
import { useTagItems } from '@hooks/use-tag-items';
import { useDebounce } from '@utils/use-debounce';
import { WardrobeItem } from '@services/features/wardrobe-service/types';
import ProcessingItemsList, { ProcessingItem } from './SelectItemsForPlanModal/ProcessingItemsList';
import { ItemProgress } from '@utils/planItemBackgroundProcessor';
import { useI18n } from '@hooks/use-i18n';

interface SelectItemsForPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSkip: () => void;
  onNext: (selectedItems: WardrobeItem[]) => void;
  token: string;
  loading?: boolean;
  excludeItemIds?: string[];
  initialSelectedItems?: WardrobeItem[];
  headerAccessory?: ReactNode;
  processingItems?: ProcessingItem[];
  processingIndex?: number;
  skipProcessing?: boolean;
}

export interface SelectItemsForPlanModalRef {
  updateProcessingProgress: (itemsProgress: ItemProgress[]) => void;
  completeProcessing: () => void;
}

type ModalState = 'selection' | 'processing' | 'complete';

const MAX_SELECTIONS = 50;
const COMPLETE_STATE_DURATION = 800;

const SelectItemsForPlanModal = forwardRef<SelectItemsForPlanModalRef, SelectItemsForPlanModalProps>(
  ({
    isVisible,
    onClose,
    onSkip,
    onNext,
    token,
    loading = false,
    excludeItemIds = [],
    initialSelectedItems = [],
    headerAccessory,
    processingItems: externalProcessingItems,
    processingIndex: externalProcessingIndex,
    skipProcessing = false,
  }, ref) => {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [readyToFetch, setReadyToFetch] = useState(false);
    const [modalState, setModalState] = useState<ModalState>('selection');
    const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([]);
    const [processingIndex, setProcessingIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const isSubmitting = useRef(false);
    const excludeIdsSet = useMemo(() => new Set(excludeItemIds), [excludeItemIds]);

    const initialSelectedItemsRef = useRef(initialSelectedItems);
    useEffect(() => {
      initialSelectedItemsRef.current = initialSelectedItems;
    }, [initialSelectedItems]);

    useEffect(() => {
      if (isVisible) {
        const initialIds = new Set(initialSelectedItemsRef.current.map(item => item.id));
        setSelectedItemIds(initialIds);
        setModalState('selection');
        setProcessingItems([]);
        setProcessingIndex(0);
        fadeAnim.setValue(1);
      }
    }, [isVisible]);

    const isVisibleRef = useRef(isVisible);
    useEffect(() => {
      isVisibleRef.current = isVisible;
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) {
        setReadyToFetch(false);
        return;
      }

      let taskCancelled = false;
      const timeoutId = setTimeout(() => {
        if (!taskCancelled && isVisibleRef.current) {
          setReadyToFetch(true);
        }
      }, 500);

      const task = InteractionManager.runAfterInteractions(() => {
        if (!taskCancelled && isVisibleRef.current) {
          clearTimeout(timeoutId);
          setReadyToFetch(true);
        }
      });

      return () => {
        taskCancelled = true;
        task.cancel();
        clearTimeout(timeoutId);
      };
    }, [isVisible]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const enabledState = isVisible && !!token && readyToFetch;

    const {
      data: itemsData,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch,
      isRefetching,
      isError,
    } = useTagItems({
      token,
      type: 'items',
      searchQuery: debouncedSearchQuery,
      enabled: enabledState,
    });

    useEffect(() => {
      if (isVisible && readyToFetch && token) {
        refetch();
      }
    }, [isVisible, readyToFetch, token, refetch]);

    const data: WardrobeItem[] = useMemo(() => {
      const allItems = (itemsData as WardrobeItem[]) || [];
      return allItems.filter(item => !excludeIdsSet.has(item.id));
    }, [itemsData, excludeIdsSet]);

    useEffect(() => {
      if (isError && isVisible) {
        Alert.alert(
          t('errors.errorLoadingItemsTitle', undefined, 'Error Loading Items'),
          t('errors.errorLoadingItemsMessage', undefined, 'Unable to load items. Please check your connection and try again.'),
          [
            { text: t('common.cancel', undefined, 'Cancel'), style: 'cancel' },
            { text: t('common.retry', undefined, 'Retry'), onPress: () => refetch() },
          ],
        );
      }
    }, [isError, isVisible, refetch, t]);

    const handleSearchChange = useCallback((text: string) => {
      setSearchQuery(text);
    }, []);

    const handleItemPress = useCallback((item: { id: string }) => {
      const itemId = item.id;

      setSelectedItemIds((prevSelected) => {
        const newSelected = new Set(prevSelected);
        
        if (newSelected.has(itemId)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          newSelected.delete(itemId);
        } else {
          if (newSelected.size >= MAX_SELECTIONS) {
            Alert.alert(
              t('wardrobe.plan.selectionLimitReachedTitle', undefined, 'Selection Limit Reached'),
              t('wardrobe.plan.selectionLimitReachedMessageItems', { max: MAX_SELECTIONS }, `You can only select up to ${MAX_SELECTIONS} items at a time.`),
              [{ text: t('common.ok', undefined, 'OK') }],
            );
            return prevSelected;
          }
          
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          newSelected.add(itemId);
        }
        
        return newSelected;
      });
    }, [t]);

    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRefresh = useCallback(() => {
      refetch();
    }, [refetch]);

    const transitionToProcessing = useCallback((selectedItems: WardrobeItem[]) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setProcessingItems([]);
        setModalState('processing');
        setProcessingIndex(0);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onNext(selectedItems);
        });
      });
    }, [fadeAnim, onNext]);

    const handleNext = useCallback(() => {
      if (loading || isSubmitting.current || modalState !== 'selection') return;
      
      isSubmitting.current = true;
      const selectedIds = Array.from(selectedItemIds);
      const selectedItems = data.filter(item => selectedIds.includes(item.id));

      setSearchQuery('');

      if (skipProcessing) {
        onNext(selectedItems);
      } else {
        transitionToProcessing(selectedItems);
      }

      setTimeout(() => {
        isSubmitting.current = false;
      }, 300);
    }, [selectedItemIds, data, transitionToProcessing, loading, modalState, skipProcessing, onNext]);

    const handleSkip = useCallback(() => {
      if (loading || isSubmitting.current) return;

      setSearchQuery('');
      setSelectedItemIds(new Set());
      onSkip();
    }, [onSkip, loading]);

    const updateProcessingProgress = useCallback((itemsProgress: ItemProgress[]) => {
      const updatedProcessingItems: ProcessingItem[] = itemsProgress.map(itemProgress => ({
        item: itemProgress.item,
        status: itemProgress.status,
      }));
      
      setProcessingItems(updatedProcessingItems);
      
      const completedCount = itemsProgress.filter(
        item => item.status === 'success' || item.status === 'original' || item.status === 'skipped'
      ).length;
      setProcessingIndex(completedCount);
    }, []);

    const completeProcessing = useCallback(() => {
      setModalState('complete');
    }, []);

    useImperativeHandle(ref, () => ({
      updateProcessingProgress,
      completeProcessing,
    }), [updateProcessingProgress, completeProcessing]);

    useEffect(() => {
      if (modalState === 'complete') {
        const timer = setTimeout(() => {
          onClose();
        }, COMPLETE_STATE_DURATION);
        
        return () => clearTimeout(timer);
      }
    }, [modalState, onClose]);

    const handleClose = useCallback(() => {
      if (isSubmitting.current || loading) {
        return;
      }

      if (modalState === 'processing') {
        Alert.alert(
          t('wardrobe.plan.processingInProgressTitle', undefined, 'Processing in Progress'),
          t('wardrobe.plan.processingInProgressMessage', undefined, 'Items are currently being processed. Are you sure you want to cancel?'),
          [
            { text: t('wardrobe.plan.processingContinue', undefined, 'Continue Processing'), style: 'cancel' },
            {
              text: t('common.cancel', undefined, 'Cancel'),
              style: 'destructive',
              onPress: () => {
                setSearchQuery('');
                setSelectedItemIds(new Set());
                setModalState('selection');
                onClose();
              },
            },
          ],
        );
        return;
      }

      if (selectedItemIds.size > 0 && modalState === 'selection') {
        Alert.alert(
          t('wardrobe.plan.discardChangesTitle', undefined, 'Discard Changes?'),
          t('wardrobe.plan.discardSelectionsMessageItems', undefined, 'You have selected items that will be lost if you close now.'),
          [
            { text: t('common.cancel', undefined, 'Cancel'), style: 'cancel' },
            {
              text: t('wardrobe.plan.discard', undefined, 'Discard'),
              style: 'destructive',
              onPress: () => {
                setSearchQuery('');
                setSelectedItemIds(new Set());
                onClose();
              },
            },
          ],
        );
      } else {
        setSearchQuery('');
        onClose();
      }
    }, [selectedItemIds, onClose, loading, modalState, t]);

    const handleClearAll = useCallback(() => {
      if (selectedItemIds.size === 0) return;
      
      Alert.alert(
        t('wardrobe.plan.clearAllTitle', undefined, 'Clear All Selections?'),
        t('wardrobe.plan.clearAllMessageItems', { count: selectedItemIds.size }, `This will remove all ${selectedItemIds.size} selected ${selectedItemIds.size === 1 ? 'item' : 'items'}.`),
        [
          { text: t('common.cancel', undefined, 'Cancel'), style: 'cancel' },
          {
            text: t('wardrobe.plan.clearAll', undefined, 'Clear All'),
            style: 'destructive',
            onPress: () => {
              setSelectedItemIds(new Set());
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ],
      );
    }, [selectedItemIds, t]);

    const selectionCount = selectedItemIds.size;
    const isNextButtonActive = selectionCount > 0 && !loading;

    return (
      <NewBottomModal
        isShow={isVisible}
        onClose={handleClose}
        maxHeight={9999}
        contentStyle={styles.modalContent}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <StatusBar
              translucent={false}
              backgroundColor="#FFFFFF"
              barStyle="dark-content"
            />

            {modalState === 'selection' ? (
              <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleClose}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.close', undefined, 'Close')}
                  >
                    <Ionicons name="chevron-back" size={24} color="#07090C" />
                  </TouchableOpacity>

                  <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('wardrobe.plan.selectItems', undefined, 'Select items')}</Text>
                    {selectionCount > 0 && (
                      <Text style={styles.selectionCount}>
                        {`${selectionCount} ${selectionCount === 1 ? t('wardrobe.item', undefined, 'item') : t('wardrobe.items', undefined, 'items')} ${t('wardrobe.selected', undefined, 'selected')}`}
                      </Text>
                    )}
                  </View>

                  {selectionCount === 0 ? (
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={handleSkip}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={t('wardrobe.skip', undefined, 'Skip')}
                    >
                      <Text style={styles.skipButtonText}>{t('wardrobe.skip', undefined, 'Skip')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.nextButton,
                        isNextButtonActive && styles.nextButtonActive,
                      ]}
                      onPress={handleNext}
                      disabled={!isNextButtonActive}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.next', undefined, 'Next')}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.nextButtonText,
                            isNextButtonActive && styles.nextButtonTextActive,
                          ]}
                        >
                          {t('common.next', undefined, 'Next')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                {headerAccessory && (
                  <View style={styles.headerAccessoryContainer}>{headerAccessory}</View>
                )}

                <SearchBar
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder={t('wardrobe.searchItems', undefined, 'Search items')}
                />

                {selectionCount > 0 && (
                  <View style={styles.clearAllContainer}>
                    <TouchableOpacity
                      style={styles.clearAllButton}
                      onPress={handleClearAll}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel={t('wardrobe.plan.a11y.clearAllSelections', { count: selectionCount }, `Clear all ${selectionCount} selections`)}
                    >
                      <Ionicons name="close-circle" size={16} color="#FF3B4A" />
                      <Text style={styles.clearAllText}>
                        {t('wardrobe.clearAll', undefined, 'Clear All')} ({selectionCount})
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.gridContainer}>
                  <ItemGrid
                    data={data}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    isRefetching={isRefetching}
                    selectedItemIds={selectedItemIds}
                    onItemPress={handleItemPress}
                    onEndReached={handleEndReached}
                    onRefresh={handleRefresh}
                    type="items"
                  />
                </View>
              </Animated.View>
            ) : (
              <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                  <View style={styles.backButtonPlaceholder} />

                  <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>
                      {modalState === 'complete' ? '✓ Complete' : 'Processing Items'}
                    </Text>
                  </View>

                  <View style={styles.backButtonPlaceholder} />
                </View>

                {headerAccessory && (
                  <View style={styles.headerAccessoryContainer}>{headerAccessory}</View>
                )}

                <ProcessingItemsList
                  items={processingItems}
                  currentIndex={processingIndex}
                  totalItems={processingItems.length}
                />
              </Animated.View>
            )}
          </View>
        </SafeAreaView>
      </NewBottomModal>
    );
  }
);

SelectItemsForPlanModal.displayName = 'SelectItemsForPlanModal';

export default SelectItemsForPlanModal;
export type { ProcessingItem };

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    width: '100%',
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    color: '#07090C',
    textAlign: 'center',
  },
  selectionCount: {
    fontSize: 12,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
    marginTop: 2,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#90959E',
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F6D8DB',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#FF3B4A',
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#D3D5D8',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
  clearAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF5F6',
  },
  clearAllText: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#FF3B4A',
    marginLeft: 6,
  },
  gridContainer: {
    flex: 1,
  },
  headerAccessoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  contentContainer: {
    flex: 1,
  },
  backButtonPlaceholder: {
    width: 40,
  },
});

