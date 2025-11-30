import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { CollageBounds } from '../../types/collage';
import type { SharedValue } from 'react-native-reanimated';

interface SelectionOverlayEnhancedProps {
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
  onLongPress?: () => void;
  // New props for enhanced functionality
  interactionMode: 'none' | 'transform-layer' | 'transform-stage' | 'resize';
  showResizeHandles?: boolean;
  activeLayerTransforms?: SharedValue<Record<string, number[]>>;
  stageTransformShared?: {
    scale: SharedValue<number>;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
  };
  selectedLayerIds?: string[];
}

// Touch target sizes following platform guidelines
const HANDLE_SIZE = 44; // iOS minimum touch target
const HANDLE_VISUAL_SIZE = 20;
const ACTION_BUTTON_SIZE = 48; // Material Design minimum
const ACTION_BUTTON_VISUAL_SIZE = 36;
const TOOLBAR_OFFSET = 16; // Offset from edges

const SelectionOverlayEnhanced: React.FC<SelectionOverlayEnhancedProps> = React.memo(({
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
  onLongPress,
  interactionMode,
  showResizeHandles = false,
  activeLayerTransforms,
  stageTransformShared,
  selectedLayerIds = [],
}) => {
  const [showModeChip, setShowModeChip] = useState(false);
  const [modeText, setModeText] = useState('');
  const [isResizeMode, setIsResizeMode] = useState(false);
  
  // Track if we're currently transforming
  const isTransforming = interactionMode === 'transform-layer' || interactionMode === 'transform-stage';
  
  // Determine if we should show resize handles
  const shouldShowResizeHandles = isResizeMode && !isTransforming && showResizeHandles;

  // Show mode awareness chip when interaction mode changes
  useEffect(() => {
    let newModeText = '';
    if (interactionMode === 'transform-layer') {
      newModeText = 'Editing item';
    } else if (interactionMode === 'transform-stage') {
      newModeText = 'Editing canvas';
    } else if (visible && interactionMode === 'none') {
      newModeText = 'Item selected';
    }

    if (newModeText) {
      setModeText(newModeText);
      setShowModeChip(true);
      
      // Fade out after 1.2 seconds
      const timer = setTimeout(() => {
        setShowModeChip(false);
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [interactionMode, visible]);

  // Animated style for container visibility
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!bounds || !visible) {
      return {
        opacity: withTiming(0, { duration: 100 }),
        transform: [{ scale: withSpring(0.9) }],
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }

    return {
      opacity: withTiming(1, { duration: 150 }),
      transform: [{ scale: withSpring(1) }],
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }, [bounds, visible]);

  const handleDeletePress = useCallback(() => {
    if (onDelete && canDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDelete();
    }
  }, [onDelete, canDelete]);

  const handleBringToFrontPress = useCallback(() => {
    if (onBringToFront && canBringToFront) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onBringToFront();
    }
  }, [onBringToFront, canBringToFront]);

  const handleSendToBackPress = useCallback(() => {
    if (onSendToBack && canSendToBack) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSendToBack();
    }
  }, [onSendToBack, canSendToBack]);

  const handleToggleLockPress = useCallback(() => {
    if (onToggleLock && canLock) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggleLock();
    }
  }, [onToggleLock, canLock]);

  const handleResizePress = useCallback((position: string) => {
    if (onResizeHandlePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onResizeHandlePress(position);
    }
  }, [onResizeHandlePress]);

  const handleBorderLongPress = useCallback(() => {
    const newMode = !isResizeMode;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsResizeMode(newMode);
    if (onLongPress) {
      onLongPress();
    }
  }, [isResizeMode, onLongPress]);

  const handleResizeModeToggle = useCallback(() => {
    const newMode = !isResizeMode;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsResizeMode(newMode);
  }, [isResizeMode]);

  if (!bounds || !visible) {
    return null;
  }

  // Determine pointer events based on interaction mode
  const overlayPointerEvents = isTransforming ? 'none' : 'box-none';

  return (
    <>
      {/* Mode awareness chip */}
      {showModeChip && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(800)}
          style={styles.modeChip}
          pointerEvents="none"
        >
          <Text style={styles.modeChipText}>{modeText}</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[styles.container, animatedContainerStyle]}
        pointerEvents={overlayPointerEvents}
      >
        {/* Border with long press detection */}
        <Pressable
          style={styles.borderPressable}
          onLongPress={handleBorderLongPress}
          delayLongPress={500}
          pointerEvents={isTransforming ? 'none' : 'auto'}
        >
          <View style={styles.dashedBorder} pointerEvents="none">
            <View style={styles.dashedTop} />
            <View style={styles.dashedRight} />
            <View style={styles.dashedBottom} />
            <View style={styles.dashedLeft} />
          </View>
        </Pressable>

        {/* Resize handles - only shown when in resize mode and not transforming */}
        {shouldShowResizeHandles && (
          <View style={styles.resizeHandlesContainer} pointerEvents="box-none">
            <Pressable
              style={[styles.resizeHandle, styles.topLeft]}
              onPress={() => handleResizePress('top-left')}
              accessibilityRole="button"
              accessibilityLabel="Resize top-left corner"
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              <View style={styles.handleVisual} />
            </Pressable>

            <Pressable
              style={[styles.resizeHandle, styles.topRight]}
              onPress={() => handleResizePress('top-right')}
              accessibilityRole="button"
              accessibilityLabel="Resize top-right corner"
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <View style={styles.handleVisual} />
            </Pressable>

            <Pressable
              style={[styles.resizeHandle, styles.bottomLeft]}
              onPress={() => handleResizePress('bottom-left')}
              accessibilityRole="button"
              accessibilityLabel="Resize bottom-left corner"
              hitSlop={{ bottom: 10, left: 10, top: 10, right: 10 }}
            >
              <View style={styles.handleVisual} />
            </Pressable>

            <Pressable
              style={[styles.resizeHandle, styles.bottomRight]}
              onPress={() => handleResizePress('bottom-right')}
              accessibilityRole="button"
              accessibilityLabel="Resize bottom-right corner"
              hitSlop={{ bottom: 10, right: 10, top: 10, left: 10 }}
            >
              <View style={styles.handleVisual} />
            </Pressable>
          </View>
        )}

        {/* Action toolbar - repositioned with proper offset */}
        <View 
          style={[
            styles.actionsContainer, 
            { 
              top: -ACTION_BUTTON_SIZE - TOOLBAR_OFFSET,
              right: TOOLBAR_OFFSET,
            }
          ]} 
          pointerEvents={isTransforming ? 'none' : 'box-none'}
        >
          {/* Resize mode toggle */}
          <Pressable
            style={[styles.actionButton, styles.resizeButton]}
            onPress={handleResizeModeToggle}
            accessibilityRole="button"
            accessibilityLabel={isResizeMode ? 'Exit resize mode' : 'Enter resize mode'}
          >
            <Ionicons 
              name={isResizeMode ? 'contract-outline' : 'expand-outline'} 
              size={20} 
              color="#FFFFFF" 
            />
          </Pressable>

          {canDelete && (
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeletePress}
              accessibilityRole="button"
              accessibilityLabel="Delete selected item"
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
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
                size={20}
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
              <Ionicons name="arrow-up-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}

          {canSendToBack && (
            <Pressable
              style={[styles.actionButton, styles.layerButton]}
              onPress={handleSendToBackPress}
              accessibilityRole="button"
              accessibilityLabel="Send to back"
            >
              <Ionicons name="arrow-down-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </>
  );
});

SelectionOverlayEnhanced.displayName = 'SelectionOverlayEnhanced';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'box-none',
  },
  borderPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  actionsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 6,
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
  resizeButton: {
    backgroundColor: '#9333EA',
  },
  modeChip: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  modeChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SelectionOverlayEnhanced;
