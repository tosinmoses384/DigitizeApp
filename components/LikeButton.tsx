import React, { memo, useCallback, useState, useEffect } from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Image } from "expo-image";
import { useToast } from "react-native-toast-notifications";
import { likeService, LikeState } from "@services/likeService";

export interface LikeButtonProps {
  postId: string;
  initialLikeState: LikeState;
  onStateChange?: (postId: string, newState: LikeState) => void;
  onLikeCountPress?: () => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  textStyle?: TextStyle;
  showCount?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * Reusable LikeButton component with optimistic updates
 * Handles all like/unlike logic internally using likeService
 * Following coding guide sections 4 (component design) and 9 (accessibility)
 */
const LikeButton: React.FC<LikeButtonProps> = memo(({
  postId,
  initialLikeState,
  onStateChange,
  onLikeCountPress,
  style,
  iconStyle,
  textStyle,
  showCount = true,
  disabled = false,
  accessibilityLabel,
}) => {
  const toast = useToast();
  const [likeState, setLikeState] = useState<LikeState>(initialLikeState);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setLikeState(initialLikeState);
    // Initialize service state
    likeService.updateState(postId, initialLikeState);
  }, [initialLikeState, postId]);

  const handleStateChange = useCallback((postId: string, newState: LikeState) => {
    setLikeState(newState);
    onStateChange?.(postId, newState);
  }, [onStateChange]);

  const handleLikePress = useCallback(async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    await likeService.toggleLike({
      postId,
      currentState: likeState, // Use current component state, not stale props
      onStateChange: handleStateChange,
      toast,
    });
    
    setIsProcessing(false);
  }, [disabled, isProcessing, postId, likeState, handleStateChange, toast]);

  const handleCountPress = useCallback(() => {
    if (onLikeCountPress) {
      onLikeCountPress();
    }
  }, [onLikeCountPress]);

  const likeIcon = likeState.isLiked
    ? require("../assets/images/svg/like2.png")
    : require("../assets/images/svg/like.png");

  const defaultAccessibilityLabel = likeState.isLiked 
    ? `Unlike post, ${likeState.likesCount} likes`
    : `Like post, ${likeState.likesCount} likes`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        style,
        pressed && styles.pressed,
        (disabled || isProcessing) && styles.disabled,
      ]}
      onPress={handleLikePress}
      disabled={disabled || isProcessing}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityState={{
        selected: likeState.isLiked,
        disabled: disabled || isProcessing,
      }}
    >
      <Image
        source={likeIcon}
        style={[styles.icon, iconStyle]}
        contentFit="contain"
      />
      
      {showCount && (
        <Pressable onPress={handleCountPress} disabled={!onLikeCountPress}>
          <Text 
            style={[styles.countText, textStyle]}
            accessibilityRole="text"
            accessibilityLabel={`${likeState.likesCount} likes`}
          >
            {likeState.likesCount}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
});

LikeButton.displayName = "LikeButton";

export default LikeButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  icon: {
    width: 29,
    height: 29,
  },
  countText: {
    fontSize: 12,
    color: "#212C3D",
    fontFamily: "DMSansMedium",
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.5,
  },
  disabled: {
    opacity: 0.3,
  },
});
