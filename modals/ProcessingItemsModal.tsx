import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import NewBottomModal from '@components/NewBottomModal';
import { ProcessingProgress } from '@utils/planItemBackgroundProcessor';
import { useI18n } from '@hooks/use-i18n';

interface ProcessingItemsModalProps {
  isVisible: boolean;
  progress: ProcessingProgress | null;
}

const ProcessingItemsModal = React.memo<ProcessingItemsModalProps>(
  ({ isVisible, progress }) => {
    const { t } = useI18n();
    const percentage = progress
      ? Math.round((progress.currentIndex / progress.totalItems) * 100)
      : 0;

    return (
      <NewBottomModal
        isShow={isVisible}
        onClose={() => {}}
        maxHeight={280}
        contentStyle={styles.modalContent}
        enableBackdropDismiss={false}
      >
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color="#FF3B4A" />
          </View>

          <Text style={styles.title}>{t('wardrobe.plan.processingItems', undefined, 'Processing Items')}</Text>
          
          {progress && (
            <>
              <Text style={styles.progressText}>
                {t('wardrobe.plan.progressCount', { current: progress.currentIndex, total: progress.totalItems }, `${progress.currentIndex} of ${progress.totalItems} items`)}
              </Text>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.currentItemText} numberOfLines={1}>
                {t('wardrobe.plan.processingCurrentItem', { name: progress.currentItemName }, `Processing: ${progress.currentItemName}`)}
              </Text>

              {progress.itemsWithOriginalImage > 0 && (
                <Text style={styles.warningText}>
                  {t('wardrobe.plan.itemsUsingOriginalShort', { count: progress.itemsWithOriginalImage }, `${progress.itemsWithOriginalImage} item(s) using original image`)}
                </Text>
              )}
            </>
          )}

          <Text style={styles.subtitleText}>
            {t('wardrobe.plan.removingBackgrounds', undefined, 'Removing backgrounds and preparing items...')}
          </Text>
        </View>
      </NewBottomModal>
    );
  },
);

ProcessingItemsModal.displayName = 'ProcessingItemsModal';

export default ProcessingItemsModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    width: '100%',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'DMSansMedium',
    color: '#637381',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF3B4A',
    borderRadius: 4,
  },
  currentItemText: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#FF9500',
    marginTop: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: 'DMSansRegular',
    color: '#90959E',
    marginTop: 12,
    textAlign: 'center',
  },
});

