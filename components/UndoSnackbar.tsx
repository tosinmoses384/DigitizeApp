import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UndoSnackbarProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

const UndoSnackbar = React.memo<UndoSnackbarProps>(
  ({ visible, message, onUndo, onDismiss, duration = 5000 }) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (visible) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Animate in
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();

        // Auto dismiss after duration
        timeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, duration);
      } else {
        // Animate out
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [visible, duration, translateY]);

    const handleDismiss = React.useCallback(() => {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onDismiss();
      });
    }, [translateY, onDismiss]);

    const handleUndo = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      handleDismiss();
      // Delay undo action slightly for smooth animation
      setTimeout(() => {
        onUndo();
      }, 150);
    }, [onUndo, handleDismiss]);

    if (!visible) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
          <TouchableOpacity
            style={styles.undoButton}
            onPress={handleUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo action"
          >
            <Text style={styles.undoText}>UNDO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  },
);

UndoSnackbar.displayName = 'UndoSnackbar';

export default UndoSnackbar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#323232',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSansRegular',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  undoText: {
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
    color: '#FF3B4A',
  },
  closeButton: {
    padding: 4,
  },
});

