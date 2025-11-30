import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as Localization from "expo-localization";
import Constants from "expo-constants";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import { ILoginResponse } from "../identity-service/models";

// Complete the auth session for Google - this is crucial for closing the modal properly
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: false,
});

// Constants
const GOOGLE_OAUTH_ENDPOINTS = {
  AUTHORIZATION: "https://accounts.google.com/o/oauth2/v2/auth",
  TOKEN: "https://oauth2.googleapis.com/token",
  USER_INFO: "https://www.googleapis.com/oauth2/v2/userinfo",
} as const;

// Removed unused RESPONSE_CODES

const ERROR_MESSAGES = {
  NO_RESPONSE: "No response received from backend",
  INVALID_RESPONSE: "Invalid response structure from backend",
  NETWORK_ERROR: "Network error during social sign-in. Please check your connection.",
  TIMEOUT_ERROR: "Request timeout during social sign-in. Please try again.",
  CANCELLED: "Sign in was cancelled",
  APPLE_UNAVAILABLE: "Apple Sign-In is not available on this device",
  NO_ACCESS_TOKEN: "No access token received",
  NO_IDENTITY_TOKEN: "No identity token received from Apple",
  FAILED_USER_INFO: "Failed to fetch user information",
} as const;

export interface ISocialAuthRequest {
  token: string;
  provider: SocialAuthProvider;
  authorizationCode: string;
  platform: DevicePlatform;
  idToken?: string;
  accessToken?: string;
  countryCode?: string | number;
}

// Helper enum for platform detection
export enum DevicePlatform {
  Web = "Web",
  Ios = "Ios",
  Android = "Android",
}

// Helper enum for better readability
export enum SocialAuthProvider {
  Apple = "Apple",
  Microsoft = "Microsoft",
  Facebook = "Facebook",
  Amazon = "Amazon",
  Google = "Google",
}

export interface ISocialAuthResponse {
  accessToken: string;
  expiry: string;
  expiresIn: number;
  refreshToken: string;
  idToken: string;
  userGroups: string[];
  userType: string;
}

interface GoogleUserInfo {
  idToken: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    givenName: string;
    familyName: string;
    photo?: string;
  };
}

interface AppleAuthCredential {
  identityToken: string;
  authorizationCode: string;
  email?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  };
  user: string;
}

interface GoogleSignInModule {
  GoogleSignin: {
    configure: (options: {
      webClientId: string;
      offlineAccess?: boolean;
      forceCodeForRefreshToken?: boolean;
    }) => void;
    hasPlayServices: () => Promise<void>;
    signIn: () => Promise<{
      data: {
        user: {
          id: string;
          email: string;
          givenName?: string;
          familyName?: string;
          photo?: string;
        };
      };
    }>;
    getTokens: () => Promise<{
      idToken: string;
      accessToken: string;
    }>;
  };
  statusCodes: {
    SIGN_IN_CANCELLED: string | number;
    IN_PROGRESS: string | number;
    PLAY_SERVICES_NOT_AVAILABLE: string | number;
  };
}

export interface CompleteSocialSignupPayload {
  countryCode: string | number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  authorizationCode: string;
  token: string;
  provider: string | number;
  platform:  string | number;
}

/**
 * Social Authentication Service
 * Handles Google and Apple sign-in flows with backend integration
 */
class SocialAuthService {
  private getDeviceCountryCode(): string {
    try {
      const locales: any[] = (Localization as any).getLocales?.() ?? [];
      const region = locales[0]?.regionCode || (Localization as any).region;
      return region || "";
    } catch {
      return "";
    }
  }
  /**
   * Gets the platform-specific Google Client ID from environment variables
   * @returns {string} The Google Client ID for the current platform
   * @throws {Error} If the Client ID is not configured for the current platform
   */
  private getGoogleClientId(): string {
    // Get platform-specific client ID
    if (Platform.OS === "ios") {
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      if (!iosClientId) {
        throw new Error(
          "Google iOS Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your environment variables."
        );
      }
      return iosClientId;
    } else if (Platform.OS === "android") {
      // The native Google Sign-In SDK requires the Web OAuth client ID on Android.
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (webClientId) {
        return webClientId;
      }
      const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
      if (androidClientId) {
        if (__DEV__) {
          console.warn(
            "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. Falling back to EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID on Android."
          );
        }
        return androidClientId;
      }
      throw new Error(
        "Google Client ID not configured for Android. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (preferred) or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID."
      );
    } else {
      // Web platform
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      if (!webClientId) {
        throw new Error(
          "Google Web Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your environment variables."
        );
      }
      return webClientId;
    }
  }

