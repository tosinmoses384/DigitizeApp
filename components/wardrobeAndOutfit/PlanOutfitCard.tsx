import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@hooks/use-i18n';
import ImagePreviewModal from '@modals/ImagePreviewModal';

interface WardrobeAssetRef {
  id: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  type?: 'WardrobeItem' | 'WardrobeOutfit';
}

interface OutfitData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  planDate?: string;
  wardrobeAssets?: WardrobeAssetRef[];
  wardrobeAssetIds?: string[];
}

interface PlanOutfitCardProps {
  outfit: OutfitData;
  onPress: (outfit: OutfitData) => void;
  onMenuPress: (outfit: OutfitData) => void;
  cardWidth: number;
}

const PlanOutfitCard: React.FC<PlanOutfitCardProps> = React.memo(({
  outfit,
  onPress,
  onMenuPress,
  cardWidth,
}) => {
  const { t } = useI18n();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [didLongPress, setDidLongPress] = useState(false);

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setDidLongPress(false);
  }, []);

  const handleLongPress = useCallback(() => {
    if (outfit.imageUrl) {
      setDidLongPress(true);
      setIsPreviewVisible(true);
    }
  }, [outfit.imageUrl]);

  const handlePress = useCallback(() => {
    if (didLongPress) {
      setDidLongPress(false);
      return;
    }
    onPress(outfit);
  }, [didLongPress, onPress, outfit]);

  const handleMenuPress = useCallback((e: any) => {
    e.stopPropagation();
    onMenuPress(outfit);
  }, [onMenuPress, outfit]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { width: cardWidth },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={t('wardrobe.plan.a11y.viewOutfit', { name: outfit.description || outfit.title || '' }, `View outfit ${outfit.description || outfit.title || ''}`)}
      accessibilityHint="Long press to preview image"
    >
      <View style={styles.imageContainer}>
        {outfit.imageUrl ? (
          <Image
            source={{ uri: outfit.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.placeholderImage} />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
          onPress={handleMenuPress}
          accessibilityRole="button"
          accessibilityLabel={t('wardrobe.plan.a11y.outfitOptions', undefined, 'Outfit options')}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#071827" />
        </Pressable>
      </View>

      <Text style={styles.outfitName} numberOfLines={1}>
        {outfit.description || outfit.title}
      </Text>
      <ImagePreviewModal
        isVisible={isPreviewVisible}
        onClose={handleClosePreview}
        uri={outfit.imageUrl || ''}
      />
    </Pressable>
  );
});

PlanOutfitCard.displayName = 'PlanOutfitCard';

export default PlanOutfitCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuButtonPressed: {
    opacity: 0.6,
  },
  outfitName: {
    fontSize: 14,
    fontFamily: 'DMSansMedium',
    color: '#071827',
    textTransform: 'capitalize',
  },
});

