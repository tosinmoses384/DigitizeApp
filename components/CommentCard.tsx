import { getInitials } from "@helper/getInitials";
import moment from "moment";
import React from "react";
import { StyleSheet, Text, View, Pressable, Image, Dimensions } from "react-native";
import LineLoader from "./LineLoader";
import { capitalizeFirstLetter } from "@helper/capitalize-first-letter";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import ReplyIcon from "../assets/images/svg/reply.svg"; // Assuming you have this or similar, otherwise I'll use text or a default icon

interface ICommentCard {
  name: string;
  time: string;
  imageUrl: string;
  comment: string;
  loading?: boolean;
  handleReply?: any;
  hideViewReply?: boolean;
  onLike?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;

const CommentCard = ({
  name,
  time,
  imageUrl,
  comment,
  loading,
  handleReply,
  hideViewReply,
  onLike,
}: ICommentCard) => {
  const translateX = useSharedValue(0);
  const isReplying = useSharedValue(false);

  const showHeart = useSharedValue(0);

  const triggerReply = () => {
    if (handleReply) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleReply();
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Prevent accidental swipes while scrolling vertically
    .onUpdate((event) => {
      // Only allow swiping right
      if (event.translationX > 0 && !hideViewReply && !loading) {
        translateX.value = event.translationX;
        if (event.translationX > SWIPE_THRESHOLD && !isReplying.value) {
          isReplying.value = true;
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else if (event.translationX <= SWIPE_THRESHOLD && isReplying.value) {
          isReplying.value = false;
        }
      }
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(triggerReply)();
      }
      translateX.value = withSpring(0);
      isReplying.value = false;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (onLike) {
        runOnJS(onLike)();
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        showHeart.value = withSpring(1, undefined, (finished) => {
          if (finished) {
            showHeart.value = withTiming(0, { duration: 500 });
          }
        });
      }
    });

  const composedGesture = Gesture.Race(panGesture, doubleTapGesture);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1.2],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
      left: -40, // Position it off-screen to the left initially
      position: "absolute",
      justifyContent: "center",
      height: "100%",
    };
  });

  const rHeartStyle = useAnimatedStyle(() => {
    return {
      opacity: showHeart.value,
      transform: [{ scale: Math.max(0, showHeart.value) }],
      position: "absolute",
      alignSelf: "center",
      top: "20%",
      zIndex: 999,
    };
  });

  if (loading) {
    return (
      <View style={[styles.wrapper, hideViewReply && { marginBottom: 8 }]}>
        <View style={styles.userAvater}>
          <View style={{ width: "100%", height: "100%", borderRadius: 36, backgroundColor: "#edf2f7" }} />
        </View>
        <View style={styles.contents}>
          <View style={{ width: "90%", height: 15, marginBottom: 8 }}>
            <LineLoader />
          </View>
          <View style={{ width: "60%", height: 15 }}>
            <LineLoader />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Animated.View style={rIconStyle}>
          {/* Replace with your Reply Icon SVG */}
          <Text style={{ fontSize: 20 }}>↩️</Text>
        </Animated.View>
      </View>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.wrapper, hideViewReply && { marginBottom: 8 }, rStyle]}>
          <Animated.View style={rHeartStyle}>
            <Text style={{ fontSize: 40 }}>❤️</Text>
          </Animated.View>
          <View style={styles.userAvater}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: "100%", height: "100%", borderRadius: 36 }}
              />
            ) : (
              <Text>{getInitials(name)}</Text>
            )}
          </View>
          <View style={styles.contents}>
            <View style={styles.userNameAndTime}>
              <Text style={styles.userName}>{name || "**********"}</Text>
              <Text style={styles.time}>{moment(time).fromNow() || "*****"}</Text>
            </View>

            <Text style={styles.comment}>
              {capitalizeFirstLetter(comment?.trim() || "")}
            </Text>

            {!hideViewReply && (
              <Pressable
                style={({ pressed }) => [pressed && styles.pressed]}
                onPress={handleReply}
              >
                <Text style={styles.replyText}>Reply</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default CommentCard;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 20,
    zIndex: -1,
    height: '100%',
    justifyContent: 'center',
  },
  wrapper: {
    flexDirection: "row",
    backgroundColor: 'white', // Ensure background is opaque for sliding
  },
  contents: {
    flex: 1,
  },
  userAvater: {
    width: 36,
    height: 36,
    backgroundColor: "#edf2f7",
    borderRadius: 35,
    marginRight: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  userNameAndTime: {
    flexDirection: "row",
    marginBottom: 1,
  },
  userName: {
    fontSize: 12,
    color: "#07090c",
    flex: 1,
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  time: {
    fontSize: 12,
    color: "#A0B1C0",
  },
  comment: {
    fontSize: 10,
    color: "#07090c",
    marginBottom: 5,
  },
  reply: {},
  replyText: {
    fontSize: 10,
    color: "#90959E",
  },
  pressed: {
    opacity: 0.5,
  },
});
