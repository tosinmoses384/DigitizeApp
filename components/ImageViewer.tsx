import React from "react";
import {
  Modal,
  View,
  ScrollView,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

interface ImageViewerProps {
  images: string[];
  visible: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  visible,
  onClose,
  initialIndex = 0,
}) => {
  const [viewerIndex, setViewerIndex] = React.useState(initialIndex);
  const { width } = Dimensions.get("window");

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setViewerIndex(newIndex);
          }}
          contentOffset={{
            x: initialIndex * width,
            y: 0,
          }}
        >
          {images?.map((image: any, idx: number) => (
            <View
              key={idx}
              style={{
                width: width,
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{ uri: image }}
                style={{
                  width: width,
                  height: "100%",
                }}
                contentFit="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
          pointerEvents="none"
        >
          <Text style={{ color: "#fff", fontSize: 14 }}>
            {viewerIndex + 1} / {images?.length}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            padding: 10,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 18,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 14 }}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default ImageViewer;
