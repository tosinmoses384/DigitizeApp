import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@redux/store';
import { useApiService } from '@hooks/use-auth-guard/useApiService';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import { useToast } from 'react-native-toast-notifications';

interface BrandFollowState {
  isFollowing: boolean;
  loading: boolean;
  error: string | null;
}

interface UseBrandFollowProps {
  brandId?: string;
  brandName?: string;
  enabled?: boolean; // Whether to automatically check follow status
}

export const useBrandFollow = ({
  brandId,
  brandName,
  enabled = true,
}: UseBrandFollowProps) => {
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const { callApi } = useApiService();
  const toast = useToast();

  const [state, setState] = useState<BrandFollowState>({
    isFollowing: false,
    loading: false,
    error: null,
  });

  // Check brand follow status
  const checkFollowStatus = useCallback(async () => {
    if (!brandId || !token || !enabled) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await callApi(
        (token) =>
          wardrobeServices.brandQueryFollow(token, brandName || '', '1', '', 0),
        {
          onSuccess: (res: any) => {
            // Handle different possible response structures
            let isFollowing = false;

            if (res?.data?.dataset && Array.isArray(res.data.dataset)) {
              const brandData = res.data.dataset.find(
                (brand: any) => brand.id === brandId,
              );
              isFollowing = brandData?.isFollowing || false;
            } else if (res?.data?.isFollowing !== undefined) {
              // Direct response structure
              isFollowing = res.data.isFollowing;
            } else if (res?.isFollowing !== undefined) {
              // Alternative response structure
              isFollowing = res.isFollowing;
            }

            setState((prev) => ({
              ...prev,
              isFollowing,
              loading: false,
              error: null,
            }));
          },
          onError: (error) => {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: 'Failed to check follow status',
              isFollowing: false, // Default to not following on error
            }));
          },
        },
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to check follow status',
        isFollowing: false,
      }));
    }
  }, [brandId, brandName, token, enabled, callApi]);

  // Follow/unfollow brand
  const toggleFollow = useCallback(async () => {
    if (!brandId || !token) {
      toast.show('Brand information not available', {
        type: 'danger',
        duration: 3000,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const requestData = { brandId };

    try {
      await callApi(
        (token) => {
          return state.isFollowing
            ? wardrobeServices.unfollowBrands(requestData, token)
            : wardrobeServices.followBrands(requestData, token);
        },
        {
          onSuccess: (res: any) => {
            if (res?.status === 200) {
              const newFollowingState = !state.isFollowing;
              setState((prev) => ({
                ...prev,
                isFollowing: newFollowingState,
                loading: false,
                error: null,
              }));

              toast.show(
                newFollowingState
                  ? 'Brand followed successfully'
                  : 'Brand unfollowed successfully',
                { type: 'success', duration: 3000 },
              );
            } else {
              setState((prev) => ({ ...prev, loading: false }));
              toast.show(res?.message || 'Something went wrong', {
                type: 'danger',
                duration: 4000,
              });
            }
          },
          onError: (error) => {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: 'Failed to update follow status',
            }));
            toast.show('An error occurred. Please try again.', {
              type: 'danger',
              duration: 4000,
            });
          },
        },
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to update follow status',
      }));
      toast.show('An error occurred. Please try again.', {
        type: 'danger',
        duration: 4000,
      });
    }
  }, [brandId, token, state.isFollowing, callApi, toast]);

  // Check follow status when dependencies change
  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  // Retry function for error recovery
  const retry = useCallback(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  return {
    isFollowing: state.isFollowing,
    loading: state.loading,
    error: state.error,
    toggleFollow,
    retry,
    checkFollowStatus,
  };
};