  /**
   * Generates the redirect URI for Google OAuth flow
   * @returns {string} The redirect URI
   */
  private getGoogleRedirectUri(): string {
    const clientId = this.getGoogleClientId();
    const clientIdBase = clientId.replace(".apps.googleusercontent.com", "");
    const nativeRedirect = Platform.select({
      ios: `com.googleusercontent.apps.${clientIdBase}:/oauthredirect`,
      android: `com.googleusercontent.apps.${clientIdBase}:/oauth2redirect/google`,
      default: undefined,
    });
    return AuthSession.makeRedirectUri({ native: nativeRedirect, path: 'oauth' });
  }

  /**
   * Initiates Google Sign-In flow and returns user information
   * Platform-specific: iOS uses expo-auth-session, Android uses native Google Sign-In
   * @returns {Promise<GoogleUserInfo | null>} Google user information or null if failed
   * @throws {Error} If sign-in fails or is cancelled
   */
  async signInWithGoogle(): Promise<GoogleUserInfo | null> {
    if (Platform.OS === "android") {
      if (this.isExpoGo()) {
        return this.signInWithGoogleIOS();
      }
      return this.signInWithGoogleAndroid();
    }
    return this.signInWithGoogleIOS();
  }

  /**
   * iOS-specific Google Sign-In using expo-auth-session (browser-based)
   * @returns {Promise<GoogleUserInfo | null>} Google user information or null if failed
   */
  private async signInWithGoogleIOS(): Promise<GoogleUserInfo | null> {
    try {
      const clientId = this.getGoogleClientId();
      const redirectUri = this.getGoogleRedirectUri();

      console.log("Starting Google Sign-In (iOS)...");
      console.log("Platform:", Platform.OS);
      console.log("Client ID configured:", !!clientId);
      console.log("Redirect URI:", redirectUri);

      const state = await Crypto.randomUUID();
      console.log("Generated state:", state);

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        state,
        extraParams: {},
        prompt: AuthSession.Prompt.SelectAccount,
      });

      console.log("Auth request created, starting prompt...");

      const result = await request.promptAsync({
        authorizationEndpoint: GOOGLE_OAUTH_ENDPOINTS.AUTHORIZATION,
      });

      console.log("Auth result:", result.type);

      if ("params" in result) {
        console.log("Auth result params:", result.params);
      }
      if ("error" in result) {
        console.log("Auth error details:", result.error);
      }

      if (result.type !== "success") {
        if (result.type === "cancel" || result.type === "dismiss") {
          if (__DEV__) {
            console.log(`User ${result.type === "cancel" ? "cancelled" : "dismissed"} Google sign-in`);
          }
          return null;
        }
        console.error("Authentication failed with type:", result.type);
        throw new Error(`Authentication failed: ${result.type}`);
      }

      if (result.params?.state && result.params.state !== state) {
        console.error("State mismatch:", {
          expected: state,
          received: result.params.state,
        });
        throw new Error("State parameter mismatch - possible CSRF attack");
      }

