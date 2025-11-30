import React, { useState, useCallback, useMemo } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import StackHeader from "@components/StackHeader";
import AmountInput from "@components/AmountInput";
import { Colors, SIZES } from "@constants/Colors";
import { useAppSelector } from "@redux/store";
import { useQuery } from "@tanstack/react-query";
import { ICurrency } from "@services/features/orders/models";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";

interface SetShippingPriceProps {}

const SetShippingPrice: React.FC<SetShippingPriceProps> = React.memo(() => {
  const params = useLocalSearchParams();
  const initialPrice = (params.shippingPrice as string) || (params.price as string);
  const [shippingFee, setShippingFee] = useState(initialPrice);
  const { width: screenWidth } = useWindowDimensions();
  
  // Get profile from Redux to access countryId
  const { profile, postageAddress } = useAppSelector((state) => state?.userProfileSlice);
  
  // Get countryId from shipping address (postageAddress) - this is the shipping data from backend
  // Fallback to profile countryId if shipping address is not available
  const countryId = useMemo(() => {
    return postageAddress?.countryId || profile?.countryId;
  }, [postageAddress?.countryId, profile?.countryId]);

  // Fetch currency from marketplace features endpoint based on countryId
  // Primary source: GET /marketplace/v1/{countryId}/features
  const { data: currencyData } = useQuery<ICurrency | null>({
    queryKey: ['currency', countryId],
    queryFn: async () => {
      if (!countryId) return null;
      
      try {
        const featuresEndpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/marketplace/v1/${countryId}/features`;
        
        // Use features endpoint as primary source for currency
        const featuresResponse = await marketplaceServices.features(countryId);
        
        if (featuresResponse?.status === 200 && featuresResponse?.data) {
          const featuresData = featuresResponse.data as any;
          
          // Extract currency from data.country object (primary structure)
          // Response structure: { data: { country: { currencySymbol, currencyCode, currency, ... } } }
          let currencyInfo: ICurrency | null = null;
          
          // Check 1: Currency in country object (primary structure from API)
          if (featuresData?.country && featuresData.country.currencySymbol) {
            currencyInfo = {
              countryId: featuresData.country.id || countryId,
              currencyId: featuresData.country.currencyId || '',
              currencySymbol: featuresData.country.currencySymbol,
              currencyName: featuresData.country.currency || featuresData.country.currencyName || '',
              currencyCode: featuresData.country.currencyCode || '',
            };
          }
          // Check 2: Currency object at root level (fallback)
          else if (featuresData?.currency && typeof featuresData.currency === 'object') {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currency.currencyId || '',
              currencySymbol: featuresData.currency.currencySymbol || '',
              currencyName: featuresData.currency.currencyName || '',
              currencyCode: featuresData.currency.currencyCode || '',
            };
          }
          // Check 3: Currency fields at root level (fallback)
          else if (featuresData?.currencySymbol) {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currencyId || '',
              currencySymbol: featuresData.currencySymbol,
              currencyName: featuresData.currencyName || '',
              currencyCode: featuresData.currencyCode || '',
            };
          }
          
          if (currencyInfo?.currencySymbol) {
            return currencyInfo;
          } 
        } 
        
      } catch (error) {
      
      }
      
      return null;
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1,
  });

  // Currency mapping fallback for common countries (until backend endpoint is confirmed)
  // This should be removed once backend provides currency via API
  const getCurrencyFallback = useCallback((countryId: string | undefined): string => {
    if (!countryId) return "$";
    
    const currencyMap: Record<string, string> = {
      'NG': '₦', // Nigeria - Naira
      'US': '$', // United States - Dollar
      'GB': '£', // United Kingdom - Pound
      'EU': '€', // European Union - Euro
      'JP': '¥', // Japan - Yen
      'CN': '¥', // China - Yuan
      'IN': '₹', // India - Rupee
      'ZA': 'R', // South Africa - Rand
      'KE': 'KSh', // Kenya - Shilling
      'GH': '₵', // Ghana - Cedi
    };
    
    return currencyMap[countryId] || "$";
  }, []);

  // Get currency symbol with fallback chain:
  // 1. Currency from backend based on shipping address countryId
  // 2. Currency from fallback mapping based on countryId
  // 3. Profile currency (if available)
  // 4. Default "$"
  const currencySymbol = useMemo(() => {
    if (currencyData?.currencySymbol) {
      return currencyData.currencySymbol;
    }
    
    // Use fallback mapping if backend didn't return currency
    const fallbackCurrency = getCurrencyFallback(countryId);
    if (fallbackCurrency !== "$") {
      return fallbackCurrency;
    }
    
    // Last resort fallbacks
    return (profile as any)?.currencySymbol || "$";
  }, [currencyData?.currencySymbol, countryId, getCurrencyFallback, profile]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleShippingFeeChange = useCallback((text: string) => {
    setShippingFee(text);
  }, []);

  const handleDone = useCallback(() => {
    router.back();
    // Use a small delay to ensure the previous screen is ready
    setTimeout(() => {
      router.setParams({ shippingPrice: shippingFee });
    }, 100);
  }, [shippingFee]);

  const isShippingFeeValid = useMemo(() => {
    const fee = parseFloat(shippingFee);
    return !isNaN(fee) && fee > 0;
  }, [shippingFee]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <StackHeader
        title="Set Shipping Price"
        onPress={handleGoBack}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shipping Fee Input Section */}
        <View style={styles.inputSection}>
          <AmountInput
            label="Enter Shipping Fee"
            value={shippingFee}
            onChangeText={handleShippingFeeChange}
            keyboardType="numeric"
            placeholder="Enter Shipping Fee"
            currency={currencySymbol}
            autoFocus={true}
          />
        </View>

        {/* Guidelines Section */}
        <View style={styles.guidelinesSection}>
          <Text 
            style={styles.guidelinesTitle}
            accessibilityRole="header"
          >
            Setting your shipping price
          </Text>
          
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>•</Text>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineLabel}>Confirm costs first:</Text>
                <Text style={styles.guidelineText}>
                  Before setting a shipping price, always check with your preferred shipping company for accurate rates.
                </Text>
              </View>
            </View>

            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>•</Text>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineLabel}>You cover the shipping:</Text>
                <Text style={styles.guidelineText}>
                  The amount you set is the total shipping cost your buyer will pay, no matter where you're shipping within the country.
                </Text>
              </View>
            </View>

            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>•</Text>
              <View style={styles.guidelineContent}>
                <Text style={styles.guidelineLabel}>Set a fair price:</Text>
                <Text style={styles.guidelineText}>
                  Make sure the shipping price is reasonable for all destinations so it works for you and is fair to your buyers.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.doneButton,
            !isShippingFeeValid && styles.doneButtonDisabled
          ]}
          onPress={handleDone}
          disabled={!isShippingFeeValid}
          accessibilityRole="button"
          accessibilityLabel="Done, Set shipping price"
          accessibilityHint="Tap to save the shipping price and return to previous screen"
        >
          <Text style={[
            styles.doneButtonText,
            !isShippingFeeValid && styles.doneButtonTextDisabled
          ]}>
            Done
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});

SetShippingPrice.displayName = 'SetShippingPrice';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120, // Space for fixed button - increased for better spacing
  },
  inputSection: {
    marginBottom: 32,
  },
  guidelinesSection: {
    gap: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#07090C',
    fontFamily: 'DMSans-Bold',
  },
  guidelinesList: {
    gap: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guidelineBullet: {
    fontSize: 14,
    lineHeight: 20,
    color: '#464F5D',
    fontFamily: 'DMSans-Regular',
    marginTop: 2,
  },
  guidelineContent: {
    flex: 1,
    gap: 4,
  },
  guidelineLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#464F5D',
    fontFamily: 'DMSans-Bold',
  },
  guidelineText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#464F5D',
    fontFamily: 'DMSans-Regular',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34, // Safe area bottom padding
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
  doneButton: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    width: '100%',
  },
  doneButtonDisabled: {
    backgroundColor: '#FF9DA7',
  },
  doneButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'DMSans-Medium',
  },
  doneButtonTextDisabled: {
    color: '#fff',
  },
});

export default SetShippingPrice;
