import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAppDispatch } from '@redux/store';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';
import { setMetaData, setCurrentChatName } from '@redux/slice/profile/profileSlice';

interface UseSellerCommunicationProps {
  token: string;
  countryId: string;
  itemDetails: any;
}

export const useSellerCommunication = ({
  token,
  countryId,
  itemDetails,
}: UseSellerCommunicationProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const navigateToChat = useCallback(
    (conversationId: string, metadata: any, sellerName: string) => {
      dispatch(setMetaData(metadata));
      dispatch(setCurrentChatName(sellerName));
      router.push(`/chats/${conversationId}`);
    },
    [dispatch]
  );

  const askSeller = useCallback(async () => {
    // If conversation already exists, navigate directly
    if (itemDetails?.buyerConversation) {
      navigateToChat(
        itemDetails.buyerConversation.id,
        itemDetails.buyerConversation.metadata,
        itemDetails.sellerInfo?.name
      );
      return { success: true };
    }

    // Create new conversation
    setLoading(true);
    try {
      const res: any = await marketplaceServices.askSeller(
        token,
        countryId,
        itemDetails?.itemId
      );

      if (res?.data?.conversationId) {
        navigateToChat(
          res.data.conversationId,
          res.data.metadata,
          itemDetails.sellerInfo?.name
        );
        return { success: true };
      }

      if (res?.responseCode === 401) {
        router.push('/Onboarding');
        return { success: false, unauthorized: true };
      }

      return { success: false, error: 'Failed to create conversation' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'An error occurred' };
    } finally {
      setLoading(false);
    }
  }, [token, countryId, itemDetails, navigateToChat]);

  return {
    askSeller,
    loading,
  };
};
