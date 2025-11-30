import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EditIcon from '@assets/images/svg_components/edit_sm';

interface ShippingAddressCardProps {
  title: string;
  name: string;
  address: string;
  onEdit?: () => void;
  avatarColor?: string;
}

const ShippingAddressCard: React.FC<ShippingAddressCardProps> = React.memo(({
  title,
  name,
  address,
  onEdit,
  avatarColor = '#3EC1EA',
}) => {
  const Edit = () => <EditIcon />;

  return (
    <View style={styles.card}>
      <View style={styles.innerCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {onEdit && (
            <TouchableOpacity 
              onPress={onEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Edit address"
              accessibilityRole="button"
            >
              <Edit />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardBody}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]} />
          <View style={styles.addressContainer}>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

ShippingAddressCard.displayName = 'ShippingAddressCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  innerCard: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#F4F6F8',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
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
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  addressContainer: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    color: '#393939',
    textAlign: 'left',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'DMSans',
  },
  addressText: {
    color: '#637381',
    fontFamily: 'DMSans',
    fontWeight: '500',
    textAlign: 'left',
    fontSize: 12,
  },
});

export default ShippingAddressCard;
