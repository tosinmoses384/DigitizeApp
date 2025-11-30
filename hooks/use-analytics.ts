import { useCallback } from 'react';
import { identifyUser, setTrackingEnabled, trackEvent } from '@services/analyticsService';

export type AnalyticsEventProps = Record<string, unknown>;

export function useAnalytics() {
  const identify = useCallback(identifyUser, []);
  const setEnabled = useCallback(setTrackingEnabled, []);
  const event = useCallback(trackEvent, []);
  return { identify, setEnabled, event };
}


