import CustomButton from "@components/CustomButton";
import NewBottomModal from "@components/NewBottomModal";
import StoryView from "@components/StoryComp/Stories/StoryView";
import { SIZES } from "@constants/Colors";
import React, { useRef } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, Animated, SafeAreaView } from "react-native";
import { View } from "react-native";
import { PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import CloseIcon from "../assets/images/svg/x-close.svg";
interface IImageViewModal {
  isShow: boolean;
  onClose: any;
  uri: string;
}

const ImageViewModal = ({ isShow, onClose, uri }: IImageViewModal) => {
  // Animation values for pinch-to-zoom
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  
  // For gesture handling
  const baseScale = useRef(1);
  const lastScale = useRef(1);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  React.useEffect(() => {
    if (isShow) {
      // Reset zoom state when modal opens
      lastScale.current = 1;
      baseScale.current = 1;
      offsetX.current = 0;
      offsetY.current = 0;
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      hintOpacity.setValue(1);
      
      // Hide hint after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(hintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isShow]);

  const onPinchGestureEvent = (event: any) => {
    scale.setValue(baseScale.current * event.nativeEvent.scale);
  };

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current *= event.nativeEvent.scale;
      baseScale.current = lastScale.current;
      
      // Reset if zoomed out too much
      if (lastScale.current < 1) {
        lastScale.current = 1;
        baseScale.current = 1;
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
      
      // Limit maximum zoom
      if (lastScale.current > 4) {
        lastScale.current = 4;
        baseScale.current = 4;
        Animated.spring(scale, {
          toValue: 4,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const onPanGestureEvent = (event: any) => {
    translateX.setValue(offsetX.current + event.nativeEvent.translationX);
    translateY.setValue(offsetY.current + event.nativeEvent.translationY);
  };

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      offsetX.current += event.nativeEvent.translationX;
      offsetY.current += event.nativeEvent.translationY;
    }
  };

  const onDoubleTap = () => {
    const isZoomed = lastScale.current > 1;
    
    if (isZoomed) {
      // Reset zoom
      lastScale.current = 1;
      baseScale.current = 1;
      offsetX.current = 0;
      offsetY.current = 0;
      
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateX.setOffset(0);
        translateY.setOffset(0);
      });
    } else {
      // Zoom in
      lastScale.current = 2;
      baseScale.current = 2;
      
      Animated.spring(scale, {
        toValue: 2,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <NewBottomModal
      isShow={isShow}
      onClose={onClose}
      maxHeight={"100%"}
      contentStyle={{
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 0,
        width: "100%", // Or a specific width (e.g., '80%')
        flex: 1,
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <Pressable
            style={({ pressed }) => [
              styles.headerCloseIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
          
          <Animated.View style={[styles.zoomHint, { opacity: hintOpacity }]}>
            <Text style={styles.zoomHintText}>🔍 Pinch to zoom • Double tap</Text>
          </Animated.View>
          
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
            minPointers={1}
            maxPointers={1}
            avgTouches
          >
            <Animated.View style={{ flex: 1 }}>
              <PinchGestureHandler
                onGestureEvent={onPinchGestureEvent}
                onHandlerStateChange={onPinchHandlerStateChange}
              >
                <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Pressable onPress={onDoubleTap}>
                    <Animated.Image
                      source={{ uri: uri }}
                      style={[
                        styles.zoomableImage,
                        {
                          transform: [
                            { scale: scale },
                            { translateX: translateX },
                            { translateY: translateY },
                          ],
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </Pressable>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </SafeAreaView>
    </NewBottomModal>
  );
};

export default ImageViewModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fefc",
  },
  body: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCloseIcon: {
    position: "absolute",
    top: 16,
    right: 30,
    zIndex: 1,
  },
  zoomableImage: {
    width: SIZES.width - 32,
    height: SIZES.height * 0.7,
  },
  zoomHint: {
    position: "absolute",
    bottom: "10%",
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    marginHorizontal: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  zoomHintText: {
    color: "white",
    fontSize: 12,
    fontFamily: "DMSansRegular",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.5,
  },
});
