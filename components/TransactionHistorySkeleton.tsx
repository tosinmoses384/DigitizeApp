import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './purchase/SkeletonComponents';

interface TransactionHistorySkeletonProps {
  count?: number;
}

const TransactionHistorySkeleton: React.FC<TransactionHistorySkeletonProps> = React.memo(
  ({ count = 3 }) => {
    return (
      <View style={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.card}>
            <SkeletonBox width={60} height={14} marginBottom={8} />
            <View style={styles.row}>
              <View style={styles.flex}>
                <SkeletonBox width="70%" height={14} marginBottom={6} />
                <View style={styles.dateRow}>
                  <SkeletonBox width={5} height={5} borderRadius={2.5} />
                  <SkeletonBox width="40%" height={12} marginLeft={5} />
                </View>
              </View>
              <View style={styles.amountRow}>
                <SkeletonBox width={80} height={14} marginBottom={4} />
                <SkeletonBox width={20} height={20} borderRadius={10} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }
);

TransactionHistorySkeleton.displayName = 'TransactionHistorySkeleton';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  card: {
    borderColor: '#E9EAEB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 70,
    marginBottom: 10,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

export default TransactionHistorySkeleton;