      console.log("State verified successfully");
      console.log("Auth successful, exchanging code for tokens...");

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code: result.params.code,
          extraParams: {
            code_verifier: request.codeVerifier || "",
          },
          redirectUri,
        },
        {
          tokenEndpoint: GOOGLE_OAUTH_ENDPOINTS.TOKEN,
        }
      );

      console.log("Token exchange result:", !!tokenResult.accessToken);

      if (!tokenResult.accessToken) {
        throw new Error(ERROR_MESSAGES.NO_ACCESS_TOKEN);
      }

      const userInfoResponse = await fetch(
        `${GOOGLE_OAUTH_ENDPOINTS.USER_INFO}?access_token=${tokenResult.accessToken}`
      );

      if (!userInfoResponse.ok) {
        console.error(
          "User info fetch failed:",
          userInfoResponse.status,
          userInfoResponse.statusText
        );
        throw new Error(ERROR_MESSAGES.FAILED_USER_INFO);
      }

      const userInfo = await userInfoResponse.json();
      console.log("User info received:", !!userInfo.email);
      console.log("Google user attributes:", {
        hasEmail: !!userInfo.email,
        hasGivenName: !!userInfo.given_name,
        hasFamilyName: !!userInfo.family_name,
        hasSub: !!userInfo.sub,
        hasId: !!userInfo.id,
      });

      return {
        idToken: tokenResult.idToken || "",
        accessToken: tokenResult.accessToken,
        user: {
          id: userInfo.sub || userInfo.id,
          email: userInfo.email,
          givenName: userInfo.given_name || "",
          familyName: userInfo.family_name || "",
          photo: userInfo.picture,
        },
      };
    } catch (error: any) {
      console.error("Google Sign-In Error Details (iOS):", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      if (error.message === ERROR_MESSAGES.CANCELLED) {
        if (__DEV__) {
          console.log("User cancelled sign-in, returning null");
        }
        return null;
      } else if (
        error.message.includes("network") ||
        error.message.includes("Network")
      ) {
        throw new Error("Network error. Please check your connection");
      } else if (error.message.includes("Client ID")) {
        throw new Error("Google Client ID not configured properly");
      } else {
        throw new Error(`Failed to sign in with Google: ${error.message}`);
      }
    }
  }

  /**
   * Android-specific Google Sign-In using native SDK
   * @returns {Promise<GoogleUserInfo | null>} Google user information or null if failed
   */
  private async signInWithGoogleAndroid(): Promise<GoogleUserInfo | null> {
    let statusCodesLocal: GoogleSignInModule["statusCodes"] | null = null;
    try {
      console.log("Starting Google Sign-In (Android - Native)...");
      if (this.isExpoGo()) {
        if (__DEV__) {
          console.log("Expo Go detected, falling back to AuthSession flow");
        }
        return await this.signInWithGoogleIOS();
      }

      const clientId = this.getGoogleClientId();

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const googleSignInModule = require("@react-native-google-signin/google-signin") as GoogleSignInModule;
      const { GoogleSignin, statusCodes } = googleSignInModule;
      statusCodesLocal = statusCodes;

      GoogleSignin.configure({
        webClientId: clientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });

      console.log("GoogleSignin configured with clientId");

      await GoogleSignin.hasPlayServices();
      console.log("Play Services available");

      const userInfo = await GoogleSignin.signIn();
      console.log("Google Sign-In successful (Android)");

      if (!userInfo.data) {
        throw new Error("No user data received from Google Sign-In");
      }

      const tokens = await GoogleSignin.getTokens();
      console.log("Tokens retrieved:", {
        hasIdToken: !!tokens.idToken,
        hasAccessToken: !!tokens.accessToken,
      });

      return {
        idToken: tokens.idToken,
        accessToken: tokens.accessToken,
        user: {
          id: userInfo.data.user.id,
          email: userInfo.data.user.email,
          givenName: userInfo.data.user.givenName || "",
          familyName: userInfo.data.user.familyName || "",
          photo: userInfo.data.user.photo || undefined,
        },
      };
    } catch (error: any) {
      console.error("Google Sign-In Error Details (Android):", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      if (statusCodesLocal) {
        if (error.code === statusCodesLocal.SIGN_IN_CANCELLED) {
          if (__DEV__) {
            console.log("User cancelled Google sign-in");
          }
          return null;
        } else if (error.code === statusCodesLocal.IN_PROGRESS) {
          throw new Error("Sign-in already in progress");
        } else if (error.code === statusCodesLocal.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error("Google Play Services not available");
        }
      }
      throw new Error(`Failed to sign in with Google: ${error.message}`);
    }
  }

  /**
   * Initiates Apple Sign-In flow and returns credential information
   * @returns {Promise<AppleAuthCredential | null>} Apple credential information or null if failed
   * @throws {Error} If sign-in fails, is cancelled, or Apple Sign-In is unavailable
   */
  async signInWithApple(): Promise<AppleAuthCredential | null> {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAvailable) {
        throw new Error(ERROR_MESSAGES.APPLE_UNAVAILABLE);
      }

      console.log("Starting Apple Sign-In...");
      console.log("Platform:", Platform.OS);

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("Apple credential received:", {
        hasIdentityToken: !!credential.identityToken,
        hasAuthorizationCode: !!credential.authorizationCode,
        hasEmail: !!credential.email,
        hasUser: !!credential.user,
      });

      // Log the authorization token from Apple
      if (credential.authorizationCode) {
        console.log("Apple authorization token:", credential.authorizationCode);
      } else {
        console.log("No Apple authorization token received");
      }

      if (!credential.identityToken) {
        throw new Error(ERROR_MESSAGES.NO_IDENTITY_TOKEN);
      }

      return {
        identityToken: credential.identityToken,
        email: credential.email || undefined,
        authorizationCode: credential.authorizationCode ?? "",
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName || undefined,
              familyName: credential.fullName.familyName || undefined,
            }
          : undefined,
        user: credential.user,
      };
    } catch (error: any) {
      console.error("Apple Sign-In Error Details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
      });

      // Handle all cancellation scenarios
      // Apple returns different error codes for cancellation depending on the scenario
      if (
        error.code === "ERR_CANCELLED" || 
        error.code === "ERR_REQUEST_UNKNOWN" ||
        error.message?.includes("authorization attempt failed") ||
        error.message?.includes("cancelled") ||
        error.message?.includes("canceled")
      ) {
        if (__DEV__) {
          console.log("User cancelled Apple sign-in or authorization failed, returning null");
        }
        return null;
      } else {
        throw new Error(`Failed to sign in with Apple: ${error.message}`);
      }
    }
  }

  // Helper method to get current platform
  private getCurrentPlatform(): DevicePlatform {
    switch (Platform.OS) {
      case "ios":
        return DevicePlatform.Ios;
      case "android":
        return DevicePlatform.Android;
      case "web":
        return DevicePlatform.Web;
      default:
        return DevicePlatform.Web; // Default fallback
    }
  }

  // Helper: Detect Expo Go environment
  private isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  }

  // Helper method to create Google auth request
  public createGoogleAuthRequest(googleUser: GoogleUserInfo): ISocialAuthRequest {
    if (!googleUser.idToken) {
      throw new Error("Google ID token is required for authentication");
    }

    return {
      token: googleUser.idToken,
      provider: SocialAuthProvider.Google,
      authorizationCode: "",
      platform: this.getCurrentPlatform(),
      idToken: googleUser.idToken,
      accessToken: googleUser.accessToken,
      countryCode: this.getDeviceCountryCode(),
    };
  }

  // Helper method to create Apple auth request
  public createAppleAuthRequest(appleCredential: AppleAuthCredential): ISocialAuthRequest {
    if (!appleCredential.identityToken) {
      throw new Error("Apple identity token is required for authentication");
    }

    console.log("Creating Apple auth request with authorization code:", appleCredential);

    return {
      token: appleCredential.identityToken,
      provider: SocialAuthProvider.Apple,
      authorizationCode: appleCredential.authorizationCode, // Using user ID as authorization code for Apple
      platform: this.getCurrentPlatform(),
      idToken: appleCredential.identityToken,
      accessToken: appleCredential.identityToken,
      countryCode: this.getDeviceCountryCode(),
    };
  }

  // Social sign-in method - handles backend authentication
  private async socialSignIn(
    model: ISocialAuthRequest
  ): Promise<ApiResponsePayload<ILoginResponse>> {
    const endpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/social-signin`;
    
    if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
      throw new Error("API base URL not configured. Please set EXPO_PUBLIC_API_BASE_URL in your environment variables.");
    }

    const payload = {
      provider: String(model.provider).toLowerCase(),
      platform: String(model.platform).toLowerCase(),
      authorizationCode: model.authorizationCode ?? "",
      accessToken: model.accessToken ?? "",
      idToken: model.idToken ?? model.token,
      token: model.idToken ?? model.token,
      countryCode: model.countryCode ?? "",
    } as const;

    console.log("Sending social sign-in request to:", endpoint);
    console.log("Request payload:", {
      provider: payload.provider,
      platform: payload.platform,
      hasIdToken: !!payload.idToken,
      hasAccessToken: !!payload.accessToken,
      hasAuthCode: !!payload.authorizationCode,
    });

    return endpointService.Post<typeof payload, ILoginResponse>(endpoint, payload);
  }

  // Authenticates with backend and handles response mapping
  async authenticateWithBackend(
    authData: ISocialAuthRequest
  ): Promise<ISocialAuthResponse> {
    try {
      console.log(
        "got to Backend"
      )
      this.logAuthRequest(authData);
      const response = await this.socialSignIn(authData);
      if (__DEV__) {
        console.log('Social sign-in backend response:', response);
      }
      return this.mapResponseToAuthResponse(response as unknown);
    } catch (error: any) {
      console.error('Social sign-in backend error:', error);
      this.logAuthError(error);
      throw this.enhanceErrorMessage(error);
    }
  }

  // Maps backend response to ISocialAuthResponse supporting multiple shapes
  private mapResponseToAuthResponse(response: unknown): ISocialAuthResponse {
    const isObject = (val: unknown): val is Record<string, unknown> =>
      typeof val === 'object' && val !== null;

    type FlatAuthShape = {
      accessToken: string;
      refreshToken: string;
      expiry: string;
      expiresIn: number | string;
      idToken?: string;
      userGroups?: string[];
      userType?: string;
    };

    const isFlatAuthShape = (val: unknown): val is FlatAuthShape => {
      if (!isObject(val)) return false;
      return (
        typeof val.accessToken === 'string' &&
        typeof val.refreshToken === 'string' &&
        typeof val.expiry === 'string' &&
        (typeof val.expiresIn === 'number' || typeof val.expiresIn === 'string')
      );
    };

    // Case 1: Flat shape directly from backend
    if (isFlatAuthShape(response)) {
      const flat = response;
      return {
        accessToken: flat.accessToken,
        refreshToken: flat.refreshToken,
        expiry: flat.expiry,
        expiresIn: typeof flat.expiresIn === 'string' ? Number(flat.expiresIn) : flat.expiresIn,
        idToken: flat.idToken ?? '',
        userGroups: Array.isArray(flat.userGroups) ? flat.userGroups : [],
        userType: flat.userType ?? '',
      };
    }

    // Case 2: ApiResponsePayload<ILoginResponse> → tokens may be at response.data.data
    if (isObject(response) && 'data' in response) {
      const outerData = (response as { data?: unknown }).data;

      // If outerData already flat
      if (isFlatAuthShape(outerData)) {
        const flat = outerData;
        return {
          accessToken: flat.accessToken,
          refreshToken: flat.refreshToken,
          expiry: flat.expiry,
          expiresIn: typeof flat.expiresIn === 'string' ? Number(flat.expiresIn) : flat.expiresIn,
          idToken: flat.idToken ?? '',
          userGroups: Array.isArray(flat.userGroups) ? flat.userGroups : [],
          userType: flat.userType ?? '',
        };
      }

      // If outerData is ILoginResponse (with nested data)
      if (isObject(outerData) && 'data' in outerData) {
        const innerData = (outerData as { data?: unknown }).data;
        if (isFlatAuthShape(innerData)) {
          const flat = innerData;
          return {
            accessToken: flat.accessToken,
            refreshToken: flat.refreshToken,
            expiry: flat.expiry,
            expiresIn: typeof flat.expiresIn === 'string' ? Number(flat.expiresIn) : flat.expiresIn,
            idToken: flat.idToken ?? '',
            userGroups: Array.isArray(flat.userGroups) ? flat.userGroups : [],
            userType: flat.userType ?? '',
          };
        }
      }
    }

    // If API style response with non-success code, surface message
    if (isObject(response) && 'responseCode' in response) {
      const code = (response as any).responseCode;
      const message = (response as any).message ?? (response as any).detail ?? 'Unknown error';
      if (code !== '0' && code !== 0) {
        throw new Error(`Social sign-in failed: ${String(message)} (Code: ${String(code)})`);
      }
    }

    throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
  }

  // Logs authentication request details for debugging
  private logAuthRequest(authData: ISocialAuthRequest): void {
    console.log("Attempting social sign-in with data:", {
      provider: authData.provider,
      platform: authData.platform,
      hasToken: !!authData.token,
      tokenLength: authData.token?.length,
      hasAuthCode: !!authData.authorizationCode,
      authCodeLength: authData.authorizationCode?.length,
    });

    // Log the authorization code for Apple sign-in
    if (authData.provider === SocialAuthProvider.Apple && authData.authorizationCode) {
      console.log("Apple authorization code being sent to backend:", authData.authorizationCode);
    }
  }

  // validateResponse removed in favor of flexible mapper

  // Logs authentication errors for debugging
  private logAuthError(error: any): void {
    console.error("Social sign-in authentication error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      response: error.response,
      status: error.status,
      statusText: error.statusText,
      data: error.data,
    });
  }

  // Enhances error messages with context
  private enhanceErrorMessage(error: any): Error {
    // Re-throw with more context if it's already our custom error
    if (error.message.includes("Social sign-in failed") || 
        error.message.includes("Invalid response")) {
      return error;
    }

    // Handle network errors
    if (error.message.includes("network") || 
        error.message.includes("Network") ||
        error.code === "NETWORK_ERROR") {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Handle timeout errors
    if (error.message.includes("timeout") || error.code === "TIMEOUT") {
      return new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
    }

    // Generic error with more details
    return new Error(
      `Social sign-in failed: ${error.message}. Please check your network connection and try again.`
    );
  }

  /**
   * Complete Google Sign-In flow including backend authentication
   * @returns {Promise<ISocialAuthResponse>} Authentication response with tokens
   * @throws {Error} If any step of the authentication process fails
   */
  async signInWithGoogleComplete(): Promise<ISocialAuthResponse> {
    try {
      const googleUser = await this.signInWithGoogle();
      if (!googleUser) {
        throw new Error("Google sign-in failed - no user data received");
      }

      const authRequest = this.createGoogleAuthRequest(googleUser);
      return await this.authenticateWithBackend(authRequest);
    } catch (error: any) {
      console.error("Complete Google sign-in failed:", error.message);
      throw error;
    }
  }

  /**
   * Complete Apple Sign-In flow including backend authentication
   * @returns {Promise<ISocialAuthResponse>} Authentication response with tokens
   * @throws {Error} If any step of the authentication process fails
   */
  async signInWithAppleComplete(): Promise<ISocialAuthResponse> {
    try {
      const appleCredential = await this.signInWithApple();
      if (!appleCredential) {
        throw new Error("Apple sign-in failed - no credential data received");
      }

      const authRequest = this.createAppleAuthRequest(appleCredential);
      return await this.authenticateWithBackend(authRequest);
    } catch (error: any) {
      console.error("Complete Apple sign-in failed:", error.message);
      throw error;
    }
  }

  // Sign out from Google (Expo doesn't maintain Google sessions)
  async signOutGoogle(): Promise<void> {
    // With Expo AuthSession, there's no persistent session to clear
    // The user will need to sign in again next time
    console.log(
      "Google sign out completed (no persistent session with Expo AuthSession)"
    );
  }

  // Check if user is signed in with Google (always false with Expo AuthSession)
  async isGoogleSignedIn(): Promise<boolean> {
    // Expo AuthSession doesn't maintain persistent sessions
    return false;
  }

  // Get current Google user info (not available with Expo AuthSession)
  async getCurrentGoogleUser() {
    // Expo AuthSession doesn't maintain persistent sessions
    return null;
  }

  public async completeSocialSignup(payload: CompleteSocialSignupPayload): Promise<any> {
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/signin/user/social-signup`;
    const body = { model: payload };
    console.log('CompleteSocialSignup URL:', url);
    console.log('CompleteSocialSignup payload::::', payload);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('CompleteSocialSignup response:', data);
    if (!response.ok) throw new Error(data.message || 'Signup failed');
    return data;
  }
}

export default new SocialAuthService();
