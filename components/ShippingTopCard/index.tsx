import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ShippingTopCardProps {
  title: string;
  description: string;
  iconColor?: string;
}

const ShippingTopCard: React.FC<ShippingTopCardProps> = ({ 
  title, 
  description, 
  iconColor = '#EAC43E' 
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.topCardIcon, { backgroundColor: iconColor }]} />
      <Text style={styles.topCardTitle}>
        {title}
      </Text>
      <Text style={styles.topCardDescription}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  topCardIcon: {
    width: 24,
    height: 20,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  topCardTitle: {
    textAlign: 'center',
    color: '#393939',
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    // lineHeight: 18,
  },
  topCardDescription: {
    textAlign: 'center',
    color: '#393939',
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default ShippingTopCard;
