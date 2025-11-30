import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps {
  id: string;
  imageUrl: string;
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const ItemCard = React.memo<ItemCardProps>(
  ({ id, imageUrl, title, isSelected, onPress }) => {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isSelected ? 'selected' : 'not selected'}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            priority="normal"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.title === nextProps.title
      // onPress is always recreated but shouldn't cause re-render
    );
  },
);

ItemCard.displayName = 'ItemCard';

export default ItemCard;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 2,
    shadowOpacity: 1,
  },
  selectedContainer: {
    borderWidth: 1,
    borderColor: '#FFD8DB',
    backgroundColor: '#FFEBED',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F6F7F7',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 59, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 3,
    shadowOpacity: 1,
  },
  titleContainer: {
    padding: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: 'DMSansMedium',
    color: '#07090C',
  },
});
