import marketPlaceServices from '@services/features/marketplace/marketplaceServices';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';

interface UseSellerProfileParams {
  sellerId: string;
  token: string;
  countryId: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export interface SellerProfileData {
  trifterUserId: string;
  trifterName: string;
  trifterProfileImageUrl: string;
  wardrobeItemCount: number;
  followingTriftersCount: number;
  followerCount: number;
  reviewCount: number;
  ratings: number;
  isFollowingSeller: boolean;
  lastSeen: string;
  biography: string;
  countryName: string;
  isVerified: boolean;
}

export const useSellerProfile = ({
  sellerId,
  token,
  countryId,
  enabled = true,
  refetchOnFocus = true,
}: UseSellerProfileParams) => {
  const query = useQuery<SellerProfileData>({
    queryKey: ['sellerProfile', sellerId, countryId],
    queryFn: async () => {
      const response = await marketPlaceServices.sellerProfile(
        countryId,
        sellerId,
        token
      );
      
      if (response?.status === 200) {
        return response.data as any;
      }
      
      throw new Error(response?.message || 'Failed to fetch seller profile');
    },
    enabled: enabled && !!sellerId && !!token && !!countryId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  useFocusEffect(
    useCallback(() => {
      if (refetchOnFocus && enabled && sellerId && token && countryId) {
        query.refetch();
      }
    }, [refetchOnFocus, enabled, sellerId, token, countryId, query.refetch])
  );

  return query;
};

