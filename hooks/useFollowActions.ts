import { useState, useCallback } from 'react';
import { useAppDispatch } from '@redux/store';
import { useApiService } from '@hooks/use-auth-guard/useApiService';
import { setRefetchUserDashboardState } from '@redux/slice/profile/profileSlice';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import { TrifterItem } from './useTriftersData';

interface UseFollowActionsProps {
  followingStatus?: number;
  updateItem: (itemId: string, updates: Partial<TrifterItem>) => void;
  removeItem: (itemId: string) => void;
}

export const useFollowActions = ({ followingStatus, updateItem, removeItem }: UseFollowActionsProps) => {
  const dispatch = useAppDispatch();
  const { callApi } = useApiService();

  const [followBtnLoader, setFollowBtnLoader] = useState(false);
  const [activeFollowId, setActiveFollowId] = useState('');

  // Optimized state update logic - extracted from original updateItemState
  const handleItemStateUpdate = useCallback((item: TrifterItem) => {
    // If we're in following list (followingStatus === 1), remove unfollowed items
    if (followingStatus === 1 && item.isFollowing) {
      removeItem(item.id);
      return;
    }

    // Otherwise, toggle the following state
    updateItem(item.id, {
      isFollowing: !item.isFollowing
    });
  }, [followingStatus, updateItem, removeItem]);

  // Optimized follow/unfollow function
  const handleFollowAndUnfollow = useCallback(async (selectedData: TrifterItem) => {
    // Prevent multiple simultaneous requests
    if (followBtnLoader) return;

    setFollowBtnLoader(true);
    setActiveFollowId(selectedData.id);

    const requestData = {
      brandId: selectedData.id,
    };

    try {
      await callApi(
        (token) => {
          return selectedData.isFollowing
            ? wardrobeServices.unfollowTrifters(requestData, token)
            : wardrobeServices.followTrifters(requestData, token);
        },
        {
          onSuccess: (res: any) => {
            setFollowBtnLoader(false);
            setActiveFollowId('');
            
            if (res?.status === 200) {
              // Update dashboard state if needed
              if (followingStatus) {
                dispatch(setRefetchUserDashboardState(true));
              }
              
              // Update the item state optimistically
              handleItemStateUpdate(selectedData);
            }
          },
          onError: (error) => {
            console.error('Error following/unfollowing trifter:', error);
            setFollowBtnLoader(false);
            setActiveFollowId('');
          }
        }
      );
    } catch (error) {
      console.error('Error in handleFollowAndUnfollow:', error);
      setFollowBtnLoader(false);
      setActiveFollowId('');
    }
  }, [followBtnLoader, callApi, followingStatus, dispatch, handleItemStateUpdate]);

  // Optimized button state calculator
  const getButtonState = useCallback((item: TrifterItem, userId?: string) => {
    const isLoading = activeFollowId === item.id && followBtnLoader;
    
    if (isLoading) {
      return {
        title: 'Loading',
        isLoading: true,
        disabled: true
      };
    }

    // Complex button logic from original component
    let title = 'Follow';
    if (item.isFollowing) {
      if (userId) {
        title = 'Following';
      } else if (followingStatus) {
        title = 'Unfollow';
      } else {
        title = 'Following';
      }
    }

    return {
      title,
      isLoading: false,
      disabled: false
    };
  }, [activeFollowId, followBtnLoader, followingStatus]);

  // Optimized button style calculator
  const getButtonStyles = useCallback((item: TrifterItem, baseStyle: any, followingStyle: any, textStyle: any, followingTextStyle: any, userId?: string) => {
    const buttonStyles = [baseStyle];
    const textStyles = [textStyle];

    if (item.isFollowing) {
      buttonStyles.push(followingStyle);
      textStyles.push(followingTextStyle);

      // Special styling for following status
      if (followingStatus === 1) {
        buttonStyles.push({ backgroundColor: 'white' });
        textStyles.push(textStyle); // Reset to base text style
      }

      // Special styling for userId context (viewing someone else's following)
      if (userId) {
        buttonStyles.push({
          backgroundColor: '#FF3B4A',
          borderColor: '#FF3B4A',
        });
        textStyles.push({ color: 'white' });
      }
    }

    // Dynamic width based on button state
    const width = item.isFollowing ? 100 : 80;
    buttonStyles.push({ width });

    return {
      buttonStyle: buttonStyles,
      textStyle: textStyles
    };
  }, [followingStatus]);

  return {
    followBtnLoader,
    activeFollowId,
    handleFollowAndUnfollow,
    getButtonState,
    getButtonStyles
  };
};
