import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { enterSensitiveMode, exitSensitiveMode } from '@services/analyticsService';

export function useSensitiveAnalytics(): void {
  useFocusEffect(
    useCallback(() => {
      enterSensitiveMode();
      return () => {
        exitSensitiveMode();
      };
    }, [])
  );
}

export default useSensitiveAnalytics;


