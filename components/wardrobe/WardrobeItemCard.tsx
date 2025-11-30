import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import RecommendedCard from '@components/RecommendedCard';
import { TaggedItem } from '../../redux/slice/outfit-edit-details/outfitEditDetailsSlice';

interface WardrobeItemCardProps {
  item: any;
  index: number;
  cardWidth: number;
  isTagItem?: boolean;
  isItemTagged: boolean;
  onPress: () => void;
}

const WardrobeItemCard = React.memo<WardrobeItemCardProps>(({
  item,
  index,
  cardWidth,
  isTagItem,
  isItemTagged,
  onPress,
}) => {
  const isLeft = index % 2 === 0;

  if (item.isSkeleton) {
    return (
      <View
        style={[
          styles.card,
          isLeft ? styles.cardLeft : styles.cardRight,
          { width: cardWidth },
        ]}
      >
        <RecommendedCard
          imageSource=""
          size=""
          title=""
          price=""
          width="100%"
          marginRight={0}
          isServerImage
          itemId=""
          loader
        />
      </View>
    );
  }

  return (
    <Pressable
      style={[
        styles.card,
        isLeft ? styles.cardLeft : styles.cardRight,
        {
          width: cardWidth,
          borderWidth: isTagItem && isItemTagged ? 1 : 0,
          borderColor: isTagItem && isItemTagged ? '#FFD8DB' : 'white',
          backgroundColor: isTagItem && isItemTagged ? '#FFEBED' : 'white',
          padding: isTagItem && isItemTagged ? 3 : 0,
        },
      ]}
      onPress={onPress}
    >
      <RecommendedCard
        isServerImage
        title={item?.brandName}
        imageSource={item?.itemDefaultImageUrl || item?.itemImageUrls?.[0]}
        width="100%"
        marginRight={0}
        isHidefavourite
        onPress={onPress}
      />
    </Pressable>
  );
});

WardrobeItemCard.displayName = 'WardrobeItemCard';

export default WardrobeItemCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    position: 'relative',
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
});

