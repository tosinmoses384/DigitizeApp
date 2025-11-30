import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import HomeIcon from '../../assets/images/svg/home-house.svg';
import EditIcon from '../../assets/images/svg/edit.svg';
import { formatAmount } from '@helper/formatCash';
import { IDeliveryOptionWithFees } from '@services/features/orders/models';
import { toTitleCase } from '@utils/stringUtils';

interface DeliveryDetailsCardProps {
  deliveryOption: IDeliveryOptionWithFees;
  currencySymbol: string;
  onPress: () => void;
}

const DeliveryDetailsCard = React.memo(({
  deliveryOption,
  currencySymbol,
  onPress,
}: DeliveryDetailsCardProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <Text style={styles.title}>Delivery details</Text>
        <View style={styles.providerRow}>
          <View style={styles.colorIndicator} />
          <Text style={styles.providerText}>
            {toTitleCase(deliveryOption.provider)} - {deliveryOption.serviceType}
          </Text>
        </View>
        <Text style={styles.amount}>
          {formatAmount(deliveryOption.estimatedFee || 0, currencySymbol)}
        </Text>
        <View style={styles.timeRow}>
          <HomeIcon />
          <Text style={styles.timeText}>
            {deliveryOption.serviceTypeDescription || 'Home Delivery'}
          </Text>
        </View>
        {deliveryOption.breakDown && deliveryOption.breakDown.length > 0 && (
          <View style={styles.breakdownContainer}>
            {deliveryOption.breakDown.map((breakdown: any) => (
              <Text key={breakdown.id} style={styles.timeText}>
                • {breakdown.description}:{' '}
                {formatAmount(breakdown.fee, currencySymbol)}
              </Text>
            ))}
          </View>
        )}
      </View>
      <View>
        <EditIcon />
      </View>
    </Pressable>
  );
});

DeliveryDetailsCard.displayName = 'DeliveryDetailsCard';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.5,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#212B36',
    fontFamily: 'DMSansSemiBold',
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  providerText: {
    flex: 1,
    color: '#393939',
    fontSize: 14,
    fontFamily: 'DMSansMedium',
  },
  colorIndicator: {
    width: 24,
    height: 20,
    backgroundColor: '#EAC43E',
    borderRadius: 4,
    marginRight: 8,
  },
  amount: {
    fontSize: 14,
    color: '#393939',
    fontFamily: 'DMSansMedium',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#393939',
    marginLeft: 8,
  },
  breakdownContainer: {
    marginTop: 8,
  },
});

export default DeliveryDetailsCard;
