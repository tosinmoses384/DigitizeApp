import React, { memo } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

interface FollowButtonProps {
  isFollowing?: boolean;
  onPress?: () => void;
  loading?: boolean;
}

const FollowButton = memo(({ isFollowing = false, onPress, loading = false }: FollowButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={styles.addToCart}>
      <View style={[
        styles.addToCart2, 
        isFollowing && styles.followingState
      ]}>
        <Text style={[
          styles.follow, 
          isFollowing && styles.followingText
        ]}>
          {loading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

FollowButton.displayName = 'FollowButton';

export default FollowButton;

const styles = StyleSheet.create({
  addToCart: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addToCart2: {
    borderRadius: 12,
    borderStyle: "solid",
    borderColor: "#ff3b4a",
    borderWidth: 1,
    backgroundColor: "#ffffff",
    height: 32,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 70,
  },
  follow: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "DMSans-Regular",
    color: "#ff3b4a",
    textAlign: "center",
    fontWeight: "500",
  },
  followingState: {
    backgroundColor: "#ff3b4a",
  },
  followingText: {
    color: "#ffffff",
  },
});
