import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import moment from 'moment';
import { useI18n } from '@hooks/use-i18n';

interface OutfitDetails {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  planDate?: string;
}

interface RemoveOutfitFromDayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  outfit: OutfitDetails | null;
  loading?: boolean;
}

const RemoveOutfitFromDayModal: React.FC<RemoveOutfitFromDayModalProps> = React.memo(({
  isVisible,
  onClose,
  onConfirm,
  outfit,
  loading = false,
}) => {
  const { t } = useI18n();
  const handleConfirm = useCallback(() => {
    if (!loading) {
      onConfirm();
    }
  }, [onConfirm, loading]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  const formattedDate = outfit?.planDate
    ? moment(outfit.planDate).format('MMMM DD, YYYY')
    : '';

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel={t('wardrobe.closeModal', undefined, 'Close modal')}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.content}>
            {outfit?.imageUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: outfit.imageUrl }}
                  style={styles.outfitImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <Text style={styles.title}>{t('wardrobe.plan.removeOutfitTitle', undefined, 'Remove Outfit?')}</Text>
            
            <Text style={styles.message}>
              {t('wardrobe.plan.removeOutfitConfirmMessage', { name: outfit?.description || outfit?.title || t('wardrobe.outfit', undefined, 'this outfit'), date: formattedDate }, `Are you sure you want to remove "${outfit?.description || outfit?.title || 'this outfit'}" from ${formattedDate}?`)}
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressedButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleClose}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel', undefined, 'Cancel')}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel', undefined, 'Cancel')}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  pressed && styles.pressedButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleConfirm}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={t('wardrobe.plan.a11y.removeOutfit', undefined, 'Remove outfit')}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>{t('wardrobe.remove', undefined, 'Remove')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});

RemoveOutfitFromDayModal.displayName = 'RemoveOutfitFromDayModal';

export default RemoveOutfitFromDayModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'DMSansBold',
    color: '#071827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#637381',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#FF3B4A',
  },
  pressedButton: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    color: '#071827',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
    color: '#FFFFFF',
  },
});

