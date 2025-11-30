import { useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { generateDeepLinks } from '../config/linking';
import { useAppDispatch } from '@redux/store';
import { setCheckoutData } from '@redux/slice/profile/profileSlice';

interface UsePaymentSheetProps {
  checkoutData: any;
  profile: any;
  itemId: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const STRIPE_APPEARANCE = {
  background: '#ffffff',
  primary: '#000000',
  componentBackground: '#ffffff',
  componentBorder: '#cccccc',
  componentDivider: '#e0e0e0',
  primaryText: '#000000',
  secondaryText: '#444444',
  placeholderText: '#888888',
};

export const usePaymentSheet = ({
  checkoutData,
  profile,
  itemId,
  onPaymentSuccess,
  onPaymentError,
}: UsePaymentSheetProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const dispatch = useAppDispatch();

  const initializePaymentSheet = useCallback(async () => {
    if (!checkoutData?.customer_id) return;

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'DigitizeApp, Inc.',
      customerId: checkoutData.customer_id,
      customerEphemeralKeySecret: checkoutData.ephemeral_key,
      paymentIntentClientSecret: checkoutData.payment_intent,
      returnURL: generateDeepLinks.item(itemId),
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: `${profile?.firstName} ${profile?.lastName}`,
      },
      appearance: {
        colors: {
          light: STRIPE_APPEARANCE,
          dark: STRIPE_APPEARANCE,
        },
      },
    });

    if (error) {
      onPaymentError(error.message);
      return false;
    }

    return true;
  }, [checkoutData, profile, itemId, initPaymentSheet, onPaymentError]);

  const openPaymentSheet = useCallback(async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === 'Canceled') {
        onPaymentError('');
        return false;
      }
      onPaymentError(error.message);
      return false;
    } else {
      dispatch(setCheckoutData(null));
      onPaymentSuccess();
      return true;
    }
  }, [presentPaymentSheet, dispatch, onPaymentError, onPaymentSuccess]);

  return {
    initializePaymentSheet,
    openPaymentSheet,
  };
};
