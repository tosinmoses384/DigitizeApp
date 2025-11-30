import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ProcessingItemCard, { ItemProcessingStatus } from './ProcessingItemCard';
import { WardrobeItem } from '@services/features/wardrobe-service/types';
import { useI18n } from '@hooks/use-i18n';

export interface ProcessingItem {
  item: WardrobeItem;
  status: ItemProcessingStatus;
}

interface ProcessingItemsListProps {
  items: ProcessingItem[];
  currentIndex: number;
  totalItems: number;
}

const ProcessingItemsList = React.memo<ProcessingItemsListProps>(
  ({ items, currentIndex, totalItems }) => {
    const { t } = useI18n();
    const percentage = useMemo(() => {
      if (totalItems === 0) return 0;
      return Math.round((currentIndex / totalItems) * 100);
    }, [currentIndex, totalItems]);

    const statusCounts = useMemo(() => {
      return items.reduce(
        (acc, item) => {
          if (item.status === 'success') acc.success++;
          else if (item.status === 'original') acc.original++;
          else if (item.status === 'skipped') acc.skipped++;
          else if (item.status === 'processing') acc.processing++;
          return acc;
        },
        { success: 0, original: 0, skipped: 0, processing: 0 },
      );
    }, [items]);

    const isComplete = currentIndex === totalItems && totalItems > 0;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>
              {isComplete ? t('wardrobe.plan.processingComplete', undefined, 'Processing Complete') : t('wardrobe.plan.processingItems', undefined, 'Processing Items')}
            </Text>
            <Text style={styles.progressCount}>
              {t('wardrobe.plan.progressCount', { current: currentIndex, total: totalItems }, `${currentIndex} of ${totalItems} items`)}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${percentage}%` }]}
              />
            </View>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>

          {isComplete && (statusCounts.original > 0 || statusCounts.skipped > 0) && (
            <View style={styles.summaryContainer}>
              {statusCounts.success > 0 && (
                <Text style={styles.summaryTextSuccess}>
                  {t('wardrobe.plan.summary.processed', { count: statusCounts.success }, `✓ ${statusCounts.success} processed`)}
                </Text>
              )}
              {statusCounts.original > 0 && (
                <Text style={styles.summaryTextWarning}>
                  {t('wardrobe.plan.summary.usingOriginal', { count: statusCounts.original }, `⚠ ${statusCounts.original} using original`)}
                </Text>
              )}
              {statusCounts.skipped > 0 && (
                <Text style={styles.summaryTextError}>
                  {t('wardrobe.plan.summary.skipped', { count: statusCounts.skipped }, `✕ ${statusCounts.skipped} skipped`)}
                </Text>
              )}
            </View>
          )}
        </View>

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        >
          {items.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3B4A" />
              <Text style={styles.loadingText}>{t('wardrobe.plan.preparingItems', undefined, 'Preparing items...')}</Text>
            </View>
          ) : (
            items.map((processingItem, index) => (
              <ProcessingItemCard
                key={processingItem.item.id || index}
                itemName={
                  processingItem.item.brandName ||
                  processingItem.item.brand ||
                  t('wardrobe.unknownItem', undefined, 'Unknown Item')
                }
                imageUrl={
                  processingItem.item.itemDefaultImageUrl ||
                  processingItem.item.itemImageUrls?.[0] ||
                  ''
                }
                status={processingItem.status}
              />
            ))
          )}
        </ScrollView>
      </View>
    );
  },
);

ProcessingItemsList.displayName = 'ProcessingItemsList';

export default ProcessingItemsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressInfo: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 4,
  },
  progressCount: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF3B4A',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#071827',
    minWidth: 40,
    textAlign: 'right',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  summaryTextSuccess: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#34C759',
  },
  summaryTextWarning: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#FF9500',
  },
  summaryTextError: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#FF3B4A',
  },
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#637381',
  },
});

