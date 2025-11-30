import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewBottomModal from '@components/NewBottomModal';
import { useI18n } from '../hooks/use-i18n';

const SCREEN_HEIGHT = Dimensions.get('window').height;
// Modal height: 45% of screen height for optimal display across all devices
// This ensures the modal is not too tall on large screens or too short on small screens
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.45;

/**
 * CollectionActionsModal
 * 
 * Modal that presents actions for a collection.
 * Implements proper modal transition pattern to prevent UI freezing
 * when opening subsequent modals.
 * 
 * Modal Transition Pattern:
 * 1. User clicks action → Close this modal
 * 2. Wait for closing animation to complete (via onCloseComplete)
 * 3. Open next modal → No race condition, no freezing
 */
interface CollectionActionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddOutfit: () => void;
  onEditCollection: () => void;
  onRemoveItems: () => void;
  onDeleteCollection: () => void;
}

const CollectionActionsModal: React.FC<CollectionActionsModalProps> = ({
  isVisible,
  onClose,
  onAddOutfit,
  onEditCollection,
  onRemoveItems,
  onDeleteCollection,
}) => {
  const { t } = useI18n();
  // Track which action to execute after modal closes
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | 'remove' | 'delete' | null>(null);

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

  const handleAddOutfit = useCallback(() => {
    setPendingAction('add');
    onClose();
  }, [onClose]);

  const handleEditCollection = useCallback(() => {
    setPendingAction('edit');
    onClose();
  }, [onClose]);

  const handleRemoveItems = useCallback(() => {
    setPendingAction('remove');
    onClose();
  }, [onClose]);

  const handleDeleteCollection = useCallback(() => {
    setPendingAction('delete');
    onClose();
  }, [onClose]);

  const handleCloseComplete = useCallback(() => {
    // Execute pending action after modal is fully closed
    if (pendingAction === 'add') {
      onAddOutfit();
    } else if (pendingAction === 'edit') {
      onEditCollection();
    } else if (pendingAction === 'remove') {
      onRemoveItems();
    } else if (pendingAction === 'delete') {
      onDeleteCollection();
    }
    
    // Reset pending action
    setPendingAction(null);
  }, [pendingAction, onAddOutfit, onEditCollection, onRemoveItems, onDeleteCollection]);

  return (
    <NewBottomModal
      isShow={isVisible}
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      maxHeight={MODAL_HEIGHT}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('wardrobe.whatDoYouWantToDo')}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {/* Actions */}
        <View style={styles.actionsContainer}>
        {/* Add Outfit Option */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleAddOutfit}
          accessibilityRole="button"
          accessibilityLabel="Add outfits to collection"
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.actionText}>{t('wardrobe.addOutfitToCollection')}</Text>
        </TouchableOpacity>

        {/* Edit Collection Option */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleEditCollection}
          accessibilityRole="button"
          accessibilityLabel="Edit collection name and description"
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.actionText}>{t('wardrobe.editCollection')}</Text>
        </TouchableOpacity>

        {/* Remove Items Option */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleRemoveItems}
          accessibilityRole="button"
          accessibilityLabel="Remove items from collection"
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="trash-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.actionText}>{t('wardrobe.removeItemFromCollection')}</Text>
        </TouchableOpacity>

        {/* Delete Collection Option */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleDeleteCollection}
          accessibilityRole="button"
          accessibilityLabel="Delete entire collection"
        >
          <View style={[styles.actionIconContainer, styles.deleteIconContainer]}>
            <Ionicons name="trash-outline" size={20} color="#FF3B4A" />
          </View>
          <Text style={[styles.actionText, styles.deleteText]}>{ t('wardrobe.deleteCollection')}</Text>
        </TouchableOpacity>
        </View>
      </View>
    </NewBottomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    // No padding needed, header and actions will have their own spacing
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0, // No separator like in the screenshot
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSansSemiBold',
    color: '#07090C',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  actionIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deleteIconContainer: {
    // No additional styling needed, color is handled by icon
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'DMSansMedium',
    color: '#07090C',
    flex: 1,
  },
  deleteText: {
    color: '#FF3B4A',
    fontFamily: 'DMSansSemiBold',
  },
});

export default CollectionActionsModal;
