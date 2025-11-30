import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { TaggedItem } from '../../redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import TagIcon from '../../assets/images/svg/tag-icon.svg';

interface TaggedItemsDisplayProps {
  taggedItems: TaggedItem[];
  onPress: () => void;
  maxVisibleThumbnails?: number;
  showCount?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const TaggedItemsDisplay: React.FC<TaggedItemsDisplayProps> = ({
  taggedItems,
  onPress,
  maxVisibleThumbnails = 3,
  showCount = true,
}) => {
  const itemCount = taggedItems.length;

  const getCountText = () => {
    if (itemCount === 0) return '';
    if (itemCount === 1) return '1 item tagged';
    if (itemCount <= 9) return `${itemCount} items tagged`;
    return '9+ items tagged';
  };

  const renderThumbnail = (item: TaggedItem, index: number) => {
    return (
      <View key={item.id} style={styles.thumbnailContainer}>
        <Image
          style={styles.thumbnail}
          resizeMode="cover"
          source={{ uri: item.imageUrl }}
        />
      </View>
    );
  };

  if (itemCount === 0) {
    // Show "Tag an Item" state - matches Figma empty state
    return (
      <Pressable style={styles.button} onPress={onPress}>
        <TagIcon style={styles.tagIcon} width={22} height={22} />
        <Text style={styles.tagAnItem}>Tag an Item</Text>
      </Pressable>
    );
  }

  // Show tagged items state - matches Figma with items state
  return (
    <Pressable style={styles.support} onPress={onPress}>
      <View style={styles.tag}>
        <TagIcon style={[styles.icon, styles.iconLayout]} />
      </View>
      {itemCount > 0 && (
        <View style={styles.thumbnailsContainer}>
          {taggedItems.slice(0, 1).map((item, index) => renderThumbnail(item, index))}
        </View>
      )}
      {showCount && itemCount > 0 && (
        <Text style={[styles.itemsTagged, styles.requestCallTypo]}>{getCountText()}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Empty state styles (matches Figma Button1)
  button: {
    boxShadow: "0px 3.281250238418579px 21.88px rgba(2, 2, 2, 0.31)",
    shadowColor: "rgba(2, 2, 2, 0.31)",
    shadowOffset: {
      width: 0,
      height: 3.281250238418579
    },
    shadowRadius: 21.88,
    elevation: 21.88,
    shadowOpacity: 1,
    backgroundColor: "#f6f7f7",
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: 10
  },
  tagIcon: {
    width: 22,
    height: 22
  },
  tagAnItem: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#464f5d",
    textAlign: "left"
  },

  // Items state styles (matches Figma Support)
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  },
  requestCallTypo: {
    textAlign: "left",
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 20,
    fontSize: 13
  },
  support: {
    boxShadow: "0px 3.281250238418579px 21.88px rgba(2, 2, 2, 0.31)",
    shadowColor: "rgba(2, 2, 2, 0.31)",
    shadowOffset: {
      width: 0,
      height: 3.281250238418579
    },
    shadowRadius: 21.88,
    elevation: 21.88,
    backgroundColor: "#f6f7f7",
    borderStyle: "solid",
    borderColor: "#fff",
    borderWidth: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 6,
    shadowOpacity: 1,
    alignSelf: "flex-start",
    borderRadius: 10
  },
  tag: {
    width: 22,
    height: 22,
    overflow: "hidden"
  },
  icon: {
    height: "79.72%",
    width: "79.72%",
    top: "8.32%",
    right: "11.96%",
    bottom: "11.96%",
    left: "8.32%",
    position: "absolute"
  },
  thumbnailsContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  thumbnailContainer: {
    position: "relative"
  },
  thumbnail: {
    width: 24,
    height: 28,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff"
  },
  itemsTagged: {
    color: "#464f5d"
  }
});

export default TaggedItemsDisplay;
