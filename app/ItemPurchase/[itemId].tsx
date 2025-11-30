import SkeletonLoader from "@components/Skeleton";
import { generateGUID } from "@helper/guid-number";
import { setCheckoutData } from "@redux/slice/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import orderServices from "@services/features/orders/orderService";
import {
  IDeliveryOptionWithFees,
  IDefaultDeliveryOption,
  ICurrency,
  IContact,
} from "@services/features/orders/models";
import { IGetItemDetailsResponse } from "@services/features/marketplace/models";
import { IBuyerPaymentDetail } from "@components/purchase/MakePurchase.types";
import MakePurchase from "@components/purchase/MakePurchase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import { useUserProfile } from "@hooks/use-user-profile";
import { useToast } from "react-native-toast-notifications";

const ItemPurchase = () => {
  const { itemId, offer_id }: any = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  const { fetchShippingAddress } = useUserProfile();
  const toast = useToast();

  const [itemDetails, setItemDetails] = useState<IGetItemDetailsResponse | null>(null);
  const [screenLoader, setScreenLoader] = useState(false);
  const dispatch = useAppDispatch();
  const [buyerPaymentDetails, setBuyerPaymentDetails] = useState<IBuyerPaymentDetail[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<IDeliveryOptionWithFees[]>([]);
  const [defaultDeliveryOption, setDefaultDeliveryOption] = useState<IDefaultDeliveryOption | null>(null);
  const [currency, setCurrency] = useState<ICurrency | null>(null);
  const [contact, setContact] = useState<IContact | null>(null);
  const [hasFeesError, setHasFeesError] = useState(false);

  // Memoize selector values to prevent unnecessary re-renders
  const countryId = useMemo(() => profile?.countryId, [profile?.countryId]);

  const fetchItems = useCallback(async () => {
    if (!countryId || !itemId) return;

    try {
      const res = await marketplaceServices.getItemDetails(
        token,
        countryId,
        itemId,
        offer_id
      );

      if (res?.responseCode === 401) {
        router.push("/");
        return;
      }


      if (res?.data) {
        setItemDetails(res.data);
        dispatch(setCheckoutData(res.data.userCheckoutSession));
      }
    } catch (error: any) {
      console.error("Error fetching item details:", error);
    }
  }, [token, countryId, itemId, offer_id, dispatch]);

  /**
   * Fetches item order fees using the new order service endpoint
   * Retrieves buyer fees, seller fees, delivery options, and total amounts
   */
  const fetchItemsFee = useCallback(async () => {
    if (!countryId || !itemId) return;

    try {
      const res = await orderServices.getItemOrderFees(countryId, itemId);
      if (res?.responseCode === 401) {
        router.push("/");
        return;
      }

      if (res?.data) {
        // Map buyer fees to payment details format
        const feeDetails =
          res.data.buyerFees?.map((fee) => ({
            id: generateGUID(),
            title: fee.description,
            amount: fee.fee,
            icon: "information-circle",
          })) || [];

        // Create order data with item amount from the response
        const orderData = {
          id: 1,
          title: "Order",
          amount: res.data.itemAmount || 0,
        };

        setBuyerPaymentDetails([orderData, ...feeDetails]);
        setDeliveryOptions(res.data.deliveryOptions || []);
        setDefaultDeliveryOption(res.data.defaultDeliveryOption || null);
        setCurrency(res.data.currency || null);
        setContact(res.data.contact || null);
        setHasFeesError(false);
      } else {
        // Show backend-provided error without blocking page render
        const message = (res as any)?.detail || (res as any)?.message || "Unable to fetch item fees.";
        if (message) {
          toast.show(message, { type: "danger", duration: 4000 });
        }
        // Ensure UI can render without fees
        setDeliveryOptions([]);
        setDefaultDeliveryOption(null);
        setCurrency(null);
        setContact(null);
        setHasFeesError(true);
      }
    } catch (error: any) {
      console.error("Error fetching item fees:", error);
      setHasFeesError(true);
    }
  }, [countryId, itemId, toast]);

  // Fetch shipping address when component mounts
  useEffect(() => {
    if (token) {
      fetchShippingAddress();
    }
  }, [token, fetchShippingAddress]);

  // Combine both fetch calls into a single effect to avoid duplicate renders
  useEffect(() => {
    if (countryId && itemId) {
      const fetchData = async () => {
        setScreenLoader(true);
        try {
          // Fetch both in parallel for better performance
          await Promise.all([fetchItems(), fetchItemsFee()]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setScreenLoader(false);
        }
      };
      
      fetchData();
    }
  }, [itemId, countryId, fetchItems, fetchItemsFee]);

  // Fallback: if fees are unavailable, still render with base item price
  useEffect(() => {
    if (itemDetails && buyerPaymentDetails.length === 0) {
      setBuyerPaymentDetails([
        {
          id: 1,
          title: "Order",
          amount: itemDetails.itemPrice || 0,
        },
      ]);
    }
  }, [itemDetails, buyerPaymentDetails]);


  return (
    <View style={{ flex: 1 }}>
      {screenLoader && (
        <View
          style={{
            paddingLeft: 16,
          }}
        >
          <SkeletonLoader />
        </View>
      )}
      {!screenLoader && itemDetails && (
        <MakePurchase
          itemDetails={itemDetails}
          buyerPaymentDetails={buyerPaymentDetails}
          deliveryOptions={deliveryOptions}
          defaultDeliveryOption={defaultDeliveryOption ?? undefined}
          currency={currency ?? undefined}
          contact={contact ?? undefined}
          hideTotal={hasFeesError}
        />
      )}
    </View>
  );
};

export default ItemPurchase;
