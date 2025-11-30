import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import TokenStore from '../utils/tokenStore';
import { getRefreshTime } from '../utils/jwtUtils';
import apiService from '../services/api';
import { useAuthManager } from './use-auth-manager';
import { setToken } from '../redux/slice/profile/profileSlice';

/**
 * Hook to handle background token refresh
 * Checks token expiration periodically and refreshes if needed
 */
export const useTokenRefresh = () => {
    const { isAuthenticated, token } = useAuthManager();
    const dispatch = useDispatch();
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef(AppState.currentState);

    const checkAndRefreshToken = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const accessToken = await TokenStore.getAccessToken();
            if (!accessToken) return;

            const timeUntilRefresh = getRefreshTime(accessToken, 5);

            if (timeUntilRefresh <= 0) {
                if (__DEV__) {
                    console.log('🔄 Token within refresh threshold, refreshing now...');
                }
                const newToken = await apiService.refreshTokenProactively();

                if (newToken) {
                    if (__DEV__) {
                        console.log('✅ Token refreshed successfully, updating state...');
                    }
                    dispatch(setToken(newToken));

                    const nextRefreshTime = getRefreshTime(newToken, 5);
                    if (__DEV__) {
                        console.log(`⏰ Next refresh scheduled in ${Math.round(nextRefreshTime / 1000 / 60)} minutes`);
                    }
                    scheduleRefresh(nextRefreshTime);
                }
            } else {
                if (__DEV__) {
                    console.log(`⏰ Token valid. Next refresh check in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
                }
                scheduleRefresh(timeUntilRefresh);
            }
        } catch (error) {
            if (__DEV__) {
                console.error('Error in token refresh check:', error);
            }
            scheduleRefresh(60 * 1000);
        }
    }, [isAuthenticated, dispatch]);

    // Schedule a refresh check
    const scheduleRefresh = useCallback((delay: number) => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        // Cap delay to avoid integer overflow or extremely long timers (e.g. max 1 hour)
        // Also ensure delay is at least 1 second to avoid tight loops
        const safeDelay = Math.max(1000, Math.min(delay, 60 * 60 * 1000));

        refreshTimerRef.current = setTimeout(() => {
            checkAndRefreshToken();
        }, safeDelay);
    }, [checkAndRefreshToken]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                if (__DEV__) {
                    console.log('📱 App foregrounded, checking token status...');
                }
                checkAndRefreshToken();
            }

            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [checkAndRefreshToken]);

    // Initial check when auth state changes
    useEffect(() => {
        if (isAuthenticated && token) {
            checkAndRefreshToken();
        } else {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        }

        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [isAuthenticated, token, checkAndRefreshToken]);
};
