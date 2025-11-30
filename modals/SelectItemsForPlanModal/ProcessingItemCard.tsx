import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@hooks/use-i18n';

export type ItemProcessingStatus = 'waiting' | 'processing' | 'success' | 'original' | 'skipped';

interface ProcessingItemCardProps {
  itemName: string;
  imageUrl: string;
  status: ItemProcessingStatus;
}

const ProcessingItemCard = React.memo<ProcessingItemCardProps>(
  ({ itemName, imageUrl, status }) => {
    const { t } = useI18n();
    const getStatusIcon = () => {
      switch (status) {
        case 'waiting':
          return (
            <View style={[styles.statusIcon, styles.statusWaiting]}>
              <Ionicons name="time-outline" size={16} color="#90959E" />
            </View>
          );
        case 'processing':
          return (
            <View style={[styles.statusIcon, styles.statusProcessing]}>
              <ActivityIndicator size="small" color="#4A90E2" />
            </View>
          );
        case 'success':
          return (
            <View style={[styles.statusIcon, styles.statusSuccess]}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            </View>
          );
        case 'original':
          return (
            <View style={[styles.statusIcon, styles.statusOriginal]}>
              <Ionicons name="alert-circle" size={20} color="#FF9500" />
            </View>
          );
        case 'skipped':
          return (
            <View style={[styles.statusIcon, styles.statusSkipped]}>
              <Ionicons name="close-circle" size={20} color="#FF3B4A" />
            </View>
          );
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'waiting':
          return t('wardrobe.plan.status.waiting', undefined, 'Waiting...');
        case 'processing':
          return t('wardrobe.plan.status.processing', undefined, 'Processing...');
        case 'success':
          return t('wardrobe.plan.status.success', undefined, 'Background removed');
        case 'original':
          return t('wardrobe.plan.status.original', undefined, 'Using original image');
        case 'skipped':
          return t('wardrobe.plan.status.skipped', undefined, 'No image available');
      }
    };

    const getStatusTextColor = () => {
      switch (status) {
        case 'waiting':
          return '#90959E';
        case 'processing':
          return '#4A90E2';
        case 'success':
          return '#34C759';
        case 'original':
          return '#FF9500';
        case 'skipped':
          return '#FF3B4A';
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.thumbnailContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.thumbnail, styles.noImage]}>
              <Ionicons name="image-outline" size={24} color="#D1D5DB" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.itemName} numberOfLines={1}>
            {itemName}
          </Text>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text
              style={[styles.statusText, { color: getStatusTextColor() }]}
              numberOfLines={1}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

ProcessingItemCard.displayName = 'ProcessingItemCard';

export default ProcessingItemCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'DMSansMedium',
    color: '#071827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusWaiting: {
    width: 20,
    height: 20,
  },
  statusProcessing: {
    width: 20,
    height: 20,
  },
  statusSuccess: {
    width: 20,
    height: 20,
  },
  statusOriginal: {
    width: 20,
    height: 20,
  },
  statusSkipped: {
    width: 20,
    height: 20,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'DMSansRegular',
  },
});

