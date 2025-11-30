import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ListRenderItem,
} from 'react-native';
import ItemCard from './ItemCard';
import LoadingSkeleton from './LoadingSkeleton';
import { WardrobeItem, OutfitItem } from '@services/features/wardrobe-service/types';

interface ItemGridProps {
  data: (WardrobeItem | OutfitItem)[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isRefetching: boolean;
  selectedItemIds: Set<string>;
  onItemPress: (item: WardrobeItem | OutfitItem) => void;
  onEndReached: () => void;
  onRefresh: () => void;
  type: 'items' | 'outfits';
}

const ItemGrid = React.memo<ItemGridProps>(
  ({
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
    selectedItemIds,
    onItemPress,
    onEndReached,
    onRefresh,
    type,
  }) => {
    const keyExtractor = useCallback((item: WardrobeItem | OutfitItem) => item.id, []);

    const renderItem: ListRenderItem<WardrobeItem | OutfitItem> = useCallback(
      ({ item }) => {
        const isSelected = selectedItemIds.has(item.id);
        
        let imageUrl: string;
        let title: string;

        if (type === 'items') {
          const wardrobeItem = item as WardrobeItem;
          imageUrl = wardrobeItem.itemDefaultImageUrl || wardrobeItem.itemImageUrls?.[0] || '';
          title = wardrobeItem.brandName || wardrobeItem.name || 'Item';
        } else {
          const outfitItem = item as OutfitItem;
          imageUrl = outfitItem.imageUrl || '';
          title = outfitItem.title || 'Untitled Outfit';
        }

        return (
          <ItemCard
            id={item.id}
            imageUrl={imageUrl}
            title={title}
            isSelected={isSelected}
            onPress={() => onItemPress(item)}
          />
        );
      },
      [selectedItemIds, onItemPress, type],
    );

    const renderFooter = useCallback(() => {
      if (!isFetchingNextPage) return null;
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="large" color="#FF3B4A" />
        </View>
      );
    }, [isFetchingNextPage]);

    const renderEmpty = useCallback(() => {
      if (isLoading) {
        return (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#FF3B4A" />
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        );
      }
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {type === 'items' ? 'No items found' : 'No outfits found'}
          </Text>
          <Text style={styles.emptySubtext}>
            {type === 'items'
              ? 'Try adjusting your search'
              : 'Create some outfits first'}
          </Text>
        </View>
      );
    }, [isLoading, type]);

    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        onEndReached();
      }
    }, [hasNextPage, isFetchingNextPage, onEndReached]);

    if (isLoading && data.length === 0) {
      return <LoadingSkeleton count={8} />;
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={['#FF3B4A']}
            tintColor="#FF3B4A"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        windowSize={5}
      />
    );
  },
);

ItemGrid.displayName = 'ItemGrid';

export default ItemGrid;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'DMSansMedium',
    color: '#07090C',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
  },
});
