import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
  setToken, 
  setProfile, 
  setRefetchUserState,
  setProfileLoaderState 
} from '../../redux/slice/profile/profileSlice';
import identityServices from '../../services/features/identity-service/loginService';
import { useClearStorage } from '../clear-storage';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { clearStorage } = useClearStorage();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const { token, profile, refetchUserState } = useAppSelector(
    (state) => state?.userProfileSlice
  );

  const fetchUser = async () => {
    if (!token) return;
    
    try {
      dispatch(setProfileLoaderState(true));
      const res = await identityServices.getUserProfile(token);
      
      if (res?.status === 200) {
        const fetchedProfile = res.data as any;
        dispatch(setProfile({
          ...(profile || {}),
          ...fetchedProfile,
          biography: fetchedProfile?.biography ?? profile?.biography,
          countryId: fetchedProfile?.countryId ?? profile?.countryId,
          locationId: fetchedProfile?.locationId ?? profile?.locationId,
          countryName: fetchedProfile?.countryName ?? profile?.countryName,
          locationName: fetchedProfile?.locationName ?? profile?.locationName,
          shouldShowLocation: fetchedProfile?.shouldShowLocation ?? profile?.shouldShowLocation,
          actionRequired: fetchedProfile?.actionRequired ?? profile?.actionRequired,
        }));
        dispatch(setRefetchUserState(false));
        return;
      }
      
      // Handle authentication failures
      if (res?.responseCode === 401 || res?.responseCode === '401') {
        await handleAuthFailure();
      } else {
        console.warn('Failed to fetch user profile:', res);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await handleAuthFailure();
      } else {
        console.warn('Network error fetching user profile:', error);
      }
    } finally {
      dispatch(setProfileLoaderState(false));
    }
  };

  const handleAuthFailure = async () => {
    await clearStorage();
    dispatch(setProfile(null));
    dispatch(setToken(''));
    router.replace({ pathname: '/Onboarding' } as any);
  };

  const checkAuth = async () => {
    try {
      setIsCheckingAuth(true);
      
      if (!token) {
        const storedToken = await AsyncStorage.getItem('accessToken');
        
        if (storedToken) {
          dispatch(setToken(storedToken));
          dispatch(setRefetchUserState(true));
        } else {
          router.replace({ pathname: '/Onboarding' } as any);
          return;
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      router.replace({ pathname: '/Onboarding' } as any);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  useEffect(() => {
    if (refetchUserState && token) {
      fetchUser();
    }
  }, [refetchUserState, token]);

  return {
    isCheckingAuth,
    isAuthenticated: !!token && !!profile,
    token,
    profile,
    fetchUser,
    handleAuthFailure,
  };
};
