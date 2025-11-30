import {useState, useEffect} from 'react';
import {useAppSelector} from '@redux/store';
import bannerServices from '@services/features/banner-service/bannerService';
import {IBanner} from '@services/features/banner-service/models';

export const useBanners = () => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {token, profile} = useAppSelector(state => state.userProfileSlice);
  const {countryId} = useAppSelector(state => state.userCountryId);

  const fetchBanners = async () => {
    if (!token || !profile?.countryId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the country name from profile or fallback to countryId
      // const country = profile?.countryName || countryId || 'Nigeria';
      const country = profile?.countryId;

      const response = await bannerServices.getBanners(
        token,
        country,
        'Mobile',
      );

      if (response?.status === 200 && response?.data) {
        const bannersData = response?.data?.banners;
        setBanners(bannersData || []);
      } else {
        setBanners([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch banners');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token, countryId, profile?.countryName]);

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
  };
};
