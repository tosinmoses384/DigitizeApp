import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import WardrobeItemCard from './WardrobeItemCard';
import OutfitCard from './OutfitCard';
import WardrobeEmptyState from './WardrobeEmptyState';
import WardrobeSearchHeader from './WardrobeSearchHeader';

interface WardrobeListProps {
  type: 'items' | 'outfits';
  data: any[];
  loading: boolean;
  isRefreshing: boolean;
  isFetchingMore: boolean;
  searchValue: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionText: string;
  isTagItem?: boolean;
  onSearchChange: (text: string) => void;
  onEndReached: () => void;
  onRefresh: () => void;
  onEmptyAction: () => void;
  onItemPress: (item: any) => void;
  isItemTagged?: (item: any) => boolean;
}

const WardrobeList = React.memo<WardrobeListProps>(({ 
  type,
  data,
  loading,
  isRefreshing,
  isFetchingMore,
  searchValue,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  emptyActionText,
  isTagItem,
  onSearchChange,
  onEndReached,
  onRefresh,
  onEmptyAction,
  onItemPress,
  isItemTagged,
}) => {
  

  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const horizontalPadding = 16;
    const innerWidth = screenWidth - horizontalPadding * 2;
    return innerWidth * 0.46;
  }, []);

  const skeletonData = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true })),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const handlePress = () => onItemPress(item);
      
      if (type === 'items') {
        return (
          <WardrobeItemCard
            item={item}
            index={index}
            cardWidth={cardWidth}
            isTagItem={isTagItem}
            isItemTagged={isItemTagged ? isItemTagged(item) : false}
            onPress={handlePress}
          />
        );
      }
      
      return (
        <OutfitCard
          item={item}
          index={index}
          cardWidth={cardWidth}
          onPress={handlePress}
        />
      );
    },
    [type, cardWidth, isTagItem, isItemTagged, onItemPress]
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => item?.id || `${type}-item-${index}`,
    [type]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#FF5C68" />
        </View>
      );
    }
    return null;
  }, [isFetchingMore]);

  const headerElement = useMemo(() => {
    return (
      <WardrobeSearchHeader
        key="wardrobeSearchHeader"
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder}
      />
    );
  }, [searchValue, onSearchChange, searchPlaceholder]);

  const renderEmptyComponent = useCallback(() => {
    if (!loading) {
      return (
        <WardrobeEmptyState
          type={type}
          onAction={onEmptyAction}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          actionButtonText={emptyActionText}
        />
      );
    }
    return null;
  }, [loading, type, onEmptyAction, emptyTitle, emptyDescription, emptyActionText]);

  return (
    <FlatList
      data={loading && data.length === 0 ? skeletonData : data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={headerElement}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
});

WardrobeList.displayName = 'WardrobeList';

export default WardrobeList;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

