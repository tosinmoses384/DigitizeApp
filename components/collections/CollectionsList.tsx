import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCollections, Collection, CollectionOutfit } from '@hooks/use-collections';
import RecommendedCard from '@components/RecommendedCard';
import { Colors } from '@constants/Colors';
import WardrobeEmpty from '../../assets/images/svg/emptyWardrobe.svg';
import CollectionSkeleton from './CollectionSkeleton';
import { useI18n } from '../../hooks/use-i18n';

interface CollectionsListProps {
  token: string;
}

const CARD_WIDTH = 110;
const CARD_GAP = 12;
const CARD_PADDING = 6;
const MAX_PREVIEW_ITEMS = 15;

const CollectionsList = React.memo<CollectionsListProps>(({ token }) => {
  const { t } = useI18n();
  const {
    data: collections,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCollections({ token, enabled: !!token });

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
      }
    }, [token, refetch])
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const sections = useMemo(() => {
    return collections.map((collection) => ({
      title: collection.name,
      data: [collection],
      collection,
    }));
  }, [collections]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: any }) => (
      <CollectionSectionHeader
        collection={section.collection}
        token={token}
      />
    ),
    [token],
  );

  const renderItem = useCallback(() => null, []);

  const renderSectionFooter = useCallback(() => (
    <View style={styles.sectionSeparator} />
  ), []);

  if (isLoading) {
    return <CollectionSkeleton count={3} />;
  }

  if (collections.length === 0 && !isLoading) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
          />
        }
        accessibilityRole="none"
      >
        <View
          style={styles.emptyInner}
          accessibilityRole="text"
          accessibilityLabel={t('wardrobe.noCollectionsYet') + '. ' + t('wardrobe.createCollectionsDescription')}
        >
          <WardrobeEmpty height={190} width={250} />
          <Text style={styles.emptyText}>{t('wardrobe.noCollectionsYet')}</Text>
          <Text style={styles.emptyText2}>
            {t('wardrobe.createCollectionsDescription')}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={renderSectionFooter}
      keyExtractor={(item, index) => `collection-${item.id}-${index}`}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.contentContainer}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={Colors.light.tint}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={Colors.light.tint} />
          </View>
        ) : null
      }
    />
  );
});

interface CollectionSectionHeaderProps {
  collection: Collection;
  token: string;
}

const CollectionSectionHeader = React.memo<CollectionSectionHeaderProps>(
  ({ collection, token }) => {
    const { t } = useI18n();
    
    const previewOutfits = useMemo(
      () => (collection.recentOutfits || []).slice(0, MAX_PREVIEW_ITEMS),
      [collection.recentOutfits],
    );

    const totalOutfits = collection.recentOutfits?.length || 0;

    const handleViewAll = useCallback(() => {
      router.push(`/(authenticated)/collectionDetail/${collection.id}` as any);
    }, [collection.id]);

    const renderOutfitItem = useCallback(
      ({ item }: ListRenderItemInfo<CollectionOutfit>) => (
        <View style={styles.previewCard}>
          <View style={styles.cardInnerContainer}>
            <RecommendedCard
              isServerImage
              title={item.title}
              imageSource={item.imageUrl}
              width="100%"
              marginRight={0}
              imageBackground={styles.cardBackgroundForOutfitImage}
              isHidefavourite
              onPress={handleViewAll}
            />
          </View>
        </View>
      ),
      [handleViewAll],
    );

    const keyExtractor = useCallback(
      (item: CollectionOutfit, index: number) => `outfit-${item.id}-${index}`,
      [],
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: CARD_WIDTH,
        offset: (CARD_WIDTH + CARD_GAP) * index,
        index,
      }),
      [],
    );

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.collectionTitleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.collectionTitle}>{collection.name}</Text>
              {totalOutfits > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{totalOutfits}</Text>
                </View>
              )}
            </View>
            {collection.description ? (
              <Text style={styles.collectionDescription} numberOfLines={2}>
                {collection.description}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity 
            onPress={handleViewAll} 
            style={styles.viewAllButton}
            accessibilityRole="button"
            accessibilityLabel={`View all ${totalOutfits} outfits in ${collection.name} collection`}
            accessibilityHint="Opens collection details with all outfits"
          >
            <Text style={styles.viewAllText}>{t('wardrobe.viewOutfits')}</Text>
          </TouchableOpacity>
        </View>

        {previewOutfits.length === 0 ? (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>{t('wardrobe.noOutfitsInCollection')}</Text>
          </View>
        ) : (
          <View style={styles.previewWrapper}>
            <FlatList
              data={previewOutfits}
              renderItem={renderOutfitItem}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewContentContainer}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={5}
              initialNumToRender={3}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="start"
              accessibilityRole="list"
              accessibilityLabel={`${totalOutfits} outfit${totalOutfits !== 1 ? 's' : ''} in ${collection.name}. Swipe to see more`}
            />
            {previewOutfits.length > 3 && (
              <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.95)', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fadeGradient}
                pointerEvents="none"
              />
            )}
          </View>
        )}
      </View>
    );
  },
);

CollectionSectionHeader.displayName = 'CollectionSectionHeader';
CollectionsList.displayName = 'CollectionsList';

export default CollectionsList;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 140,
  },
  emptyInner: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#1A1D21',
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'DMSansSemiBold',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyText2: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 32,
    fontFamily: 'DMSansRegular',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  collectionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#1A1D21',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSansSemiBold',
    color: '#4B5563',
    letterSpacing: -0.2,
  },
  collectionDescription: {
    fontSize: 13,
    fontFamily: 'DMSansRegular',
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F6',
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'DMSansSemiBold',
    color: '#FF3B4A',
    letterSpacing: -0.1,
  },
  previewWrapper: {
    position: 'relative',
  },
  previewContentContainer: {
    paddingRight: 16,
  },
  itemSeparator: {
    width: CARD_GAP,
  },
  previewCard: {
    width: CARD_WIDTH,
  },
  cardInnerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: CARD_PADDING,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  fadeGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
  },
  emptyPreview: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyPreviewText: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  cardBackgroundForOutfitImage: {
    backgroundColor: 'white',
    objectFit: 'contain',
  },
  sectionSeparator: {
    height: 8,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});

