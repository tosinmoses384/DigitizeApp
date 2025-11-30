import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WardrobeEmpty from '../../assets/images/svg/emptyWardrobe.svg';
import { fontSz } from '../../constants';

interface WardrobeEmptyStateProps {
  type: 'items' | 'outfits';
  onAction: () => void;
  emptyTitle: string;
  emptyDescription: string;
  actionButtonText: string;
}

const WardrobeEmptyState = React.memo<WardrobeEmptyStateProps>(({
  type,
  onAction,
  emptyTitle,
  emptyDescription,
  actionButtonText,
}) => {
  return (
    <View style={styles.emptyState}>
      <WardrobeEmpty height={190} width={250} />
      <Text style={styles.emptyText}>{emptyTitle}</Text>
      <Text style={styles.emptyText2}>{emptyDescription}</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAction}>
        <Text style={styles.addButtonText}>{actionButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
});

WardrobeEmptyState.displayName = 'WardrobeEmptyState';

export default WardrobeEmptyState;

const styles = StyleSheet.create({
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: fontSz(14),
    color: '#07090C',
    marginBottom: 10,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'DMSansMedium',
  },
  emptyText2: {
    fontSize: fontSz(14),
    color: '#90959E',
    marginBottom: 20,
    justifyContent: 'center',
    textAlign: 'center',
    marginHorizontal: 80,
    fontFamily: 'DMSansRegular',
  },
  addButton: {
    backgroundColor: '#464F5D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 250,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: fontSz(15),
    fontFamily: 'DMSansRegular',
  },
});

