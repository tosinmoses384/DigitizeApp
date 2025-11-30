import { useCallback } from 'react';
import { router } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import { useApiService } from '@hooks/use-auth-guard/useApiService';

export const useDeleteOutfit = () => {
  const toast = useToast();
  const { callApiWithLoading } = useApiService();

  const deleteOutfit = useCallback(async (
    outfitId: string,
    setLoading: (loading: boolean) => void
  ): Promise<boolean> => {
    const result = await callApiWithLoading(
      (token) => wardrobeServices.deleteUserOutfit(token, outfitId),
      setLoading,
      {
        onSuccess: (data) => {
          toast.show(`${data?.message || data?.detail || 'Outfit deleted successfully'}`, {
            type: 'success',
            duration: 4000,
          });
          router.back();
        },
        onError: (error) => {
          toast.show(`An error occurred. Please try again later.`, {
            type: 'danger',
            duration: 4000,
          });
        },
        onAuthError: () => {
          router.push('/Onboarding');
        }
      }
    );

    return result !== null;
  }, [callApiWithLoading, toast]);

  return {
    deleteOutfit,
  };
};

export default useDeleteOutfit;
