import SkeletonLoader from "@components/Skeleton";
import { generateGUID } from "@helper/guid-number";
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import orderServices from "@services/features/orders/orderService";
import {
  IDeliveryOptionWithFees,
  IDefaultDeliveryOption,
  ICurrency,
  IContact,
} from "@services/features/orders/models";
import { IBuyerPaymentDetail, IBundleDetailsResponse } from "@components/purchase/MakePurchase.types";
import MakePurchase from "@components/purchase/MakePurchase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View } from "react-native";

const BundlePurchase = () => {
  const { itemId, offer_id }: any = useLocalSearchParams();
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);

  const [itemDetails, setItemDetails] = useState<IBundleDetailsResponse | null>(null);
  const [screenLoader, setScreenLoader] = useState(false);
  const [buyerPaymentDetails, setBuyerPaymentDetails] = useState<IBuyerPaymentDetail[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<IDeliveryOptionWithFees[]>([]);
  const [defaultDeliveryOption, setDefaultDeliveryOption] = useState<IDefaultDeliveryOption | null>(null);
  const [currency, setCurrency] = useState<ICurrency | null>(null);
  const [contact, setContact] = useState<IContact | null>(null);

  // Memoize selector values to prevent unnecessary re-renders
  const countryId = useMemo(() => profile?.countryId, [profile?.countryId]);

  /**
   * Fetches bundle item details from marketplace service
   */
  const fetchItems = useCallback(async () => {
    if (!countryId || !itemId) return;

    setScreenLoader(true);
    try {
      const res = await marketplaceServices.getBundleItemDetails(token, itemId);

      if (res?.responseCode === 401) {
        router.push("/");
        return;
      }

      if (res?.data) {
        setItemDetails(res.data as IBundleDetailsResponse);
      }
    } catch (error: any) {
      console.error("Error fetching bundle details:", error);
    } finally {
      setScreenLoader(false);
    }
  }, [token, countryId, itemId]);

  /**
   * Fetches bundle order fees using the new order service endpoint
   * Retrieves buyer fees, seller fees, delivery options, and total amounts
   */
  const fetchItemsFee = useCallback(async () => {
    if (!countryId || !itemId) return;

    try {
      const res = await orderServices.getBundleOrderFees(countryId, itemId);

      if (res?.responseCode === 401) {
        router.push("/");
        return;
      }

      if (res?.data) {
        // Map buyer fees to payment details format
        const feeDetails = res.data.buyerFees?.map((fee) => ({
          id: generateGUID(),
          title: fee.description,
          amount: fee.fee,
          icon: "information-circle",
        })) || [];

        // Create order data with bundle amount from the response
        const orderData = {
          id: 1,
          title: "Order",
          amount: res.data.bundleAmount || 0,
        };

        setBuyerPaymentDetails([orderData, ...feeDetails]);
        setDeliveryOptions(res.data.deliveryOptions || []);
        setDefaultDeliveryOption(res.data.defaultDeliveryOption || null);
        setCurrency(res.data.currency || null);
        setContact(res.data.contact || null);
      }
    } catch (error: any) {
      console.error("Error fetching bundle fees:", error);
    }
  }, [countryId, itemId]);

  // Combine both fetch calls into a single effect to avoid duplicate renders
  useEffect(() => {
    if (countryId && itemId) {
      // Fetch both in parallel for better performance
      Promise.all([fetchItems(), fetchItemsFee()]);
    }
  }, [itemId, countryId, fetchItems, fetchItemsFee]);

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
          isBundle
          buyerPaymentDetails={buyerPaymentDetails}
          deliveryOptions={deliveryOptions}
          defaultDeliveryOption={defaultDeliveryOption ?? undefined}
          currency={currency ?? undefined}
          contact={contact ?? undefined}
        />
      )}
    </View>
  );
};

export default BundlePurchase;
