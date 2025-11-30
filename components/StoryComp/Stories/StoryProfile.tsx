import React, { useCallback } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageErrorEventData, NativeSyntheticEvent } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface IStoryProfile {
  outlineColor: string;
  displayName: string;
  imageUrl: string;
  onPressWrapper: () => void;
  onLongPressWrapper?: () => void;
  storyCount: number;
  isViewed?: (index: number) => boolean;
  stories: Array<{ isViewed: boolean;[key: string]: any }>;
  isUserStories?: boolean;
}

const StoryProfile = React.memo(({
  outlineColor,
  displayName,
  imageUrl,
  onPressWrapper,
  onLongPressWrapper,
  storyCount,
  isViewed,
  isUserStories,
  stories,
}: IStoryProfile) => {
  const radius = 25;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;

  // Handle image loading errors
  const handleImageError = useCallback((error: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (__DEV__) {
      console.warn('Story profile image failed to load:', error.nativeEvent.error);
    }
  }, []);

  // Calculate the number of viewed stories
  // const viewedCount = Array.from({ length: storyCount }).filter(
  //   (_, index) => isViewed && isViewed(index)
  // ).length;
  const viewedCount = stories.filter((story: any) => story.isViewed).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPressWrapper}
        onLongPress={onLongPressWrapper}
        accessibilityLabel={`View ${displayName}'s story`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view story"
      >
        <View style={[styles.imageContainer]}>
          <Svg
            width={54}
            height={54}
            viewBox={`0 0 54 54`}
            style={styles.svgStyle}
          >
            <G rotation="-90" origin="27,27">
              {/* Base segmented outline */}
              <Circle
                cx={27}
                cy={27}
                r={radius}
                stroke={outlineColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference / storyCount - 1}, 1`}
                fill="none"
              />
              {/* Viewed segments overlay */}
              {viewedCount > 0 && !isUserStories && (
                <Circle
                  cx={27}
                  cy={27}
                  r={radius}
                  stroke="#808080"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${(circumference / storyCount) * viewedCount
                    }, ${circumference}`}
                  fill="none"
                />
              )}
            </G>
          </Svg>
          {imageUrl && (
            <View style={styles.profileImageWrapper}>
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.profileImage}
                resizeMode="stretch"
                onError={handleImageError}
                accessibilityLabel={`${displayName}'s profile picture`}
                accessibilityRole="image"
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
        {displayName}
      </Text>
    </View>
  );
});

StoryProfile.displayName = 'StoryProfile';

export default StoryProfile;

const styles = StyleSheet.create({
  container: {
    width: 54,
    marginRight: 16,
    alignItems: "center",
  },
  imageContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 0, // Remove the image container's border
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: 0,
  },
  svgStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  profileImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    position: "absolute",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  nameText: {
    marginTop: 5,
    fontSize: 10,
    textAlign: "center",
    color: "#212C3D",
    textTransform: "capitalize",
  },
  plusIconContainer: {
    position: "absolute",
    bottom: -5,
    right: 0,
    backgroundColor: "white",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  plusIcon: {
    color: "#D4313E",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: -2,
  },
});
