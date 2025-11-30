import React, { ReactNode, useEffect } from 'react';
import { View, StyleSheet, I18nManager, ViewStyle } from 'react-native';
import { useI18n } from '../hooks/use-i18n';

interface RTLWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const RTLWrapper: React.FC<RTLWrapperProps> = React.memo(({ children, style }) => {
  const { isRTL } = useI18n();

  useEffect(() => {
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRTL);
      
      if (__DEV__) {
        console.log(`🔄 RTL mode changed to: ${isRTL ? 'RTL' : 'LTR'}`);
      }
    }
  }, [isRTL]);

  return (
    <View style={[styles.container, isRTL && styles.rtlContainer, style]}>
      {children}
    </View>
  );
});

RTLWrapper.displayName = 'RTLWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rtlContainer: {
    direction: 'rtl',
  },
});

export default RTLWrapper;

