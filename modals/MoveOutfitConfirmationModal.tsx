import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import NewBottomModal from '@components/NewBottomModal';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePreviewModal from './ImagePreviewModal';
import { useI18n } from '@hooks/use-i18n';

interface OutfitData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  planDate?: string;
}

interface MoveOutfitConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onChangeDate?: () => void;
  onConfirm: () => void;
  outfit: OutfitData | null;
  targetDate: Date | null;
  existingOutfits: OutfitData[];
  loading: boolean;
  confirmLoading: boolean;
}

const MoveOutfitConfirmationModal: React.FC<MoveOutfitConfirmationModalProps> = ({
  isVisible,
  onClose,
  onCloseComplete,
  onChangeDate,
  onConfirm,
  outfit,
  targetDate,
  existingOutfits,
  loading,
  confirmLoading,
}) => {
  const { t } = useI18n();
  const formattedDate = targetDate ? moment(targetDate).format('MMM DD, YYYY') : '';
  const dayName = targetDate ? moment(targetDate).format('dddd') : '';
  const insets = useSafeAreaInsets();
  const SHEET_MAX_HEIGHT = Math.min(Dimensions.get('window').height * 0.92, 760);
  const FOOTER_HEIGHT = 56; // visual height of button row (without safe-area)
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  return (
    <NewBottomModal isShow={isVisible} onClose={onClose} onCloseComplete={onCloseComplete} maxHeight={SHEET_MAX_HEIGHT}>
      <View style={styles.container}>
        <View style={styles.grabber} />
        
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('wardrobe.plan.moveToDateTitle', { date: formattedDate }, `Move outfit to ${formattedDate}?`)}</Text>
          <Pressable 
            onPress={onClose} 
            accessibilityRole="button" 
            accessibilityLabel={t('common.close', undefined, 'Close')}
            disabled={confirmLoading}
          >
            <Ionicons name="close" size={24} color="#9AA0A6" />
          </Pressable>
        </View>

        <View style={styles.subHeaderRow}>
          <Text style={styles.subtitle}>{dayName}</Text>
          {!!onChangeDate && (
            <Pressable
              style={styles.changeDateBtn}
              onPress={onChangeDate}
              accessibilityRole="button"
              accessibilityLabel={t('wardrobe.plan.changeDate', undefined, 'Change date')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="calendar-outline" size={16} color="#FF3B4A" style={styles.changeDateIcon} />
              <Text style={styles.changeDateText}>{t('wardrobe.plan.changeDate', undefined, 'Change date')}</Text>
            </Pressable>
          )}
        </View>

        <ScrollView 
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 24, flexGrow: 1 }}
        >
          {/* Outfit Being Moved */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('wardrobe.plan.outfitToMove', undefined, 'Outfit to move')}</Text>
            <Pressable style={styles.outfitCard} onPress={() => {
              const uri = outfit?.imageUrl || '';
              if (uri) setPreviewUri(uri);
            }} accessibilityRole="button" accessibilityLabel={t('wardrobe.plan.a11y.previewOutfitImage', undefined, 'Preview outfit image')}>
              <View style={styles.outfitImageContainer}>
                {outfit?.imageUrl ? (
                  <Image
                    source={{ uri: outfit.imageUrl }}
                    style={styles.outfitImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={32} color="#9AA0A6" />
                  </View>
                )}
              </View>
              <Text style={styles.outfitName} numberOfLines={2}>
                {outfit?.description || outfit?.title || t('wardrobe.untitledOutfit', undefined, 'Untitled Outfit')}
              </Text>
            </Pressable>
          </View>

          {/* Existing Outfits for Target Date */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('wardrobe.plan.alreadyPlannedForThisDay', undefined, 'Already planned for this day')}</Text>
              <View style={styles.countPill} accessibilityRole="text" accessibilityLabel={t('wardrobe.plan.a11y.plannedOutfitsCount', { count: existingOutfits.length }, `Planned outfits count: ${existingOutfits.length}`)}>
                <Text style={styles.countPillText}>{existingOutfits.length}</Text>
              </View>
            </View>
            
            {loading ? (
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonTile} />
                <View style={styles.skeletonTile} />
              </View>
            ) : existingOutfits.length > 0 ? (
              <View style={styles.existingOutfitsGrid}>
                {existingOutfits.map((existingOutfit) => (
                  <Pressable
                    key={existingOutfit.id}
                    style={styles.existingOutfitCard}
                    onPress={() => {
                      const uri = existingOutfit.imageUrl || '';
                      if (uri) setPreviewUri(uri);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t('wardrobe.plan.a11y.existingOutfitLabel', { name: existingOutfit.description || existingOutfit.title || t('wardrobe.outfit', undefined, 'Outfit') }, `Existing outfit: ${existingOutfit.description || existingOutfit.title || 'Outfit'}`)}
                  >
                    <View style={styles.existingOutfitImageContainer}>
                      {existingOutfit.imageUrl ? (
                        <Image
                          source={{ uri: existingOutfit.imageUrl }}
                          style={styles.existingOutfitImage}
                          contentFit="cover"
                          transition={200}
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View style={styles.placeholderExistingImage}>
                          <Ionicons name="image-outline" size={20} color="#9AA0A6" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.existingOutfitName} numberOfLines={2}>
                      {existingOutfit.description || existingOutfit.title || t('common.untitled', undefined, 'Untitled')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={32} color="#9AA0A6" />
                <Text style={styles.emptyStateText}>{t('wardrobe.plan.noOutfitsPlannedYet', undefined, 'No outfits planned yet')}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }] }>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={onClose}
            disabled={confirmLoading}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel', undefined, 'Cancel')}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel', undefined, 'Cancel')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              pressed && styles.confirmButtonPressed,
              confirmLoading && styles.confirmButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={confirmLoading}
            accessibilityRole="button"
            accessibilityLabel={t('wardrobe.plan.a11y.moveOutfit', undefined, 'Move outfit')}
          >
            {confirmLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText} numberOfLines={1} ellipsizeMode="tail">{t('wardrobe.plan.moveHere', undefined, 'Move here')}</Text>
            )}
          </Pressable>
        </View>
      </View>
      <ImagePreviewModal isVisible={!!previewUri} uri={previewUri || ''} onClose={() => setPreviewUri(null)} />
    </NewBottomModal>
  );
};

export default MoveOutfitConfirmationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
  },
  grabber: {
    alignSelf: 'center',
    width: 70,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DADDE1',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#637381',
    marginBottom: 20,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  changeDateText: {
    fontSize: 14,
    fontFamily: 'DMSansBold',
    color: '#FF3B4A',
  },
  changeDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeDateIcon: {
    marginRight: 6,
  },
  scrollArea: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'DMSansBold',
    color: '#071827',
  },
  countPill: {
    minWidth: 26,
    paddingHorizontal: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 12,
    fontFamily: 'DMSansBold',
    color: '#637381',
  },
  outfitCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  outfitImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  outfitName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSansMedium',
    color: '#071827',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#637381',
  },
  existingOutfitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  existingOutfitCard: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  existingOutfitImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },
  existingOutfitImage: {
    width: '100%',
    height: '100%',
  },
  placeholderExistingImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  existingOutfitName: {
    fontSize: 12,
    fontFamily: 'DMSansMedium',
    color: '#071827',
    textAlign: 'center',
    minHeight: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#9AA0A6',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EAED',
  },

  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#ECEFF1',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    color: '#071827',
  },
  confirmButton: {
    backgroundColor: '#FF3B4A',
  },
  confirmButtonPressed: {
    opacity: 0.8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'DMSansBold',
    color: '#FFFFFF',
  },
});

