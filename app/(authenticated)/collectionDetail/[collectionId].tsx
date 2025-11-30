import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { router, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useCollectionOutfitsDetail, CollectionOutfit } from '@hooks/use-collection-outfits-detail';
import { useCollections } from '@hooks/use-collections';
import { useAppSelector, useAppDispatch } from '@redux/store';
import { setOutfitEditDetails } from '@redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import { setRefNumber } from '@redux/slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import MyResponsiveGrid from '@components/MyResponsiveGrid';
import RecommendedCard from '@components/RecommendedCard';
import CustomButton from '@components/CustomButton';
import { Colors, SIZES } from '@constants/Colors';
import { getEmptyStateCountLoader } from '@helper/get-empty-count-loader/getEmptyCountLoader';
import WardrobeEmpty from '../../../assets/images/svg/emptyWardrobe.svg';
import EditCollectionModal from '../../../modals/EditCollectionModal';
import SelectOutfitModal from '../../../modals/SelectOutfitModal';
import CollectionActionsModal from '../../../modals/CollectionActionsModal';
import { formatShortDate, formatRelativeTime } from '@utils/date-helper';
import SearchInput from '@components/SearchInput';
import UndoSnackbar from '@components/UndoSnackbar';
import { generateGUID } from '@helper/guid-number';
import { useI18n } from '../../../hooks/use-i18n';

