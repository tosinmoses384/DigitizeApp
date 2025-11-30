import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface ShippingCardRowProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

const ShippingCardRow: React.FC<ShippingCardRowProps> = ({ children, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.cardRow, style]} onPress={onPress}>
      {children}
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
});

export default ShippingCardRow;
