import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
  InteractionManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import NewBottomModal from '@components/NewBottomModal';
import TabSelector from './components/TabSelector';
import SearchBar from './components/SearchBar';
import ItemGrid from './components/ItemGrid';
import { useTagItems } from '@hooks/use-tag-items';
import { useDebounce } from '@utils/use-debounce';
import {
  WardrobeItem,
  OutfitItem,
  TaggedItem,
} from '@services/features/wardrobe-service/types';

interface TagItemModalProps {
  isVisible: boolean;
  onClose: () => void;
  onNext: (selectedItems: TaggedItem[]) => void;
  token: string;
  trifterId?: string;
  initialSelection?: TaggedItem[];
}

const MAX_SELECTIONS = 50; // Maximum number of items that can be selected

const TagItemModal = React.memo<TagItemModalProps>(
  ({ isVisible, onClose, onNext, token, trifterId, initialSelection = [] }) => {
    const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState<TaggedItem[]>(initialSelection);
    
    const selectedItemIds = useMemo(() => 
      new Set(selectedItems.map(item => item.id)), 
      [selectedItems]
    );
    const [readyToFetch, setReadyToFetch] = useState(false); // Delay fetch until animation completes
    const isSubmitting = useRef(false); // Track if we're in the middle of submitting

    // Delay heavy operations until after modal animation completes
    useEffect(() => {
      if (isVisible) {
        setSelectedItems(initialSelection);
        
        // Wait for animation to complete before enabling data fetching
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
    }, [isVisible, initialSelection]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: itemsData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
    error,
  } = useTagItems({
    token,
    type: activeTab,
    searchQuery: debouncedSearchQuery,
    trifterId,
    enabled: isVisible && !!token && readyToFetch, // Only fetch after animation completes
  });

  const data: (WardrobeItem | OutfitItem)[] = useMemo(() => itemsData || [], [itemsData]);

  // Handle network errors
  useEffect(() => {
    if (isError && isVisible) {
      Alert.alert(
        'Error Loading Items',
        'Unable to load items. Please check your connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => refetch() },
        ],
      );
    }
  }, [isError, isVisible, refetch]);


  const handleTabChange = useCallback((tab: 'items' | 'outfits') => {
    setActiveTab(tab);
    setSearchQuery('');
    // Note: We preserve selections across tabs so users can select both items and outfits
  }, []);

    const handleSearchChange = useCallback((text: string) => {
      setSearchQuery(text);
    }, []);

    const convertToTaggedItem = useCallback(
      (item: WardrobeItem | OutfitItem): TaggedItem => {
        if (activeTab === 'items') {
          const wardrobeItem = item as WardrobeItem;
          const displayName = wardrobeItem.brandName || wardrobeItem.name || 'Item';
          return {
            id: wardrobeItem.id,
            name: displayName,
            imageUrl:
              wardrobeItem.itemDefaultImageUrl ||
              wardrobeItem.itemImageUrls?.[0] ||
              '',
            amount: wardrobeItem.amount || 0,
            currencySymbol: wardrobeItem.currencySymbol || '₦',
            type: 'item',
          };
        } else {
          const outfitItem = item as OutfitItem;
          return {
            id: outfitItem.id,
            name: outfitItem.title || 'Untitled Outfit',
            imageUrl: outfitItem.imageUrl || '',
            type: 'outfit',
          };
        }
      },
      [activeTab],
    );

    const handleItemPress = useCallback(
      (item: WardrobeItem | OutfitItem) => {
        const itemId = item.id;

        setSelectedItems((prevSelectedItems) => {
          const isCurrentlySelected = prevSelectedItems.some(selectedItem => selectedItem.id === itemId);
          
          if (isCurrentlySelected) {
            // Deselecting item
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return prevSelectedItems.filter(selectedItem => selectedItem.id !== itemId);
          } else {
            // Check selection limit
            if (prevSelectedItems.length >= MAX_SELECTIONS) {
              Alert.alert(
                'Selection Limit Reached',
                `You can only select up to ${MAX_SELECTIONS} items at a time.`,
                [{ text: 'OK' }],
              );
              return prevSelectedItems;
            }
            
            // Selecting item
            const taggedItem = convertToTaggedItem(item);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return [...prevSelectedItems, taggedItem];
          }
        });
      },
      [convertToTaggedItem],
    );

    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleRefresh = useCallback(() => {
      refetch();
    }, [refetch]);

    const handleNext = useCallback(() => {
      isSubmitting.current = true;
      
      const currentSelections = selectedItems;
      
      setSearchQuery('');
      setSelectedItems([]);
      
      onNext(currentSelections);
      
      setTimeout(() => {
        isSubmitting.current = false;
        onClose();
      }, 0);
    }, [selectedItems, onNext, onClose]);

  const handleClose = useCallback(() => {
    if (isSubmitting.current) {
      onClose();
      return;
    }

    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.length > 0) {
        Alert.alert(
          'Discard Changes?',
          'You have selected items that will be lost if you close now.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                setSearchQuery('');
                setSelectedItems([]);
                onClose();
              },
            },
          ],
        );
      } else {
        setSearchQuery('');
        onClose();
      }
      
      return prevSelectedItems;
    });
  }, [onClose]);

  const handleClearAll = useCallback(() => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.length === 0) return prevSelectedItems;
      
      Alert.alert(
        'Clear All Selections?',
        `This will remove all ${prevSelectedItems.length} selected ${prevSelectedItems.length === 1 ? 'item' : 'items'}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: () => {
              setSelectedItems([]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ],
      );
      
      return prevSelectedItems;
    });
  }, []);

  // Calculate selection counts by type
  const selectionCounts = useMemo(() => {
    const items = selectedItems.filter(item => item.type === 'item').length;
    const outfits = selectedItems.filter(item => item.type === 'outfit').length;
    return { items, outfits, total: selectedItems.length };
  }, [selectedItems]);

    const isNextButtonActive = selectedItems.length > 0;

    return (
      <NewBottomModal
        isShow={isVisible}
        onClose={handleClose}
        maxHeight="100%"
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
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Ionicons name="chevron-back" size={24} color="#07090C" />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Tag item</Text>
                {selectionCounts.total > 0 && (
                  <Text style={styles.selectionCount}>
                    {selectionCounts.items > 0 && `${selectionCounts.items} item${selectionCounts.items !== 1 ? 's' : ''}`}
                    {selectionCounts.items > 0 && selectionCounts.outfits > 0 && ', '}
                    {selectionCounts.outfits > 0 && `${selectionCounts.outfits} outfit${selectionCounts.outfits !== 1 ? 's' : ''}`}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isNextButtonActive && styles.nextButtonActive,
                ]}
                onPress={handleNext}
                disabled={!isNextButtonActive}
                accessibilityRole="button"
                accessibilityLabel="Next"
                accessibilityState={{ disabled: !isNextButtonActive }}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    isNextButtonActive && styles.nextButtonTextActive,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>

              <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search Brand, Name"
            />

            {selectionCounts.total > 0 && (
              <View style={styles.clearAllContainer}>
                <TouchableOpacity
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all selections"
                >
                  <Ionicons name="close-circle" size={16} color="#FF3B4A" />
                  <Text style={styles.clearAllText}>Clear All ({selectionCounts.total})</Text>
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
                type={activeTab}
              />
            </View>
          </View>
        </SafeAreaView>
      </NewBottomModal>
    );
  },
);

TagItemModal.displayName = 'TagItemModal';

export default TagItemModal;

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
});
