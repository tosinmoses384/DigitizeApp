import {
  ActivityIndicator,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import React, { useCallback } from 'react';
import StackHeader from '../../components/StackHeader';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import SearchInput from '@components/SearchInput';
import { LegendList } from '@legendapp/list';
import { useTriftersData } from '../../hooks/useTriftersData';
import { useFollowActions } from '../../hooks/useFollowActions';
import { useSearch } from '../../hooks/useSearch';
import TrifterListItem from '../../components/TrifterListItem';
import LineLoader from '../../components/LineLoader';
interface ITriftersList {
  hideHeader: boolean;
  followingStatus?: number;
  userId?: string;
}
const TriftersList = ({
  hideHeader,
  followingStatus,
  userId,
}: ITriftersList) => {
  // Optimized search functionality
  const { searchQuery, debouncedQuery, handleSearchChange } = useSearch({
    debounceMs: 300,
    minSearchLength: 0
  });

  // Optimized data fetching
  const {
    data,
    loading,
    isRefreshing,
    hasMore,
    handleRefresh,
    handleLoadMore,
    updateItem,
    removeItem
  } = useTriftersData({
    userId,
    followingStatus,
    searchQuery: debouncedQuery
  });

  // Optimized follow/unfollow actions
  const {
    handleFollowAndUnfollow,
    getButtonState,
    getButtonStyles
  } = useFollowActions({
    followingStatus,
    updateItem,
    removeItem
  });

  // Optimized render function for individual trifter items
  const renderItem = useCallback(({ item }: { item: any }) => (
    <TrifterListItem
      item={item}
      userId={userId}
      followingStatus={followingStatus}
      onFollowPress={handleFollowAndUnfollow}
      getButtonState={getButtonState}
      getButtonStyles={getButtonStyles}
    />
  ), [userId, followingStatus, handleFollowAndUnfollow, getButtonState, getButtonStyles]);

  // Optimized key extractor for performance
  const keyExtractor = useCallback((item: any) => {
    return `trifter-${item.id}-${item.userId || ''}-${item.name || ''}`;
  }, []);

  // Optimized estimated item size for better performance
  const getEstimatedItemSize = useCallback(() => {
    return 80; // Height of each trifter item
  }, []);

  return (
    <View style={[styles.mainContainer, { marginTop: hideHeader ? 0 : 30 }]}>
      {!hideHeader && (
        <StackHeader
          title="Drbers"
          isShowHeaderShadow
          onPress={() => router.back()}
        />
      )}

      <View style={styles.searchContainer}>
        <SearchInput 
          value={searchQuery} 
          onChangeText={handleSearchChange} 
        />
      </View>
      
      <View style={styles.container}>
        {loading && data.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonTextContainer}>
                  <View style={styles.skeletonNameWrapper}>
                    <LineLoader loaderStyle={styles.skeletonName} />
                  </View>
                  <View style={styles.skeletonFollowersWrapper}>
                    <LineLoader loaderStyle={styles.skeletonFollowers} />
                  </View>
                </View>
                <View style={styles.skeletonButtonWrapper}>
                  <LineLoader loaderStyle={styles.skeletonButton} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <LegendList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getEstimatedItemSize={getEstimatedItemSize}
            showsVerticalScrollIndicator={false}
            // Performance optimizations
            enableAverages={true}
            recycleItems={true}
            drawDistance={500}
            // Pagination
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            // Pull to refresh
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[Colors.light.primaryBase]}
                tintColor={Colors.light.primaryBase}
              />
            }
            // Styling
            contentContainerStyle={styles.listContainer}
            // Performance
            waitForInitialLayout={false}
            initialContainerPoolRatio={2}
            // Debugging (remove in production)
            suggestEstimatedItemSize={__DEV__}
          />
        )}
        {loading && data.length > 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.light.primaryBase} />
          </View>
        )}
      </View>
    </View>
  );
};

export default TriftersList;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 10,
    marginHorizontal: 16,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonItem: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonNameWrapper: {
    marginBottom: 8,
  },
  skeletonName: {
    width: '60%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonFollowersWrapper: {
    marginBottom: 4,
  },
  skeletonFollowers: {
    width: '40%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonButtonWrapper: {
    marginLeft: 16,
  },
  skeletonButton: {
    width: 80,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
});
