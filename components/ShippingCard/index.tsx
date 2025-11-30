import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ShippingCardProps {
  children: React.ReactNode;
  style?: any;
}

const ShippingCard: React.FC<ShippingCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
});

export default ShippingCard;
