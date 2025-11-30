import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import NewBottomModal from '@components/NewBottomModal';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@hooks/use-i18n';

interface PlanActionSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onAddFromOutfits: () => void;
  onAddFromItems: () => void;
  onCreateNewOutfit: () => void;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; onPress: () => void }> = ({ icon, label, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowText}>{label}</Text>
    </Pressable>
  );
};

const PlanActionSheetModal: React.FC<PlanActionSheetModalProps> = ({ isVisible, onClose, onCloseComplete, onAddFromOutfits, onAddFromItems, onCreateNewOutfit }) => {
  const { t } = useI18n();
  return (
    <NewBottomModal isShow={isVisible} onClose={onClose} onCloseComplete={onCloseComplete} maxHeight={420}>
      <View style={styles.container}>
        <View style={styles.grabber} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('wardrobe.plan.actionSheet.title', undefined, 'How do you want to plan your outfit?')}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close', undefined, 'Close')}>
            <Ionicons name="close" size={24} color="#9AA0A6" />
          </Pressable>
        </View>

        <Row
          icon={<Ionicons name="albums-outline" size={24} color="#637381" />}
          label={t('wardrobe.plan.actionSheet.addFromOutfits', undefined, 'Add from outfits')}
          onPress={onAddFromOutfits}
        />
        <Row
          icon={<Ionicons name="shirt-outline" size={24} color="#637381" />}
          label={t('wardrobe.plan.actionSheet.addFromItems', undefined, 'Add from wardrobe items')}
          onPress={onAddFromItems}
        />
        <Row
          icon={<Ionicons name="add-circle-outline" size={24} color="#637381" />}
          label={t('wardrobe.plan.actionSheet.createNewOutfit', undefined, 'Create new outfits')}
          onPress={onCreateNewOutfit}
        />
      </View>
    </NewBottomModal>
  );
};

export default PlanActionSheetModal;

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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'DMSansBold',
    color: '#071827',
    flex: 1,
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  pressed: {
    opacity: 0.6,
  },
  rowIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: '#32393E',
    fontFamily: 'DMSansMedium',
  },
});
