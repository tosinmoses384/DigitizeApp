import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface ItemImagesProps {
  isBundle: boolean;
  itemImageUrl?: string;
  bundleItems?: Array<{ itemDefaultImageUrl: string }>;
}

const ItemImages = React.memo(({
  isBundle,
  itemImageUrl,
  bundleItems,
}: ItemImagesProps) => {
  if (isBundle && bundleItems) {
    return (
      <View style={styles.bundleContainer}>
        {bundleItems.map((item, index: number) => (
          <View key={index} style={styles.bundleItem}>
            <Image
              source={{ uri: item.itemDefaultImageUrl }}
              style={styles.bundleImage}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.singleContainer}>
      <View style={styles.singleImageView}>
        {itemImageUrl && (
          <Image
            source={{ uri: itemImageUrl }}
            style={styles.singleImage}
          />
        )}
      </View>
    </View>
  );
});

ItemImages.displayName = 'ItemImages';

const styles = StyleSheet.create({
  singleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  singleImageView: {
    width: 80,
    height: 80,
    backgroundColor: 'silver',
    borderRadius: 2,
    marginBottom: 16,
  },
  singleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  bundleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  bundleItem: {
    width: 80,
    height: 80,
    backgroundColor: '#E9EAEB',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  bundleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});

export default ItemImages;
