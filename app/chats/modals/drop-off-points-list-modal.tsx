/**
 * Drop-off Points List Modal
 * 
 * Displays a searchable list of available drop-off points for shipping.
 * Fetches data from the order service API and allows users to select a location.
 * 
 * Following Coding.md guidelines:
 * - Functional component with TypeScript
 * - Performance optimizations with useCallback and React.memo
 * - Proper error handling and loading states
 * - Accessibility labels and roles
 * - StyleSheet.create for styling
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@redux/store';
import orderServices from '@services/features/orders/orderService';
import { IDropOffPoint } from '@services/features/orders/models';
import { SkeletonBox } from '@components/purchase/SkeletonComponents';
import DropOffPointDetailModal from './drop-off-point-detail-modal';

interface DropOffPointsListModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  onSelectPoint: (point: IDropOffPoint) => void;
}

const DropOffPointsListModal: React.FC<DropOffPointsListModalProps> = ({
  visible,
  onClose,
  orderId,
  onSelectPoint,
}) => {
  const [dropOffPoints, setDropOffPoints] = useState<IDropOffPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<IDropOffPoint | null>(null);
  const { token } = useAppSelector((state) => state.userProfileSlice);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch drop-off points
  const fetchDropOffPoints = useCallback(async () => {
    if (!token || !orderId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await orderServices.getDropOffPoints(
        token,
        orderId,
        debouncedSearch
      );

      if (response.status === 200 && response.data) {
        setDropOffPoints(response.data.data || response.data);
        setErrorMessage(null);
      } else if (response.status === 400) {
        // Handle validation errors from backend
        setDropOffPoints([]);
        setErrorMessage(response.detail || response.message || 'Drop-off points are not available');
      } else {
        setDropOffPoints([]);
        setErrorMessage('Failed to load drop-off points');
      }
    } catch (error: any) {
      console.error('Error fetching drop-off points:', error);
      setDropOffPoints([]);
      // Extract error message from the API response
      const message = error?.response?.data?.detail || 
                     error?.detail || 
                     error?.message || 
                     'Failed to load drop-off points';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, orderId, debouncedSearch]);

  useEffect(() => {
    if (visible) {
      fetchDropOffPoints();
    }
  }, [visible, fetchDropOffPoints]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setErrorMessage(null);
    setIsDetailModalVisible(false);
    setSelectedPoint(null);
    onClose();
  }, [onClose]);

  const handleSelectPoint = useCallback((point: IDropOffPoint) => {
    setSelectedPoint(point);
    // Only open modal if it's not already open to prevent close/reopen animation
    if (!isDetailModalVisible) {
      setIsDetailModalVisible(true);
    }
  }, [isDetailModalVisible]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailModalVisible(false);
    setSelectedPoint(null);
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (selectedPoint) {
      onSelectPoint(selectedPoint);
      handleClose();
    }
  }, [selectedPoint, onSelectPoint, handleClose]);

  const renderDropOffPoint = useCallback(
    ({ item }: { item: IDropOffPoint }) => {
      const address = typeof item.address === 'string' 
        ? item.address 
        : (item.address?.address1 || 'N/A');
      const address2 = typeof item.address === 'object' 
        ? item.address?.address2 
        : item.address2;

      return (
        <TouchableOpacity
          style={styles.pointItem}
          onPress={() => handleSelectPoint(item)}
          accessibilityRole="button"
          accessibilityLabel={`Select drop-off point at ${item.name}`}
        >
          <View style={styles.pointIconContainer}>
            <View style={styles.pointIcon} />
          </View>
          <View style={styles.pointInfo}>
            <Text style={styles.pointName}>{item.name}</Text>
            <Text style={styles.pointAddress}>{address}</Text>
            {address2 && (
              <Text style={styles.pointAddress}>{address2}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#637381" />
        </TouchableOpacity>
      );
    },
    [handleSelectPoint]
  );

  const keyExtractor = useCallback((item: IDropOffPoint, index: number) => {
    return item.id || `drop-off-${index}`;
  }, []);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        {errorMessage ? (
          <>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6F61" style={styles.errorIcon} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            {searchQuery ? 'No drop-off points found' : 'No drop-off points available'}
          </Text>
        )}
      </View>
    );
  }, [isLoading, searchQuery, errorMessage]);

  const renderListHeader = useCallback(() => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#637381" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#919EAB"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search drop-off points"
        accessibilityRole="search"
      />
    </View>
  ), [searchQuery]);

  const renderSkeletonItem = useCallback(() => (
    <View style={styles.pointItem}>
      <View style={styles.pointIconContainer}>
        <SkeletonBox width={24} height={20} borderRadius={4} />
      </View>
      <View style={styles.pointInfo}>
        <SkeletonBox width="60%" height={16} marginBottom={6} />
        <SkeletonBox width="90%" height={12} marginBottom={4} />
        <SkeletonBox width="70%" height={12} />
      </View>
      <SkeletonBox width={20} height={20} borderRadius={4} />
    </View>
  ), []);

  const renderSkeletonList = useCallback(() => (
    <>
      {renderListHeader()}
      {[1, 2, 3, 4].map((item) => (
        <View key={item}>{renderSkeletonItem()}</View>
      ))}
    </>
  ), [renderListHeader, renderSkeletonItem]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#212B36" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drop-off Points</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* List */}
        {isLoading && dropOffPoints.length === 0 ? (
          <View style={styles.listContent}>
            {renderSkeletonList()}
          </View>
        ) : (
          <FlatList
          data={dropOffPoints}
          renderItem={renderDropOffPoint}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
              </View>
            ) : null
          }
          />
        )}
      </SafeAreaView>

      {/* Detail Modal - Nested inside list modal */}
      <DropOffPointDetailModal
        visible={isDetailModalVisible}
        onClose={handleCloseDetail}
        dropOffPoint={selectedPoint}
        onConfirm={handleConfirmSelection}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#212B36',
  },
  headerPlaceholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#212B36',
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  pointIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointIcon: {
    width: 24,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#3EC1EA',
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#212B36',
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '400',
    color: '#637381',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#637381',
    textAlign: 'center',
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#FF6F61',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(DropOffPointsListModal);

