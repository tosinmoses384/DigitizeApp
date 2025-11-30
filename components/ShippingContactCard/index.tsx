import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EditIcon from '@assets/images/svg_components/edit_sm';

interface ShippingContactCardProps {
  title: string;
  contact: string;
  onEdit?: () => void;
}

const ShippingContactCard: React.FC<ShippingContactCardProps> = React.memo(({
  title,
  contact,
  onEdit,
}) => {

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {onEdit && (
          <TouchableOpacity 
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Edit contact"
            accessibilityRole="button"
          >
            <EditIcon />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.contactText}>{contact}</Text>
    </View>
  );
});

ShippingContactCard.displayName = 'ShippingContactCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#90959E',
    fontFamily: 'DMSans',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
  },
  contactText: {
    color: '#393939',
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '700',
    lineHeight: 18,
  },
});

export default ShippingContactCard;
