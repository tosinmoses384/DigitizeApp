import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import EditIcon from '../../assets/images/svg/edit.svg';

interface ShippingAddressCardProps {
  contactName?: string;
  addressLine1?: string;
  addressLine2?: string;
}

const ShippingAddressCard = React.memo(({
  contactName,
  addressLine1,
  addressLine2,
}: ShippingAddressCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push('/BuyerAddressLocation')}
    >
      <View style={styles.detailsView}>
        <Text style={styles.name}>
          {contactName || 'My address'}
        </Text>
        <Text style={styles.address}>
          {addressLine1
            ? `${addressLine1} `
            : 'Add your shipping address'}
          {addressLine2 ? `/ ${addressLine2}` : ''}
        </Text>
      </View>
      <View>
        <EditIcon />
      </View>
    </Pressable>
  );
});

ShippingAddressCard.displayName = 'ShippingAddressCard';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 4,
    marginTop: 16,
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.5,
  },
  detailsView: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    color: '#393939',
    marginBottom: 4,
    fontFamily: 'DMSansSemiBold',
    textTransform: 'capitalize',
  },
  address: {
    fontSize: 12,
    color: '#637381',
    fontFamily: 'DMSansMedium',
    textTransform: 'capitalize',
  },
});

export default ShippingAddressCard;
