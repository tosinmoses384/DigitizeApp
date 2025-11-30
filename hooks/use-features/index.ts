import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setFeatures, setFeaturesLoading, setFeaturesError } from '../../redux/slice/features/featuresSlice';
import marketplaceServices from '../../services/features/marketplace/marketplaceServices';

export const useFeatures = () => {
  const dispatch = useAppDispatch();
  const { features, isLoading, error } = useAppSelector((state) => state?.featuresSlice);
  const { profile } = useAppSelector((state) => state?.userProfileSlice);
  const lastFetchedCountryIdRef = useRef<string | null>(null);

  const fetchFeatures = useCallback(async () => {
    if (!profile?.countryId) {
      console.warn('No country ID available for fetching features');
      return;
    }

    try {
      dispatch(setFeaturesLoading(true));
      dispatch(setFeaturesError(null));

      const response = await marketplaceServices.features(profile.countryId);
      
      if (response?.status === 200) {
        dispatch(setFeatures(response.data));
        console.log('✅ Features fetched successfully:', response.data);
      } else {
        const errorMessage = response?.message || response?.detail || 'Failed to fetch features';
        dispatch(setFeaturesError(errorMessage));
        console.error('❌ Features fetch failed:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(setFeaturesError(errorMessage));
      console.error('❌ Features fetch error:', error);
    } finally {
      dispatch(setFeaturesLoading(false));
    }
  }, [dispatch, profile?.countryId]);

  // Auto-fetch features when countryId is available or changes
  useEffect(() => {
    if (!profile?.countryId) {
      return;
    }

    const countryIdChanged = lastFetchedCountryIdRef.current !== profile.countryId;
    if (!features || countryIdChanged) {
      fetchFeatures();
      lastFetchedCountryIdRef.current = profile.countryId;
    }
  }, [profile?.countryId, features, fetchFeatures]);

  return {
    features,
    isLoading,
    error,
    fetchFeatures,
    // Convenience getter for shipping settings
    shippingSettings: features?.shippingSettings,
    isOfflineShipping: (() => {
      const rawValue: unknown = (features as any)?.shippingSettings?.supportsOfflineShipping;
      if (typeof rawValue === 'boolean') return rawValue;
      if (typeof rawValue === 'string') return rawValue.toLowerCase() === 'true' || rawValue === '1';
      if (typeof rawValue === 'number') return rawValue === 1;
      return false;
    })(),
  };
};
