import { useCallback } from 'react';
import { useToast } from 'react-native-toast-notifications';
import timelineServices from '@services/features/timeline-service/timelineServices';
import { useAppSelector } from '@redux/store';

export const useDeletePost = () => {
  const toast = useToast();
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const deletePost = useCallback(async (
    postId: string,
    setLoading: (loading: boolean) => void,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
      successMessage?: string;
      errorMessage?: string;
      refetch?: () => void;
    }
  ): Promise<boolean> => {
    if (!token) {
      toast.show('Authentication required', {
        type: 'danger',
        duration: 4000,
      });
      return false;
    }

    setLoading(true);

    try {
      const response = await timelineServices.deletePost(token, postId);
      
      const isSuccess = response?.responseCode === "0" || 
                       response?.responseCode === 0 || 
                       response?.status === 200 ||
                       (response?.status && response.status >= 200 && response.status < 300);

      const hasError = (response?.status && response.status >= 400) || 
                      response?.detail || 
                      (response as any)?.title ||
                      response?.responseCode === "1" ||
                      response?.responseCode === 1;

      if (isSuccess && !hasError) {
        const message = options?.successMessage || (response?.message || 'Post deleted successfully');
        toast.show(message, {
          type: 'success',
          duration: 2000,
        });
        options?.onSuccess?.(response);
        options?.refetch?.();
        return true;
      } else {
        const message = options?.errorMessage || 
                       response?.detail || 
                       (response as any)?.title || 
                       'Failed to delete post';
        toast.show(message, {
          type: 'danger',
          duration: 4000,
        });
        options?.onError?.(response);
        return false;
      }
    } catch (error: any) {
      const errorData = error?.response?.data || error;
      const message = options?.errorMessage || 
                     errorData?.detail || 
                     errorData?.title || 
                     error?.message || 
                     'Failed to delete post';
      toast.show(message, {
        type: 'danger',
        duration: 4000,
      });
      options?.onError?.(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  return {
    deletePost,
  };
};

export default useDeletePost;
