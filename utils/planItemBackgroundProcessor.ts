import fileServerServices from '@services/features/file-server/fileServer';
import { removeImageBackground, canProcessImageForBackgroundRemoval } from './backgroundRemovalUtils';
import { WardrobeItem } from '@services/features/wardrobe-service/types';

export interface ProcessedItem extends WardrobeItem {
  itemImageUrls: string[];
  processingStatus?: 'success' | 'original';
  processingError?: string;
}

export type ItemProcessingStatus = 'waiting' | 'processing' | 'success' | 'original' | 'skipped';

export interface ItemProgress {
  item: WardrobeItem;
  status: ItemProcessingStatus;
}

export interface ProcessingProgress {
  currentIndex: number;
  totalItems: number;
  currentItemName: string;
  completedItems: ProcessedItem[];
  itemsWithOriginalImage: number;
  itemsProgress: ItemProgress[];
}

export interface ProcessingResult {
  success: boolean;
  processedItems: ProcessedItem[];
  itemsWithOriginalImage: number;
  skippedCount: number;
  totalCount: number;
  skippedItems: { itemId: string; itemName: string; reason: string }[];
}

const extractFilenameFromUrl = (url: string): string => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1];
};

const processItemBackgroundRemoval = async (
  item: WardrobeItem,
  token: string,
): Promise<ProcessedItem | null> => {
  const originalImageUri = item.itemDefaultImageUrl || item.itemImageUrls?.[0];

  if (!originalImageUri) {
    if (__DEV__) {
      console.warn('Item has no image:', item.id, item.brandName || item.brand);
    }
    return null;
  }

  try {
    if (canProcessImageForBackgroundRemoval(originalImageUri)) {
      const backgroundRemovalResult = await removeImageBackground(originalImageUri, {
        trim: true,
        timeout: 20000,
      });

      if (backgroundRemovalResult.backgroundRemoved && !backgroundRemovalResult.error) {
        if (__DEV__) {
          console.log('Local background removal successful for:', item.brandName || item.brand);
        }
        return {
          ...item,
          itemImageUrls: [backgroundRemovalResult.uri],
          backgroundRemoved: true,
          processingStatus: 'success',
        } as any;
      } else {
        if (__DEV__) {
          console.log('Local background removal failed, trying API for:', item.brandName || item.brand);
        }
      }
    } else {
      if (__DEV__) {
        console.log('Image not suitable for local removal, using API for:', item.brandName || item.brand);
      }
    }

    const res = await fileServerServices.getTransparentOutfitPicture(
      token,
      extractFilenameFromUrl(originalImageUri),
      item.requestId || '',
    );

    if (res?.status === 200) {
      const processedImageUri = (res?.data as any)?.data?.resourceUrl || (res?.data as any)?.resourceUrl;
      if (__DEV__) {
        console.log('API background removal successful for:', item.brandName || item.brand);
      }
      return {
        ...item,
        itemImageUrls: [processedImageUri],
        backgroundRemoved: true,
        processingStatus: 'success',
      } as any;
    }

    if (__DEV__) {
      console.log('Background removal unavailable, using original image for:', item.brandName || item.brand);
    }
    return {
      ...item,
      itemImageUrls: [originalImageUri],
      processingStatus: 'original',
      processingError: 'Background removal unavailable',
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Error processing item:', item.brandName || item.brand, error);
    }
    return {
      ...item,
      itemImageUrls: [originalImageUri],
      processingStatus: 'original',
      processingError: 'Processing error occurred',
    };
  }
};

export const processBatchItemsBackgroundRemoval = async (
  items: WardrobeItem[],
  token: string,
  onProgress?: (progress: ProcessingProgress) => void,
  maxConcurrency: number = 3,
): Promise<ProcessingResult> => {
  const totalCount = items.length;
  const processedItems: ProcessedItem[] = [];
  const skippedItems: { itemId: string; itemName: string; reason: string }[] = [];
  let completedCount = 0;
  let itemsWithOriginalImageCount = 0;

  const itemsProgress: ItemProgress[] = items.map(item => ({
    item,
    status: 'waiting' as ItemProcessingStatus,
  }));

  if (onProgress) {
    onProgress({
      currentIndex: 0,
      totalItems: totalCount,
      currentItemName: '',
      completedItems: [],
      itemsWithOriginalImage: 0,
      itemsProgress: [...itemsProgress],
    });
  }

  const processWithConcurrency = async () => {
    const results = await Promise.allSettled(
      items.map(async (item, index) => {
        itemsProgress[index].status = 'processing';

        if (onProgress) {
          onProgress({
            currentIndex: completedCount,
            totalItems: totalCount,
            currentItemName: item.brandName || item.brand || 'Item',
            completedItems: [...processedItems],
            itemsWithOriginalImage: itemsWithOriginalImageCount,
            itemsProgress: [...itemsProgress],
          });
        }

        const result = await processItemBackgroundRemoval(item, token);

        completedCount++;

        if (result === null) {
          itemsProgress[index].status = 'skipped';
          skippedItems.push({
            itemId: item.id,
            itemName: item.brandName || item.brand || 'Unknown Item',
            reason: 'No image available',
          });
        } else if (result.processingStatus === 'original') {
          itemsProgress[index].status = 'original';
          itemsWithOriginalImageCount++;
        } else {
          itemsProgress[index].status = 'success';
        }

        if (onProgress) {
          const validResults = result ? [result] : [];
          onProgress({
            currentIndex: completedCount,
            totalItems: totalCount,
            currentItemName: item.brandName || item.brand || 'Item',
            completedItems: [...processedItems, ...validResults],
            itemsWithOriginalImage: itemsWithOriginalImageCount,
            itemsProgress: [...itemsProgress],
          });
        }

        return result;
      }),
    );

    return results
      .map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          if (__DEV__) {
            console.error('Promise rejected during processing:', result.reason);
          }
          return null;
        }
      })
      .filter((item): item is ProcessedItem => item !== null);
  };

  const allProcessedItems = await processWithConcurrency();
  processedItems.push(...allProcessedItems);

  return {
    success: skippedItems.length === 0 && itemsWithOriginalImageCount === 0,
    processedItems: allProcessedItems,
    itemsWithOriginalImage: itemsWithOriginalImageCount,
    skippedCount: skippedItems.length,
    totalCount,
    skippedItems,
  };
};

export const processSingleItemBackgroundRemoval = async (
  item: WardrobeItem,
  token: string,
): Promise<ProcessedItem | null> => {
  return processItemBackgroundRemoval(item, token);
};

