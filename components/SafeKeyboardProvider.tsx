import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface SafeKeyboardProviderProps {
  children: ReactNode;
}

// Safe wrapper that previously used KeyboardProvider, now simplified
export const SafeKeyboardProvider: React.FC<SafeKeyboardProviderProps> = ({ children }) => {
  // Simplified version - no longer using react-native-keyboard-controller
  // Just return children wrapped in a View for consistency
  return <View style={{ flex: 1 }}>{children}</View>;
};

export default SafeKeyboardProvider;
