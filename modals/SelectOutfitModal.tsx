import React, { useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  InteractionManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import NewBottomModal from '@components/NewBottomModal';
import SearchBar from './tagItem/components/SearchBar';
import ItemGrid from './tagItem/components/ItemGrid';
import { useTagItems } from '@hooks/use-tag-items';
import { useDebounce } from '@utils/use-debounce';
import { OutfitItem } from '@services/features/wardrobe-service/types';
import { useI18n } from '@hooks/use-i18n';

interface SelectOutfitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSkip: () => void;
  onNext: (selectedOutfitIds: string[]) => void;
  collectionId: string;
  collectionName: string;
  token: string;
  loading?: boolean;
  excludeOutfitIds?: string[]; // Outfits to exclude (already in collection)
  headerAccessory?: ReactNode; // Optional custom header accessory (e.g., date chip)
}

const MAX_SELECTIONS = 50;

const SelectOutfitModal = React.memo<SelectOutfitModalProps>(
  ({
    isVisible,
    onClose,
    onSkip,
    onNext,
    collectionId,
    collectionName,
    token,
    loading = false,
    excludeOutfitIds = [],
    headerAccessory,
  }) => {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOutfitIds, setSelectedOutfitIds] = useState<Set<string>>(new Set());
    const [readyToFetch, setReadyToFetch] = useState(false);
    const isSubmitting = useRef(false);
    const excludeIdsSet = useMemo(() => new Set(excludeOutfitIds), [excludeOutfitIds]);

    useEffect(() => {
      if (isVisible) {
        setSelectedOutfitIds(new Set());
        
        const task = InteractionManager.runAfterInteractions(() => {
          setReadyToFetch(true);
        });

        return () => {
          task.cancel();
          setReadyToFetch(false);
        };
      } else {
        setReadyToFetch(false);
      }
    }, [isVisible]);

    

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const {
      data: outfitsData,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch,
      isRefetching,
      isError,
    } = useTagItems({
      token,
      type: 'outfits',
      searchQuery: debouncedSearchQuery,
      enabled: isVisible && !!token && readyToFetch,
      refetchOnMount: 'always',
    });

    useEffect(() => {
      if (isVisible && readyToFetch && token) {
        refetch();
      }
    }, [isVisible, readyToFetch, token, refetch]);

    const data: OutfitItem[] = useMemo(() => {
      const allOutfits = (outfitsData as OutfitItem[]) || [];
      // Filter out outfits that are already in the collection
      return allOutfits.filter(outfit => !excludeIdsSet.has(outfit.id));
    }, [outfitsData, excludeIdsSet]);

    useEffect(() => {
      if (isError && isVisible) {
        Alert.alert(
          t('errors.errorLoadingOutfitsTitle', undefined, 'Error Loading Outfits'),
          t('errors.errorLoadingOutfitsMessage', undefined, 'Unable to load outfits. Please check your connection and try again.'),
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

      setSelectedOutfitIds((prevSelected) => {
        const newSelected = new Set(prevSelected);
        
        if (newSelected.has(itemId)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          newSelected.delete(itemId);
        } else {
          if (newSelected.size >= MAX_SELECTIONS) {
            Alert.alert(
              t('wardrobe.plan.selectionLimitReachedTitle', undefined, 'Selection Limit Reached'),
              t('wardrobe.plan.selectionLimitReachedMessageOutfits', { max: MAX_SELECTIONS }, `You can only select up to ${MAX_SELECTIONS} outfits at a time.`),
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

    const handleNext = useCallback(() => {
      if (loading || isSubmitting.current) return;
      
      isSubmitting.current = true;
      const selectedIds = Array.from(selectedOutfitIds);
      
      setSearchQuery('');
      setSelectedOutfitIds(new Set());
      
      onNext(selectedIds);
      
      setTimeout(() => {
        isSubmitting.current = false;
      }, 0);
    }, [selectedOutfitIds, onNext, loading]);

    const handleSkip = useCallback(() => {
      if (loading || isSubmitting.current) return;

      setSearchQuery('');
      setSelectedOutfitIds(new Set());
      onSkip();
    }, [onSkip, loading]);

    const handleClose = useCallback(() => {
      if (isSubmitting.current || loading) {
        return;
      }

      if (selectedOutfitIds.size > 0) {
        Alert.alert(
          t('wardrobe.plan.discardChangesTitle', undefined, 'Discard Changes?'),
          t('wardrobe.plan.discardSelectionsMessageOutfits', undefined, 'You have selected outfits that will be lost if you close now.'),
          [
            { text: t('common.cancel', undefined, 'Cancel'), style: 'cancel' },
            {
              text: t('wardrobe.plan.discard', undefined, 'Discard'),
              style: 'destructive',
              onPress: () => {
                setSearchQuery('');
                setSelectedOutfitIds(new Set());
                onClose();
              },
            },
          ],
        );
      } else {
        setSearchQuery('');
        onClose();
      }
    }, [selectedOutfitIds, onClose, loading, t]);

    const handleClearAll = useCallback(() => {
      if (selectedOutfitIds.size === 0) return;
      
      Alert.alert(
        t('wardrobe.plan.clearAllTitle', undefined, 'Clear All Selections?'),
        t('wardrobe.plan.clearAllMessageOutfits', { count: selectedOutfitIds.size }, `This will remove all ${selectedOutfitIds.size} selected ${selectedOutfitIds.size === 1 ? 'outfit' : 'outfits'}.`),
        [
          { text: t('common.cancel', undefined, 'Cancel'), style: 'cancel' },
          {
            text: t('wardrobe.plan.clearAll', undefined, 'Clear All'),
            style: 'destructive',
            onPress: () => {
              setSelectedOutfitIds(new Set());
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ],
      );
    }, [selectedOutfitIds, t]);

    const selectionCount = selectedOutfitIds.size;
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

            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Ionicons name="chevron-back" size={24} color="#07090C" />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{t('wardrobe.selectOutfit', undefined, 'Select outfit')}</Text>
                {selectionCount > 0 && (
                  <Text style={styles.selectionCount}>
                    {`${selectionCount} ${selectionCount === 1 ? t('wardrobe.outfit', undefined, 'outfit') : t('wardrobe.outfits', undefined, 'outfits')} ${t('wardrobe.selected', undefined, 'selected')}`}
                  </Text>
                )}
              </View>

              {selectionCount === 0 ? (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  disabled={loading}
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
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      isNextButtonActive && styles.nextButtonTextActive,
                    ]}
                  >
                    {t('common.next', undefined, 'Next')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {headerAccessory && (
              <View style={styles.headerAccessoryContainer}>{headerAccessory}</View>
            )}

            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder={t('wardrobe.searchOutfits', undefined, 'Search outfits')}
            />

            {selectionCount > 0 && (
              <View style={styles.clearAllContainer}>
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                  disabled={loading}
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
                selectedItemIds={selectedOutfitIds}
                onItemPress={handleItemPress}
                onEndReached={handleEndReached}
                onRefresh={handleRefresh}
                type="outfits"
              />
            </View>
          </View>
        </SafeAreaView>
      </NewBottomModal>
    );
  },
);

SelectOutfitModal.displayName = 'SelectOutfitModal';

export default SelectOutfitModal;

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
});

