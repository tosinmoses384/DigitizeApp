import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { ToastProvider } from "react-native-toast-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store, useAppDispatch, useAppSelector } from "../../redux/store";
import { useAuthAwareDeepLink } from '../../hooks/useAuthAwareDeepLink';
import { StripeProvider } from "@stripe/stripe-react-native";
import {
  setPostageAddress,
  setRefetchPostageAddress,
  setRefetchUserName,
  setUserName,
  setShowSocialOnboardingModal,
  setRefetchUserState,
  setHasCompletedSocialOnboarding,
} from "../../redux/slice/profile/profileSlice";
import identityServices from "../../services/features/identity-service/loginService";
import { useFeatures } from "../../hooks/use-features";
import { useGetItemFromStorage } from "@hooks/get-item";
import { setUserCountryId } from "@redux/slice/user-country-id/userCountryIdSlice";
import { StatusBar } from "react-native";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { useAuthManager } from "../../hooks/use-auth-manager";
import { useConfigurationData } from "../../hooks/use-configuration-data";
import CompleteSocialOnboardingModal from "../../modals/CompleteSocialOnboardingModal";

SplashScreen.preventAutoHideAsync();

// ❌ REMOVED: websocketUrl function - WebSocket connection now managed by chat-messages/index.ts

export default function ProtectedLayout() {
  const dispatch = useAppDispatch();
  const { item } = useGetItemFromStorage("countryId");
  
  // Use the centralized auth manager instead of local auth logic
  const { 
    profile, 
    token 
  } = useAuthManager();

  // Initialize features when user is authenticated
  useFeatures();

  // Initialize configuration data with automatic caching
  useConfigurationData();

  // Initialize authentication-aware deep linking
  useAuthAwareDeepLink();

  const {
    refetchUserName,
    refetchPostageAddress,
    checkoutData,
    showSocialOnboardingModal,
  } = useAppSelector((state) => state?.userProfileSlice);

  const handleCloseModal = useCallback(() => {
    dispatch(setShowSocialOnboardingModal(false));
    dispatch(setHasCompletedSocialOnboarding(true));
  }, [dispatch]);

  const handleModalSuccess = useCallback(() => {
    dispatch(setHasCompletedSocialOnboarding(true));
    dispatch(setRefetchUserState(true));
  }, [dispatch]);

  const [loaded] = useFonts({
    DMSansRegular: require("../../assets/fonts/DMSans-Regular.ttf"),
    DMSansBold: require("../../assets/fonts/DMSans-Bold.ttf"),
    DMSansExtraBold: require("../../assets/fonts/DMSans-ExtraBold.ttf"),
    DMSansExtraBoldItalic: require("../../assets/fonts/DMSans-ExtraBoldItalic.ttf"),
    DMSansBoldItalic: require("../../assets/fonts/DMSans-BoldItalic.ttf"),
    DMSansMedium: require("../../assets/fonts/DMSans-Medium.ttf"),
    DMSansSemiBold: require("../../assets/fonts/DMSans-SemiBold.ttf"),
    DMSansThin: require("../../assets/fonts/DMSans-Thin.ttf"),
    DMSansThinItalic: require("../../assets/fonts/DMSans-ThinItalic.ttf"),
    FigtreeBold: require("../../assets/fonts/Figtree-Bold.ttf"),
    FigtreeMedium: require("../../assets/fonts/Figtree-Medium.ttf"),
    FigtreeRegular: require("../../assets/fonts/Figtree-Regular.ttf"),
    FigtreeExtraBold: require("../../assets/fonts/Figtree-ExtraBold.ttf"),
    FigtreeSemiBold: require("../../assets/fonts/Figtree-SemiBold.ttf"),
  });

  // Configuration data is now handled by useConfigurationData hook
  // All the individual configuration fetching functions (getCategories, brands, itemSize, etc.)
  // have been consolidated into the centralized hook for better caching and deduplication

  const getUsername = useCallback(() => {
    if (!token) return;
    const userProfile = marketplaceServices.userSocialProfile(token);
    userProfile
      .then((res: any) => {
        if (res?.status === 200) {
          return dispatch(setUserName(res?.data?.trifterName || ""));
        }
        if (res?.responseCode === "400" || res?.responseCode === 400) {
          return router.push("/Onboarding");
        }
      })
      .catch((error) => {});
  }, [token, dispatch]);

  const getShippingAddress = useCallback(() => {
    if (token) {
      identityServices
        ?.getShippingAddress(token)
        .then((res: any) => {
          dispatch(setPostageAddress(res?.data));
        })
        .catch((error) => {});
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (loaded && token && profile) {
      SplashScreen.hideAsync();
    }
  }, [loaded, profile, token]);

  useEffect(() => {
    if (item) {
      dispatch(setUserCountryId(item));
    }
  }, [item, dispatch]);

  useEffect(() => {
    if (token && refetchPostageAddress) {
      getShippingAddress();
      dispatch(setRefetchPostageAddress(false));
    }
  }, [token, refetchPostageAddress, getShippingAddress, dispatch]);

  useEffect(() => {
    if (token && refetchUserName) {
      getUsername();
      dispatch(setRefetchUserName(false));
    }
  }, [token, refetchUserName, getUsername, dispatch]);

  if (!loaded) {
    return null;
  }



  // ❌ REMOVED: Duplicate WebSocket connection that was causing timeouts
  // The chat-messages hook (react-native-use-websocket) handles all WebSocket connections
  // This duplicate connection was causing code 1006 timeouts and false message failures
  
  // ❌ REMOVED: Redundant deep link handler
  // useAuthAwareDeepLink hook handles all deep linking with proper authentication awareness

  return (
    <Provider store={store}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <StripeProvider
        publishableKey={checkoutData?.public_key}
        merchantIdentifier="com.digitizeapp.digitizeapp" // required for Apple Pay
        // urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ToastProvider
            placement="top"
            duration={3000}
            animationType="slide-in"
            offset={40}
          >
            <CompleteSocialOnboardingModal
              visible={showSocialOnboardingModal}
              onClose={handleCloseModal}
              onSuccess={handleModalSuccess}
              initialData={{
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                countryId: profile?.countryId || '',
                countryName: profile?.countryName || '',
              }}
            />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade_from_bottom",
              }}
            >
              <Stack.Screen name="profileMain" />
              <Stack.Screen name="personalisation" />
              <Stack.Screen name="transactionDetails" />
              <Stack.Screen
                name="personalisationInfo"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="getToKnow"
                options={{
                  headerShown: false,
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="withdrawalDetails"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="balance"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen name="shipping" />
              <Stack.Screen name="following" />
              <Stack.Screen name="followers" />
              <Stack.Screen name="editProfileItem/[id]" />
              <Stack.Screen name="preloved/item-details/[itemId]" />
              <Stack.Screen name="editPost/[id]" />
              <Stack.Screen name="profileDetails" />
              <Stack.Screen name="accountDetails" />
              <Stack.Screen name="payments" />
              <Stack.Screen name="postage" />
              <Stack.Screen name="security" />
              <Stack.Screen name="pushNotification" />
              <Stack.Screen name="emailAndNotification" />
              <Stack.Screen name="selectLanguage" />
              <Stack.Screen name="helpCenter/[id]" />
              <Stack.Screen name="ViewHelpDetails/[id]" />
              <Stack.Screen name="Drbers" />
              <Stack.Screen name="ChangeUserName" />
              <Stack.Screen name="ChangeEmail" />
              <Stack.Screen name="ChangeEmailOtp/[email]" />
              <Stack.Screen name="CreateNewEmail/[otp]" />
              <Stack.Screen name="ChangePhoneNumberOtp/[newPhoneNumber]" />
              <Stack.Screen name="SuccessPage" />
              <Stack.Screen name="EmailConfirmation" />
              <Stack.Screen name="EmailConfirmationOtp" />
              <Stack.Screen name="PhoneNumberConfirmation" />
              <Stack.Screen name="Inbox-set-shipping" />


              {/* <Stack.Screen name="CreateNewEmail" /> */}
              <Stack.Screen name="Recommended" />

              {/* <Stack.Screen name="chatUser/[id]" /> */}
              <Stack.Screen name="favorites" />
              <Stack.Screen name="cookieSettings" />
              <Stack.Screen name="digitizeAppWorks" />
              <Stack.Screen name="transactionHistory" />
              <Stack.Screen name="holidayMode" />
              <Stack.Screen name="items" />
              <Stack.Screen name="outfit" />
              <Stack.Screen name="collage" />
              <Stack.Screen name="CollageEditPrepare" />
              <Stack.Screen name="selectItems" />
              <Stack.Screen name="addPost" />
              <Stack.Screen name="newPost" />
              <Stack.Screen name="tagItemToPost" />
              <Stack.Screen name="AddOutfit" />
              <Stack.Screen name="ChangePassword" />
              <Stack.Screen name="LoginActivities" />
              <Stack.Screen name="TwoStepVerification" />
              <Stack.Screen name="ChangePhoneNumber" />
              <Stack.Screen name="SendConfirmationEmail" />
              <Stack.Screen name="AboutSustainability" />
              <Stack.Screen name="Advertise" />
              <Stack.Screen name="Careers" />
              <Stack.Screen name="HowItWork" />
              <Stack.Screen name="ItemVerification" />
              <Stack.Screen name="AboutWardrobe" />
              <Stack.Screen name="OurBlog" />
              <Stack.Screen name="HelpAndSupport" />
              <Stack.Screen name="PurchaseCover" />
              <Stack.Screen name="AboutFaq" />
              <Stack.Screen name="TrustAndSafety" />
              <Stack.Screen name="PaymentInfo" />
              <Stack.Screen name="WithdrawAccount" />
              <Stack.Screen name="FeedbackForm" />
              <Stack.Screen name="AddPaymentAddress" />
              <Stack.Screen name="EditOutfitView" />
              {/* <Stack.Screen name="filterPage" />
            <Stack.Screen name="SellerProfile" /> */}

              <Stack.Screen
                name="order"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="map"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="bundleDiscounts"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen name="withdrawalPin" />
              <Stack.Screen name="profileMainOthers" />
              <Stack.Screen name="PrivacyPolicy" />
              <Stack.Screen name="TermsAndConditions" />
              <Stack.Screen 
                name="inbox-stack" 
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
            </Stack>
          </ToastProvider>
        </GestureHandlerRootView>
      </StripeProvider>
    </Provider>
  );
}
