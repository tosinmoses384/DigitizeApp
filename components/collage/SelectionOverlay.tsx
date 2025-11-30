import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { CollageBounds } from '../../types/collage';

interface SelectionOverlayProps {
  bounds: CollageBounds | null;
  visible: boolean;
  canDelete: boolean;
  canBringToFront: boolean;
  canSendToBack: boolean;
  canLock: boolean;
  isLocked: boolean;
  onDelete?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onToggleLock?: () => void;
  onResizeHandlePress?: (handle: string) => void;
}

const HANDLE_SIZE = 44;
const HANDLE_VISUAL_SIZE = 20;
const ACTION_BUTTON_SIZE = 36;

const SelectionOverlay: React.FC<SelectionOverlayProps> = React.memo(({
  bounds,
  visible,
  canDelete,
  canBringToFront,
  canSendToBack,
  canLock,
  isLocked,
  onDelete,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onResizeHandlePress,
}) => {
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!bounds || !visible) {
      return {
        opacity: withTiming(0, { duration: 100 }),
        transform: [{ scale: withSpring(0.9) }],
      };
    }

    return {
      opacity: withTiming(1, { duration: 100 }),
      transform: [{ scale: withSpring(1) }],
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }, [bounds, visible]);

  const handleDeletePress = useCallback(() => {
    if (onDelete && canDelete) {
      onDelete();
    }
  }, [onDelete, canDelete]);

  const handleBringToFrontPress = useCallback(() => {
    if (onBringToFront && canBringToFront) {
      onBringToFront();
    }
  }, [onBringToFront, canBringToFront]);

  const handleSendToBackPress = useCallback(() => {
    if (onSendToBack && canSendToBack) {
      onSendToBack();
    }
  }, [onSendToBack, canSendToBack]);

  const handleToggleLockPress = useCallback(() => {
    if (onToggleLock && canLock) {
      onToggleLock();
    }
  }, [onToggleLock, canLock]);

  const handleResizePress = useCallback((position: string) => {
    if (onResizeHandlePress) {
      onResizeHandlePress(position);
    }
  }, [onResizeHandlePress]);

  if (!bounds || !visible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, animatedContainerStyle]}
      pointerEvents="box-none"
    >
      <View style={styles.dashedBorder} pointerEvents="none">
        <View style={styles.dashedTop} />
        <View style={styles.dashedRight} />
        <View style={styles.dashedBottom} />
        <View style={styles.dashedLeft} />
      </View>

      <View style={styles.resizeHandlesContainer} pointerEvents="box-none">
        <Pressable
          style={[styles.resizeHandle, styles.topLeft]}
          onPress={() => handleResizePress('top-left')}
          accessibilityRole="button"
          accessibilityLabel="Resize top-left corner"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.topRight]}
          onPress={() => handleResizePress('top-right')}
          accessibilityRole="button"
          accessibilityLabel="Resize top-right corner"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.bottomLeft]}
          onPress={() => handleResizePress('bottom-left')}
          accessibilityRole="button"
          accessibilityLabel="Resize bottom-left corner"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.bottomRight]}
          onPress={() => handleResizePress('bottom-right')}
          accessibilityRole="button"
          accessibilityLabel="Resize bottom-right corner"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.topCenter]}
          onPress={() => handleResizePress('top')}
          accessibilityRole="button"
          accessibilityLabel="Resize top edge"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.bottomCenter]}
          onPress={() => handleResizePress('bottom')}
          accessibilityRole="button"
          accessibilityLabel="Resize bottom edge"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.leftCenter]}
          onPress={() => handleResizePress('left')}
          accessibilityRole="button"
          accessibilityLabel="Resize left edge"
        >
          <View style={styles.handleVisual} />
        </Pressable>

        <Pressable
          style={[styles.resizeHandle, styles.rightCenter]}
          onPress={() => handleResizePress('right')}
          accessibilityRole="button"
          accessibilityLabel="Resize right edge"
        >
          <View style={styles.handleVisual} />
        </Pressable>
      </View>

      <View style={styles.actionsContainer} pointerEvents="box-none">
        {canDelete && (
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
            accessibilityRole="button"
            accessibilityLabel="Delete selected item"
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </Pressable>
        )}

        {canLock && (
          <Pressable
            style={[styles.actionButton, styles.lockButton]}
            onPress={handleToggleLockPress}
            accessibilityRole="button"
            accessibilityLabel={isLocked ? 'Unlock item' : 'Lock item'}
          >
            <Ionicons
              name={isLocked ? 'lock-closed' : 'lock-open-outline'}
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        )}

        {canBringToFront && (
          <Pressable
            style={[styles.actionButton, styles.layerButton]}
            onPress={handleBringToFrontPress}
            accessibilityRole="button"
            accessibilityLabel="Bring to front"
          >
            <Ionicons name="arrow-up-outline" size={18} color="#FFFFFF" />
          </Pressable>
        )}

        {canSendToBack && (
          <Pressable
            style={[styles.actionButton, styles.layerButton]}
            onPress={handleSendToBackPress}
            accessibilityRole="button"
            accessibilityLabel="Send to back"
          >
            <Ionicons name="arrow-down-outline" size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
});

SelectionOverlay.displayName = 'SelectionOverlay';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'box-none',
  },
  dashedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  dashedTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF3B4A',
    opacity: 0.8,
  },
  dashedRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF3B4A',
    opacity: 0.8,
  },
  dashedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF3B4A',
    opacity: 0.8,
  },
  dashedLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF3B4A',
    opacity: 0.8,
  },
  resizeHandlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  resizeHandle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleVisual: {
    width: HANDLE_VISUAL_SIZE,
    height: HANDLE_VISUAL_SIZE,
    borderRadius: HANDLE_VISUAL_SIZE / 2,
    backgroundColor: '#FF3B4A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  topRight: {
    top: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
  bottomLeft: {
    bottom: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  bottomRight: {
    bottom: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
  topCenter: {
    top: -HANDLE_SIZE / 2,
    left: '50%',
    marginLeft: -HANDLE_SIZE / 2,
  },
  bottomCenter: {
    bottom: -HANDLE_SIZE / 2,
    left: '50%',
    marginLeft: -HANDLE_SIZE / 2,
  },
  leftCenter: {
    top: '50%',
    left: -HANDLE_SIZE / 2,
    marginTop: -HANDLE_SIZE / 2,
  },
  rightCenter: {
    top: '50%',
    right: -HANDLE_SIZE / 2,
    marginTop: -HANDLE_SIZE / 2,
  },
  actionsContainer: {
    position: 'absolute',
    top: -ACTION_BUTTON_SIZE - 8,
    right: 0,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B4A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B4A',
  },
  lockButton: {
    backgroundColor: '#6B7280',
  },
  layerButton: {
    backgroundColor: '#3B82F6',
  },
});

export default SelectionOverlay;

