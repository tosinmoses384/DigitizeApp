import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CollageGestureInfoProps {
  visible?: boolean;
}

const CollageGestureInfo: React.FC<CollageGestureInfoProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Controls</Text>
      <View style={styles.row}>
        <Text style={styles.gesture}>Single tap</Text>
        <Text style={styles.action}>Select/deselect item</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Double tap</Text>
        <Text style={styles.action}>Zoom in 2x</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Two-finger double tap</Text>
        <Text style={styles.action}>Zoom to fit canvas</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Drag</Text>
        <Text style={styles.action}>Move selected item</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Pinch</Text>
        <Text style={styles.action}>Zoom item or canvas</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Rotate</Text>
        <Text style={styles.action}>Rotate selected item</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.gesture}>Long press border</Text>
        <Text style={styles.action}>Toggle resize handles</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gesture: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  action: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
});

export default CollageGestureInfo;

