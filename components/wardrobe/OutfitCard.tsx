import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import RecommendedCard from '@components/RecommendedCard';

interface OutfitCardProps {
  item: any;
  index: number;
  cardWidth: number;
  onPress: () => void;
}

const OutfitCard = React.memo<OutfitCardProps>(({
  item,
  index,
  cardWidth,
  onPress,
}) => {
  const isLeft = index % 2 === 0;

  if (item.isSkeleton) {
    return (
      <Pressable
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
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.card,
        isLeft ? styles.cardLeft : styles.cardRight,
        { width: cardWidth },
      ]}
      onPress={onPress}
    >
      <RecommendedCard
        isServerImage
        title={item?.title}
        imageSource={item?.imageUrl}
        width="100%"
        marginRight={0}
        imageBackground={styles.cardBackgroundForOutfitImage}
        isHidefavourite
        onPress={onPress}
      />
    </Pressable>
  );
});

OutfitCard.displayName = 'OutfitCard';

export default OutfitCard;

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
  cardBackgroundForOutfitImage: {
    backgroundColor: 'white',
    objectFit: 'contain',
  },
});

