import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import NewBottomModal from '@components/NewBottomModal';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@hooks/use-i18n';

/**
 * OutfitCardActionModal
 * 
 * Modal that presents actions for an outfit card in the Plan view.
 * Implements proper modal transition pattern to prevent UI freezing
 * when opening subsequent modals.
 * 
 * Modal Transition Pattern:
 * 1. User clicks action → Close this modal
 * 2. Wait for closing animation to complete (via onCloseComplete)
 * 3. Open next modal → No race condition, no freezing
 * 
 * This pattern is REQUIRED for all modals that trigger other modals.
 * See: CollectionActionsModal for reference implementation.
 */
interface OutfitCardActionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onPlanForLater: () => void;
  onRemove: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void; isDestructive?: boolean }> = ({ 
  icon, 
  label, 
  onPress, 
  isDestructive = false 
}) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowText, isDestructive && styles.destructiveText]}>{label}</Text>
    </Pressable>
  );
};

const OutfitCardActionModal: React.FC<OutfitCardActionModalProps> = ({ 
  isVisible, 
  onClose, 
  onCloseComplete,
  onPlanForLater, 
  onRemove 
}) => {
  const { t } = useI18n();
  // Track which action to execute after modal closes
  const [pendingAction, setPendingAction] = useState<'planLater' | 'remove' | null>(null);

  /**
   * Modal Transition Pattern Implementation:
   * Instead of immediately calling the action callback, we:
   * 1. Store which action to execute
   * 2. Close the modal (triggers animation)
   * 3. Wait for onCloseComplete callback
   * 4. Execute the action (which may open another modal)
   * 
   * This prevents modal stacking race conditions that cause UI freezing.
   */

  const handlePlanForLater = useCallback(() => {
    setPendingAction('planLater');
    onClose();
  }, [onClose]);

  const handleRemove = useCallback(() => {
    setPendingAction('remove');
    onClose();
  }, [onClose]);

  const handleCloseComplete = useCallback(() => {
    // Execute pending action after modal is fully closed
    if (pendingAction === 'planLater') {
      onPlanForLater();
    } else if (pendingAction === 'remove') {
      onRemove();
    }
    
    // Reset pending action
    setPendingAction(null);

    // Call parent's onCloseComplete if provided
    if (onCloseComplete) {
      onCloseComplete();
    }
  }, [pendingAction, onPlanForLater, onRemove, onCloseComplete]);

  return (
    <NewBottomModal 
      isShow={isVisible} 
      onClose={onClose} 
      onCloseComplete={handleCloseComplete}
      maxHeight={300}
    >
      <View style={styles.container}>
        <View style={styles.grabber} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('wardrobe.whatDoYouWantToDo', undefined, 'What do you want to do?')}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close', undefined, 'Close')}>
            <Ionicons name="close" size={24} color="#9AA0A6" />
          </Pressable>
        </View>

        <Row
          icon={<Ionicons name="calendar-outline" size={24} color="#637381" />}
          label={t('wardrobe.plan.planOutfitForLater', undefined, 'Plan outfit for later')}
          onPress={handlePlanForLater}
        />
        <Row
          icon={<Ionicons name="close-circle-outline" size={24} color="#FF3B4A" />}
          label={t('wardrobe.plan.removeOutfitFromPlan', undefined, 'Remove outfit from plan')}
          onPress={handleRemove}
          isDestructive
        />
      </View>
    </NewBottomModal>
  );
};

export default OutfitCardActionModal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  pressed: {
    backgroundColor: '#F5F5F5',
  },
  rowIcon: {
    marginRight: 16,
  },
  rowText: {
    fontSize: 16,
    fontFamily: 'DMSansMedium',
    color: '#071827',
  },
  destructiveText: {
    color: '#FF3B4A',
  },
});

