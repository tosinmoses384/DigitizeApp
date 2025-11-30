import { useState, useEffect } from 'react';
import { useToast } from 'react-native-toast-notifications';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';

interface UseFollowBrandProps {
  brandValue?: { id: string; value?: string };
  token?: string;
  source?: string;
}

export const useFollowBrand = ({ brandValue, token, source }: UseFollowBrandProps) => {
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowingBrand, setIsFollowingBrand] = useState(false);
  const toast = useToast();

  // Check brand follow status when brandValue changes
  useEffect(() => {
    if (brandValue?.id && token && source === 'brand') {
      setFollowLoading(true);
      wardrobeServices
        .brandQueryFollow(token, brandValue.value || '', '1', '', 0)
        .then((res: any) => {
          const brandData = res?.data?.dataset?.find(
            (brand: any) => brand.id === brandValue.id,
          );
          setIsFollowingBrand(brandData?.isFollowing || false);
        })
        .catch(() => setIsFollowingBrand(false))
        .finally(() => setFollowLoading(false));
    }
  }, [brandValue?.id, token, source]);

  // Handle follow/unfollow brand
  const handleFollowBrand = async () => {
    if (!brandValue?.id || !token) return;

    setFollowLoading(true);

    try {
      const response = isFollowingBrand
        ? await wardrobeServices.unfollowBrands(
            { brandId: brandValue.id },
            token,
          )
        : await wardrobeServices.followBrands(
            { brandId: brandValue.id },
            token,
          );

      if (response?.status === 200) {
        setIsFollowingBrand(!isFollowingBrand);
        toast.show(
          isFollowingBrand
            ? 'Brand unfollowed successfully'
            : 'Brand followed successfully',
          { type: 'success', duration: 3000 },
        );
      } else {
        toast.show(response?.message || 'Something went wrong', {
          type: 'danger',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.show('An error occurred. Please try again.', {
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setFollowLoading(false);
    }
  };

  return {
    followLoading,
    isFollowingBrand,
    handleFollowBrand,
  };
};
