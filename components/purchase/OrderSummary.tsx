import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatAmount } from '@helper/formatCash';

interface OrderSummaryItem {
  id: string | number;
  title: string;
  amount: number;
  icon?: any;
  customBodyStyle?: any;
  customStyleText?: any;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  totalAmount: number;
  currencySymbol: string;
  onIconPress?: () => void;
  showTotal?: boolean;
}

const OrderSummary = React.memo(({
  items,
  totalAmount,
  currencySymbol,
  onIconPress,
  showTotal = true,
}: OrderSummaryProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      {items.map((order) => (
        <View
          key={order.id}
          style={order.customBodyStyle || styles.itemRow}
        >
          <View style={styles.titleView}>
            <Text style={styles.titleText}>{order.title}</Text>
            {order.icon && order.title.toLowerCase() === 'buyer protection' && (
              <Ionicons
                name={order.icon}
                size={15}
                onPress={onIconPress}
              />
            )}
          </View>
          <Text style={order.customStyleText || styles.amountText}>
            {formatAmount(order.amount || 0, currencySymbol)}
          </Text>
        </View>
      ))}
      {showTotal && (
        <View style={styles.totalRow}>
          <View style={styles.titleView}>
            <Text style={styles.totalText}>Total to pay</Text>
          </View>
          <Text style={styles.totalAmountText}>
            {formatAmount(totalAmount, currencySymbol)}
          </Text>
        </View>
      )}
    </View>
  );
});

OrderSummary.displayName = 'OrderSummary';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    color: '#212B36',
    fontFamily: 'DMSansSemiBold',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 4,
  },
  titleView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    color: '#212B36',
    fontSize: 14,
    textTransform: 'capitalize',
    marginLeft: 4,
  },
  amountText: {
    color: '#637381',
    fontSize: 14,
    fontFamily: 'DMSansMedium',
  },
  totalRow: {
    marginTop: 18,
    flexDirection: 'row',
  },
  totalText: {
    color: '#232323',
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
  },
  totalAmountText: {
    color: '#212B36',
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
  },
});

export default OrderSummary;