const CollectionDetailScreen = () => {
  const { t } = useI18n();
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();
  const navigation: any = useNavigation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [cardWidth, setCardWidth] = useState(172);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddOutfitModalVisible, setIsAddOutfitModalVisible] = useState(false);
  const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'oldest'>('recent');
  const [selectedOutfitIds, setSelectedOutfitIds] = useState<Set<string>>(new Set());
  const undoTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [undoSnackbar, setUndoSnackbar] = useState<{
    visible: boolean;
    message: string;
    onUndo: () => void;
  }>({
    visible: false,
    message: '',
    onUndo: () => {},
  });

  // Fetch collections to get the current collection details
  const { data: collections } = useCollections({
    token,
    enabled: !!token,
  });

  // Find the current collection
  const currentCollection = useMemo(() => {
    return collections.find(c => c.id === collectionId);
  }, [collections, collectionId]);

  // Update local state when collection is found
  useEffect(() => {
    if (currentCollection) {
      setCollectionName(currentCollection.name);
      setCollectionDescription(currentCollection.description || '');
    }
  }, [currentCollection]);

  // Cleanup pending delete timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all pending delete timeouts
      undoTimeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      undoTimeoutRef.current.clear();
    };
  }, []);

  const {
    data: outfits,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCollectionOutfitsDetail({
    collectionId: collectionId || '',
    token,
    enabled: !!collectionId && !!token,
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async () => {
      const response = await wardrobeServices.deleteOutfitCollection(
        collectionId || '',
        token,
      );
      if (response?.status !== 200 && response?.status !== 204) {
        throw new Error(response?.message || 'Failed to delete collection');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', token] });
      toast.show('Collection deleted successfully', {
        type: 'success',
        duration: 3000,
      });
      router.back();
    },
    onError: (error: any) => {
      toast.show(error?.message || 'Failed to delete collection', {
        type: 'danger',
        duration: 3000,
      });
    },
  });

  const removeOutfitMutation = useMutation({
    mutationFn: async (outfitId: string) => {
      const response = await wardrobeServices.removeOutfitFromCollection(
        collectionId || '',
        outfitId,
        token,
      );
      if (response?.status !== 200 && response?.status !== 204) {
        throw new Error(response?.message || 'Failed to remove outfit');
      }
      return { outfitId };
    },
    onMutate: async (outfitId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['collection-outfits-detail', collectionId, token],
      });

      // Snapshot previous value
      const previousOutfits = queryClient.getQueryData([
        'collection-outfits-detail',
        collectionId,
        token,
      ]);

      // Optimistically update to remove the outfit
      queryClient.setQueryData(
        ['collection-outfits-detail', collectionId, token],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((outfit: CollectionOutfit) => outfit.id !== outfitId),
            })),
          };
        },
      );

      return { previousOutfits };
    },
    onError: (error: any, outfitId, context) => {
      // Rollback on error
      if (context?.previousOutfits) {
        queryClient.setQueryData(
          ['collection-outfits-detail', collectionId, token],
          context.previousOutfits,
        );
      }
      toast.show(error?.message || 'Failed to remove outfit', {
        type: 'danger',
        duration: 3000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['collection-outfits-detail', collectionId, token],
      });
      toast.show('Outfit removed from collection', {
        type: 'success',
        duration: 2000,
      });
    },
  });

  const addOutfitsMutation = useMutation({
    mutationFn: async (data: { outfitIds: string[]; collectionId: string }) => {
      const response = await wardrobeServices.addOutfitsToCollection(data, token);
      return response;
    },
    onSuccess: (response, variables) => {
      if (response?.status === 200 || response?.status === 201) {
        setIsAddOutfitModalVisible(false);

        const outfitCount = variables.outfitIds.length;
        toast.show(
          `${outfitCount} outfit${outfitCount !== 1 ? 's' : ''} added to collection`,
          {
            type: 'success',
            duration: 3000,
          }
        );

        // Invalidate queries to refresh the outfit list
        queryClient.invalidateQueries({
          queryKey: ['collection-outfits-detail', collectionId, token],
        });
      } else {
        toast.show(response?.message || 'Failed to add outfits', {
          type: 'danger',
          duration: 3000,
        });
      }
    },
    onError: (error: any) => {
      toast.show(
        error?.message || 'An error occurred. Please try again.',
        {
          type: 'danger',
          duration: 3000,
        }
      );
    },
  });

  const handleDeleteCollection = useCallback(() => {
    Alert.alert(
      'Delete Collection?',
      'This will permanently delete this collection. All outfits will remain in your wardrobe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCollectionMutation.mutate(),
        },
      ],
    );
  }, [deleteCollectionMutation]);

  const handleRemoveOutfitWithUndo = useCallback(
    (outfitId: string, outfitTitle: string) => {
      // Optimistically remove from UI
      queryClient.setQueryData(
        ['collection-outfits-detail', collectionId, token],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((outfit: CollectionOutfit) => outfit.id !== outfitId),
            })),
          };
        },
      );

      // Set timeout to actually delete after 5 seconds
      const timeout = setTimeout(() => {
        removeOutfitMutation.mutate(outfitId);
        undoTimeoutRef.current.delete(outfitId);
        setUndoSnackbar({ visible: false, message: '', onUndo: () => {} });
      }, 5000);

      undoTimeoutRef.current.set(outfitId, timeout);

      // Show snackbar with undo option
      setUndoSnackbar({
        visible: true,
        message: `"${outfitTitle}" removed`,
        onUndo: () => {
          // Cancel the delete timeout
          const existingTimeout = undoTimeoutRef.current.get(outfitId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            undoTimeoutRef.current.delete(outfitId);
          }

          // Restore to UI by invalidating query
          queryClient.invalidateQueries({
            queryKey: ['collection-outfits-detail', collectionId, token],
          });

          toast.show('Outfit restored', {
            type: 'success',
            duration: 2000,
          });
          
          setUndoSnackbar({ visible: false, message: '', onUndo: () => {} });
        },
      });
    },
    [collectionId, token, queryClient, removeOutfitMutation, toast],
  );

  const handleRemoveOutfit = useCallback(
    (outfitId: string, outfitTitle: string) => {
      // In normal mode (non-swipe), show confirmation dialog
      // In swipe mode, use undo
      Alert.alert(
        'Remove Outfit?',
        `Remove "${outfitTitle}" from this collection? The outfit will remain in your wardrobe.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => handleRemoveOutfitWithUndo(outfitId, outfitTitle),
          },
        ],
      );
    },
    [handleRemoveOutfitWithUndo],
  );

  const handleEditCollection = useCallback(() => {
    setIsEditModalVisible(true);
  }, []);

  const handleOpenActionsModal = useCallback(() => {
    setIsActionsModalVisible(true);
  }, []);

  const handleCloseActionsModal = useCallback(() => {
    setIsActionsModalVisible(false);
  }, []);

  const handleRemoveItems = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

  const handleUpdateSuccess = useCallback((title: string, description: string) => {
    setCollectionName(title);
    setCollectionDescription(description);
    setIsEditModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ['collections'] });
  }, [queryClient]);

  const handleOpenAddOutfitModal = useCallback(() => {
    setIsAddOutfitModalVisible(true);
  }, []);

  const handleCloseAddOutfitModal = useCallback(() => {
    setIsAddOutfitModalVisible(false);
  }, []);

  const handleAddOutfits = useCallback((selectedOutfitIds: string[]) => {
    if (selectedOutfitIds.length === 0 || !collectionId) return;

    addOutfitsMutation.mutate({
      outfitIds: selectedOutfitIds,
      collectionId: collectionId,
    });
  }, [collectionId, addOutfitsMutation]);

  const handleSkipAddOutfit = useCallback(() => {
    setIsAddOutfitModalVisible(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setSelectedOutfitIds(new Set()); // Clear selections when canceling
  }, []);

  // Filter and sort outfits based on search query and sort option
  const filteredAndSortedOutfits = useMemo(() => {
    let filtered = [...outfits];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((outfit) =>
        outfit.title.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdOn || 0).getTime();
          const dateB = new Date(b.createdOn || 0).getTime();
          return dateA - dateB;
        });
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdOn || 0).getTime();
          const dateB = new Date(b.createdOn || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [outfits, searchQuery, sortBy]);

  const handleToggleOutfitSelection = useCallback((outfitId: string) => {
    setSelectedOutfitIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(outfitId)) {
        newSet.delete(outfitId);
      } else {
        newSet.add(outfitId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(filteredAndSortedOutfits.map((outfit) => outfit.id));
    setSelectedOutfitIds(allIds);
  }, [filteredAndSortedOutfits]);

  const handleDeselectAll = useCallback(() => {
    setSelectedOutfitIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedOutfitIds.size === 0) return;

    const count = selectedOutfitIds.size;
    const outfitsToDelete = filteredAndSortedOutfits.filter((outfit) =>
      selectedOutfitIds.has(outfit.id)
    );

    Alert.alert(
      t('wardrobe.removeOutfitsQuestion'),
      t('wardrobe.removeOutfitsMessage', { count, plural: count !== 1 ? 's' : '' }),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // Optimistically remove all selected outfits from UI
            queryClient.setQueryData(
              ['collection-outfits-detail', collectionId, token],
              (old: any) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page: any) => ({
                    ...page,
                    data: page.data.filter(
                      (outfit: CollectionOutfit) => !selectedOutfitIds.has(outfit.id)
                    ),
                  })),
                };
              },
            );

            // Set timeout for each outfit to actually delete after 5 seconds
            outfitsToDelete.forEach((outfit) => {
              const timeout = setTimeout(() => {
                removeOutfitMutation.mutate(outfit.id);
                undoTimeoutRef.current.delete(outfit.id);
              }, 5000);

              undoTimeoutRef.current.set(outfit.id, timeout);
            });

            // Show snackbar with undo option
            setUndoSnackbar({
              visible: true,
              message: `${count} outfit${count !== 1 ? 's' : ''} removed`,
              onUndo: () => {
                // Cancel all delete timeouts
                selectedOutfitIds.forEach((outfitId) => {
                  const existingTimeout = undoTimeoutRef.current.get(outfitId);
                  if (existingTimeout) {
                    clearTimeout(existingTimeout);
                    undoTimeoutRef.current.delete(outfitId);
                  }
                });

                // Restore to UI by invalidating query
                queryClient.invalidateQueries({
                  queryKey: ['collection-outfits-detail', collectionId, token],
                });

                toast.show(`${count} outfit${count !== 1 ? 's' : ''} restored`, {
                  type: 'success',
                  duration: 2000,
                });
                
                setUndoSnackbar({ visible: false, message: '', onUndo: () => {} });
              },
            });

            setSelectedOutfitIds(new Set());
            setIsEditMode(false);
          },
        },
      ],
    );
  }, [
    selectedOutfitIds,
    filteredAndSortedOutfits,
    collectionId,
    token,
    queryClient,
    removeOutfitMutation,
    toast,
  ]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDismissSnackbar = useCallback(() => {
    setUndoSnackbar({ visible: false, message: '', onUndo: () => {} });
  }, []);

  // Render right swipe action (delete)
  const renderRightActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    outfit: CollectionOutfit
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.swipeDeleteAction}
        onPress={() => handleRemoveOutfitWithUndo(outfit.id, outfit.title)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${outfit.title}`}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleRemoveOutfitWithUndo]);

  const template = useMemo(() => {
    return filteredAndSortedOutfits.map((outfit, index) => {
      // In edit mode, disable swipe and show checkboxes. In normal mode, enable swipe-to-delete
      const swipeEnabled = !isEditMode;
      const isSelected = selectedOutfitIds.has(outfit.id);

      return (
        <View key={outfit.id} style={[styles.card, { width: cardWidth }]}>
          <Swipeable
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, outfit)
            }
            enabled={swipeEnabled}
            overshootRight={false}
            friction={2}
            rightThreshold={40}
          >
            <Pressable
              onPress={() => {
                if (isEditMode) {
                  // In edit mode, clicking toggles selection
                  handleToggleOutfitSelection(outfit.id);
                } else {
                  // Normal mode - navigate to EditOutfitView with Redux dispatch
                  dispatch(setOutfitEditDetails(outfit));
                  navigation.navigate("EditOutfitView");
                  dispatch(setRefNumber(generateGUID()));
                }
              }}
              style={[
                styles.cardContent,
                isEditMode && isSelected && styles.cardContentSelected,
              ]}
            >
              <View style={styles.cardImageContainer}>
                <RecommendedCard
                  isServerImage
                  title=""
                  imageSource={outfit.imageUrl}
                  width="100%"
                  marginRight={0}
                  imageBackground={styles.cardBackgroundForOutfitImage}
                  isHidefavourite
                  onPress={() => {}}
                />
                
                {/* Checkbox shown in edit mode */}
                {isEditMode && (
                  <TouchableOpacity
                    style={styles.checkboxButton}
                    onPress={() => handleToggleOutfitSelection(outfit.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${outfit.title}`}
                  >
                    <View
                      style={[
                        styles.checkboxContainer,
                        isSelected && styles.checkboxContainerChecked,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={styles.outfitTitle} numberOfLines={2}>
                {outfit.title}
              </Text>
            </Pressable>
          </Swipeable>
        </View>
      );
    });
  }, [
    filteredAndSortedOutfits,
    cardWidth,
    isEditMode,
    selectedOutfitIds,
    handleToggleOutfitSelection,
    renderRightActions,
  ]);

  const emptyTemplate = useMemo(() => {
    return getEmptyStateCountLoader(8).map((list, index) => (
      <View key={index} style={[styles.card, { width: cardWidth }]}>
        <RecommendedCard
          imageSource=""
          size=""
          title=""
          price=""
          width="100%"
          marginRight={0}
          isServerImage
          itemId=""
          loader
        />
      </View>
    ));
  }, [cardWidth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with back button, collection name, and collection-level actions */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color="#07090C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {collectionName || 'Collection'}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleOpenActionsModal}
            accessibilityLabel="Collection options"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#07090C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          onScroll={handleLoadMore}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={Colors.light.tint}
            />
          }
        >
          {/* Edit mode banner with bulk actions */}
          {isEditMode && (
            <View style={styles.editModeContainer}>
              <View style={styles.editModeBanner}>
                <Ionicons name="information-circle-outline" size={18} color="#FF3B4A" />
                <Text style={styles.editModeText}>
                  Select outfits to remove from collection
                </Text>
              </View>
              
              <View style={styles.bulkActionsBar}>
                <TouchableOpacity
                  onPress={
                    selectedOutfitIds.size === filteredAndSortedOutfits.length
                      ? handleDeselectAll
                      : handleSelectAll
                  }
                  style={styles.selectAllButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    selectedOutfitIds.size === filteredAndSortedOutfits.length
                      ? 'Deselect all'
                      : 'Select all'
                  }
                >
                  <Text style={styles.selectAllText}>
                    {selectedOutfitIds.size === filteredAndSortedOutfits.length
                      ? t('wardrobe.deselectAll')
                      : t('wardrobe.selectAll')}
                  </Text>
                </TouchableOpacity>

                {selectedOutfitIds.size > 0 && (
                  <View style={styles.selectedCountContainer}>
                    <Text style={styles.selectedCountText}>
                      {selectedOutfitIds.size} selected
                    </Text>
                    <TouchableOpacity
                      onPress={handleBulkDelete}
                      style={styles.bulkDeleteButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${selectedOutfitIds.size} selected outfits`}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.bulkDeleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Outfit count and description */}
          <View style={styles.infoContainer}>
            <View style={styles.countAndButtonRow}>
              <Text style={styles.outfitCount}>
                {outfits.length} Outfit{outfits.length !== 1 ? 's' : ''}
              </Text>
              
              {isEditMode && (
                <TouchableOpacity
                  style={styles.doneTextButton}
                  onPress={handleCancelEdit}
                  accessibilityLabel="Done editing"
                  accessibilityRole="button"
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {!isEditMode && collectionDescription ? (
              <Text style={styles.descriptionText}>{collectionDescription}</Text>
            ) : null}
            
            {/* Collection Stats */}
            {!isEditMode && currentCollection?.createdOn && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={14} color="#90959E" />
                  <Text style={styles.statText}>
                    {t('wardrobe.created')} {formatShortDate(currentCollection.createdOn)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color="#90959E" />
                  <Text style={styles.statText}>
                    {formatRelativeTime(currentCollection.createdOn)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Search and Sort Controls */}
          {outfits.length > 0 && (
            <View style={styles.searchSortContainer}>
              <View style={styles.searchContainer}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('wardrobe.searchOutfitsPlaceholder')}
                />
              </View>
              
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[styles.sortChip, sortBy === 'recent' && styles.sortChipActive]}
                  onPress={() => setSortBy('recent')}
                  accessibilityRole="button"
                  accessibilityLabel="Sort by recently added"
                >
                  <Text style={[styles.sortChipText, sortBy === 'recent' && styles.sortChipTextActive]}>
                    {t('wardrobe.recent')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sortChip, sortBy === 'alphabetical' && styles.sortChipActive]}
                  onPress={() => setSortBy('alphabetical')}
                  accessibilityRole="button"
                  accessibilityLabel="Sort alphabetically"
                >
                  <Text style={[styles.sortChipText, sortBy === 'alphabetical' && styles.sortChipTextActive]}>
                    {t('wardrobe.aToZ')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.sortChip, sortBy === 'oldest' && styles.sortChipActive]}
                  onPress={() => setSortBy('oldest')}
                  accessibilityRole="button"
                  accessibilityLabel="Sort by oldest"
                >
                  <Text style={[styles.sortChipText, sortBy === 'oldest' && styles.sortChipTextActive]}>
                    {t('wardrobe.oldest')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Outfits Grid */}
          {isLoading ? (
            <MyResponsiveGrid
              template={emptyTemplate}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          ) : outfits.length === 0 ? (
            <View style={styles.emptyState}>
              <WardrobeEmpty height={190} width={250} />
              <Text style={styles.emptyText}>No outfits in this collection</Text>
              <Text style={styles.emptyText2}>
                Add outfits to this collection from your wardrobe
              </Text>
            </View>
          ) : filteredAndSortedOutfits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={80} color="#D1D5DB" />
              <Text style={styles.emptyText}>No outfits found</Text>
              <Text style={styles.emptyText2}>
                Try a different search term
              </Text>
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={styles.clearSearchText}>Clear search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <MyResponsiveGrid
              template={template}
              getNumberOfRows={(data: any) => setCardWidth(data)}
            />
          )}

          {isFetchingNextPage && (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.light.tint} />
            </View>
          )}
        </ScrollView>

        <SelectOutfitModal
          isVisible={isAddOutfitModalVisible}
          onClose={handleCloseAddOutfitModal}
          onSkip={handleSkipAddOutfit}
          onNext={handleAddOutfits}
          collectionId={collectionId || ''}
          collectionName={collectionName}
          token={token}
          loading={addOutfitsMutation.isPending}
          excludeOutfitIds={outfits.map(outfit => outfit.id)}
        />

        <EditCollectionModal
          isShow={isEditModalVisible}
          onClose={handleCloseEditModal}
          collectionId={collectionId || ''}
          currentTitle={collectionName}
          currentDescription={collectionDescription}
          token={token}
          onSuccess={handleUpdateSuccess}
        />

        <UndoSnackbar
          visible={undoSnackbar.visible}
          message={undoSnackbar.message}
          onUndo={undoSnackbar.onUndo}
          onDismiss={handleDismissSnackbar}
          duration={5000}
        />

        <CollectionActionsModal
          isVisible={isActionsModalVisible}
          onClose={handleCloseActionsModal}
          onAddOutfit={handleOpenAddOutfitModal}
          onEditCollection={handleEditCollection}
          onRemoveItems={handleRemoveItems}
          onDeleteCollection={handleDeleteCollection}
        />
      </View>
    </SafeAreaView>
  );
};

export default CollectionDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? SIZES.padding : 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'DMSansSemiBold',
    color: '#07090C',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  menuButton: {
    padding: 8,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  gridContainer: {
    paddingHorizontal: 20, // Add horizontal padding for cards
  },
  editModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F6',
    paddingVertical: 14, // More vertical padding
    paddingHorizontal: 16,
    marginHorizontal: 20, // Match grid horizontal padding
    marginTop: 16,
    marginBottom: 12, // More bottom margin
    borderRadius: 12, // Match card border radius
    borderWidth: 1,
    borderColor: '#FFD8DB',
    gap: 10, // Slightly more gap
  },
  editModeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#FF3B4A',
  },
  editModeContainer: {
    marginBottom: 0,
  },
  bulkActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Match grid horizontal padding
    paddingVertical: 12, // More vertical padding
    marginBottom: 8, // Add bottom margin
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#FF3B4A',
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCountText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#6B7280',
  },
  bulkDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF3B4A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bulkDeleteText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#FFFFFF',
  },
  infoContainer: {
    paddingHorizontal: 20, // Match grid horizontal padding
    paddingTop: 20,
    paddingBottom: 16, // More bottom padding
  },
  countAndButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  outfitCount: {
    fontSize: 20,
    fontFamily: 'DMSansSemiBold',
    color: '#07090C',
  },
  doneTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneText: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    color: '#FF3B4A',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  searchSortContainer: {
    paddingHorizontal: 20, // Match grid horizontal padding
    paddingTop: 16, // More top padding
    paddingBottom: 12, // More bottom padding
  },
  searchContainer: {
    marginBottom: 16, // More spacing before sort chips
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: '#FFF5F6',
    borderColor: '#FF3B4A',
  },
  sortChipText: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#6B7280',
  },
  sortChipTextActive: {
    color: '#FF3B4A',
    fontFamily: 'DMSansSemiBold',
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
  },
  clearSearchText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#FFFFFF',
  },
  card: {
    marginBottom: 20,
    marginHorizontal: 8,
  },
  cardContent: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },
  cardContentSelected: {
    borderWidth: 3,
    borderColor: '#FF3B4A',
    backgroundColor: '#FFF8F9',
    shadowColor: '#FF3B4A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardImageContainer: {
    position: 'relative',
  },
  checkboxButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  checkboxContainerChecked: {
    backgroundColor: '#FF3B4A',
    borderColor: '#FFFFFF',
    shadowColor: '#FF3B4A',
    shadowOpacity: 0.4,
  },
  swipeDeleteAction: {
    backgroundColor: '#FF3B4A',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSansMedium',
    marginTop: 4,
  },
  cardBackgroundForOutfitImage: {
    backgroundColor: 'white',
    objectFit: 'contain',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  deleteIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  outfitTitle: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#07090C',
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#07090C',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'DMSansSemiBold',
    textAlign: 'center',
  },
  emptyText2: {
    fontSize: 14,
    color: '#90959E',
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 40,
    fontFamily: 'DMSansRegular',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

