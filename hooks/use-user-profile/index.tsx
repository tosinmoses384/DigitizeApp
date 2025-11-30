import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useRouter } from 'expo-router';
import identityServices from '../../services/features/identity-service/loginService';
import marketplaceServices from '../../services/features/marketplace/marketplaceServices';
import { 
  setPostageAddress, 
  setUserName,
  setRefetchPostageAddress,
  setRefetchUserName 
} from '../../redux/slice/profile/profileSlice';

export const useUserProfile = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { 
    token, 
    refetchUserName, 
    refetchPostageAddress, 
    profile 
  } = useAppSelector((state) => state?.userProfileSlice);

  const fetchUsername = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await marketplaceServices.userSocialProfile(token);
      if (res?.status === 200) {
        dispatch(setUserName(res?.data?.trifterName || ''));
      } else if (res?.responseCode === '400' || res?.responseCode === 400) {
        router.push('/Onboarding');
      }
    } catch (error) {
      console.warn('Failed to fetch username:', error);
    }
  }, [token, dispatch, router]);

  const fetchShippingAddress = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await identityServices.getShippingAddress(token);
      dispatch(setPostageAddress(res?.data));
    } catch (error) {
      console.warn('Failed to fetch shipping address:', error);
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (token && refetchUserName) {
      fetchUsername();
    }
    return () => {
      dispatch(setRefetchUserName(false));
    };
  }, [token, refetchUserName]);

  useEffect(() => {
    if (token && refetchPostageAddress) {
      fetchShippingAddress();
    }
    return () => {
      dispatch(setRefetchPostageAddress(false));
    };
  }, [token, refetchPostageAddress, fetchShippingAddress, dispatch]);

  return {
    fetchUsername,
    fetchShippingAddress,
  };
};
