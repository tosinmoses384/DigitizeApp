import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShippingDropOffCardProps {
  title: string;
  onPress?: () => void;
  iconColor?: string;
}

const ShippingDropOffCard: React.FC<ShippingDropOffCardProps> = ({
  title,
  onPress,
  iconColor = '#3EC1EA',
}) => {

  return (
    <TouchableOpacity style={styles.cardRow} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: iconColor }]} />
      <Text style={styles.dropOffText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#637381" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 24,
    height: 20,
    borderRadius: 4,
  },
  dropOffText: {
    flex: 1,
    color: '#212B36',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '700',
    lineHeight: 24,
  },
});

export default ShippingDropOffCard;
