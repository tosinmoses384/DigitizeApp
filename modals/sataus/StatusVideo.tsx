import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Alert,
  NativeEventEmitter,
  NativeModules,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Video, AVPlaybackStatus } from "expo-av";
import * as Progress from "react-native-progress";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");

interface IStatusVideo {
  videoUri: any;
  isPause: boolean;
  setPlayBack: any;
}

const StatusVideo = async ({
  videoUri,
  isPause,
  setPlayBack,
}: IStatusVideo) => {
  const videoRef: any = useRef(null);
  const handlePlaybackStatusUpdate = async (status: any) => {
    if (status.didJustFinish && videoRef.current) {
      ("Video finished, restarting...");
      // setPlayBack?.();
      await videoRef.current.setPositionAsync(0); // Reset video position
      await videoRef.current.playAsync(); // Restart playback
    }
  };

  return (
    <View style={{ flex: 1, maxHeight: "80%", backgroundColor: "black" }}>
      <Video
        ref={videoRef}
        useNativeControls={false}
        // useNativeControls
        resizeMode="contain"
        source={{ uri: videoUri }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        shouldPlay={isPause}
      />
    </View>
  );
};

export default StatusVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  pickButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    marginBottom: 20,
  },
  videoContainer: {
    width: width * 0.9,
    height: width * 0.9 * (9 / 16),
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  timelineContainer: {
    width: width * 0.9,
    height: 60,
    marginBottom: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  sliderContainer: {
    width: width * 0.9,
    marginBottom: 20,
  },
  slider: {
    width: "100%",
  },
  trimControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width * 0.9,
  },
});
