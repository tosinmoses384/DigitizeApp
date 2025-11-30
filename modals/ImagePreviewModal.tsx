import React, { useEffect, useMemo, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';

interface ImagePreviewModalProps {
  isVisible: boolean;
  uri: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isVisible, uri, onClose }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [isVisible, opacity, scale]);

  const imageSource = useMemo(() => ({ uri }), [uri]);

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close image preview">
        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}> 
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={120}
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default React.memo(ImagePreviewModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    height: '70%',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});


