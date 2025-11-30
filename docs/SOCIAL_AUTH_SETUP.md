# Social Authentication Setup Guide

This guide will help you set up Google and Apple Sign-In for your React Native Expo app with the updated authentication system.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Google Sign-In Setup](#google-sign-in-setup)
- [Apple Sign-In Setup](#apple-sign-in-setup)
- [Environment Variables](#environment-variables)
- [Backend Integration](#backend-integration)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Build Requirements](#build-requirements)
- [Security Best Practices](#security-best-practices)

## Prerequisites

The following packages are already installed and configured:
- `expo-apple-authentication` ~7.2.4
- `expo-auth-session` ~6.2.0
- `expo-crypto` ~14.1.5
- `expo-web-browser` ~14.2.0

## Architecture Overview

The social authentication system consists of several key components:

### Core Services
- **`SocialAuthService`** - Handles Google and Apple sign-in flows with backend integration
- **`useSocialAuth` hook** - React hook providing social authentication functionality
- **`useAuthManager` hook** - Centralized authentication state management
- **Error handling utilities** - Comprehensive error mapping and user-friendly messages

### Key Features
- ✅ Platform-specific Google OAuth client IDs (iOS/Android/Web)
- ✅ Automatic redirect URI generation with `AuthSession.makeRedirectUri()`
- ✅ Enhanced error handling with user-friendly messages
- ✅ CSRF protection with state parameter validation
- ✅ Comprehensive logging for debugging
- ✅ Integration with existing auth management system
- ✅ Toast notifications for user feedback

## Google Sign-In Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create separate projects for development and production (recommended)
3. Enable the **Google Sign-In API** for each project
4. Go to **APIs & Services > Credentials**

### 2. Create Platform-Specific OAuth 2.0 Credentials

The current implementation uses **platform-specific client IDs** for better security and proper OAuth flow:

#### For Each Environment (Preview/Production):

**iOS Application Client ID**
- Application type: iOS application
- Name: Your app name (iOS)
- Bundle ID: 
  - Preview: `com.digitizeapp.digitizeapp`
  - Production: `com.digitizeapp.app`

**Android Application Client ID**
- Application type: Android application  
- Name: Your app name (Android)
- Package name:
  - Preview: `com.digitizeapp.digitizeapp`
  - Production: `com.digitizeapp.app`
- SHA-1 certificate fingerprint: Get from your signing certificate

**Web Application Client ID** (Fallback)
- Application type: Web application
- Name: Your app name (Web)
- Authorized redirect URIs: Add your development and production redirect URIs

### 3. Google Services Files Integration

The app uses the organized Google Services configuration. Ensure you have:

```
config/
├── google-services/
│   ├── ios/
│   │   ├── GoogleService-Info-preview.plist
│   │   └── GoogleService-Info-production.plist
│   └── android/
│       ├── google-services-preview.json
│       └── google-services-production.json
```

> **Note**: The client IDs in your environment variables must match those in your Google Services files.

### 4. Redirect URI Configuration

The app automatically generates redirect URIs using `AuthSession.makeRedirectUri()`:

#### Development (Expo Go)
- Format: `https://auth.expo.io/@digitizeapp/digitize-app`
- Automatically handled by Expo

#### Production (Standalone Builds)
- Format: `digitize-app://oauth` or `com.digitizeapp.digitizeapp://oauth`
- Add these to your Google Cloud Console OAuth credentials

### 5. Advanced Features

- **CSRF Protection**: Automatic state parameter generation and validation
- **Token Exchange**: Secure authorization code to access token exchange
- **User Profile Fetching**: Automatic Google profile information retrieval
- **Error Handling**: Comprehensive error mapping with user-friendly messages

## Apple Sign-In Setup

### 1. Apple Developer Console Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Identifiers** and select your App ID
4. Enable **Sign In with Apple** capability
5. Configure the capability if needed

### 2. App Configuration

Apple Sign-In is automatically configured through the Expo plugin in `app.config.js`:

```javascript
ios: {
  entitlements: {
    "com.apple.developer.applesignin": ["Default"],
  },
},
plugins: [
  "expo-apple-authentication",
  // ... other plugins
],
```

### 3. Platform Requirements

- **iOS Only**: Apple Sign-In is only available on iOS 13+ devices
- **Physical Devices**: Production Apple Sign-In requires physical devices (not simulator)
- **No Environment Variables**: No additional configuration needed beyond the Expo plugin

### 4. Advanced Features

- **Identity Token**: Secure JWT token with user identity information
- **Authorization Code**: One-time code for backend verification
- **User Information**: Email and full name (when provided by user)
- **Privacy-First**: Users can hide their email address

## Environment Variables

The app uses platform-specific environment variables for better security and proper OAuth configuration.

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://staging-api.digitizeapp.com

# Web Base URL - Used for WebView content and universal links
EXPO_PUBLIC_WEB_BASE_URL=https://staging.digitizeapp.com

# WebView Allowed Origins - Comma-separated list of allowed origins for WebView security
EXPO_PUBLIC_WEBVIEW_ALLOWED_ORIGINS=https://digitizeapp.com,https://www.digitizeapp.com,https://staging.digitizeapp.com

# Google Sign-In Configuration (Platform-Specific Client IDs)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com

# App Configuration
EXPO_PUBLIC_APP_SCHEME=digitize-app

# Staging Basic Auth (for protected staging environments)
EXPO_PUBLIC_STAGING_BASIC_AUTH_USERNAME=your_username
EXPO_PUBLIC_STAGING_BASIC_AUTH_PASSWORD=your_password
```

### Environment-Specific Configuration

The app automatically selects the correct Google Services files based on `APP_VARIANT`:

- **Development/Preview**: Uses preview Google Services files
- **Production**: Uses production Google Services files

### Client ID Priority

The `SocialAuthService` automatically selects the appropriate client ID:

1. **iOS**: Uses `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
2. **Android**: Uses `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
3. **Web**: Uses `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

> **Important**: Each platform requires its specific client ID type from Google Cloud Console.

## Backend Integration

### API Endpoint

The social authentication endpoint:

```
POST /identity/v1/signin/user/social-signin
```

### Request Payload

The `SocialAuthService` sends this payload structure:

```typescript
interface ISocialAuthRequest {
  token: string;              // ID token (Google) or identity token (Apple)
  provider: SocialAuthProvider; // "Google" | "Apple" 
  authorizationCode: string;   // Access token (Google) or user ID (Apple)
  platform: DevicePlatform;   // "Ios" | "Android" | "Web"
}
```

### Response Format

Expected backend response:

```typescript
interface ApiResponsePayload<ILoginResponse> {
  responseCode: "0" | 0;  // Success codes
  message: string;
  data: {
    data: {
      accessToken: string;
      refreshToken: string;
      expiry: string;
      expiresIn: number;
      idToken: string;
      userGroups: string[];
      userType: string;
    }
  };
}
```

### Backend Implementation Requirements

1. **Token Verification**:
   - **Google**: Verify ID token using Google's verification endpoint
   - **Apple**: Verify JWT signature using Apple's public keys

2. **User Management**:
   - Check if user exists by email or provider ID
   - Create new user account if needed
   - Link social accounts to existing users

3. **Security Validation**:
   - Validate token expiration and audience
   - Verify token issuer matches expected provider
   - Implement rate limiting for authentication attempts

4. **Error Handling**:
   - Return proper error codes for invalid tokens
   - Handle expired or malformed tokens gracefully
   - Provide clear error messages for debugging

### Integration with Auth Manager

The social authentication integrates with the existing `useAuthManager` hook:

```typescript
// Automatic token storage and profile fetching
await saveToken(response.data.data.accessToken);

// Automatic navigation to authenticated screens
// Handled by useAuthManager's navigation logic
```

## Usage

### Using the SocialLoginButtons Component

The social authentication is already integrated into the `SocialLoginButtons` component:

```typescript
import { SocialLoginButtons } from '@components/SocialLoginButtons';

const LoginScreen = () => {
  return (
    <View>
      {/* Your other login components */}
      <SocialLoginButtons />
    </View>
  );
};
```

### Using the useSocialAuth Hook

For custom implementations:

```typescript
import { useSocialAuth } from '@hooks/use-social-auth';

const MyComponent = () => {
  const {
    signInWithGoogle,
    signInWithApple,
    loading,
    googleLoading,
    appleLoading,
    isAppleAvailable,
    isGoogleAvailable,
  } = useSocialAuth();

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      // User is signed in and token is saved
      console.log('Google sign-in successful');
    } else {
      console.error('Google sign-in failed:', result.error);
    }
  };

  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.success) {
      // User is signed in and token is saved
      console.log('Apple sign-in successful');
    } else {
      console.error('Apple sign-in failed:', result.error);
    }
  };

  return (
    <View>
      {/* Google Sign-In Button */}
      <TouchableOpacity 
        onPress={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        <Text>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Apple Sign-In Button (iOS only) */}
      {isAppleAvailable && (
        <TouchableOpacity 
          onPress={handleAppleSignIn}
          disabled={loading || appleLoading}
        >
          <Text>Sign in with Apple</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Error Handling

The system provides comprehensive error handling with user-friendly messages:

```typescript
// Error types are automatically mapped to user-friendly messages
const result = await signInWithGoogle();

if (!result.success) {
  // Errors are automatically displayed via toast notifications
  // No additional error handling needed in most cases
  console.log('Error:', result.error);
}
```

### Platform Availability

- **Google Sign-In**: Available on all platforms (iOS, Android, Web)
- **Apple Sign-In**: Available only on iOS 13+ devices

The hooks automatically handle platform detection and show appropriate buttons.

## Testing

### Development Testing

#### Google Sign-In
- **Expo Go**: ✅ Works with web browser OAuth flow
- **Development Build**: ✅ Works with native OAuth flow
- **Required**: Valid Google client ID in environment variables

#### Apple Sign-In  
- **Expo Go**: ❌ Not supported (requires native build)
- **Development Build**: ✅ Works on physical iOS devices
- **Simulator**: ⚠️ Limited functionality (production requires physical device)

### Production Testing Checklist

1. **Environment Configuration**:
   - [ ] Production Google Services files are configured
   - [ ] Production client IDs are set in environment variables
   - [ ] Bundle IDs match Google Cloud Console configuration

2. **OAuth Redirect URIs**:
   - [ ] Development redirect URIs added to Google Cloud Console
   - [ ] Production redirect URIs added after first build
   - [ ] Deep linking scheme matches app.config.js

3. **Build Testing**:
   - [ ] Test Google Sign-In on production build
   - [ ] Test Apple Sign-In on physical iOS devices
   - [ ] Verify backend token validation works
   - [ ] Test user creation and login flows

4. **User Experience**:
   - [ ] Toast notifications work correctly
   - [ ] Loading states display properly
   - [ ] Error messages are user-friendly
   - [ ] Navigation flows work after authentication

### Testing Commands

```bash
# Validate configuration
npm run config:check

# Build development version for testing
npm run build:ios-dev
npm run build:android-dev

# Check environment variables
npm run config:help
```

## Troubleshooting

### Common Google Sign-In Issues

#### 1. "Invalid client ID" or Configuration Errors
```
Error: Google [Platform] Client ID not configured
```

**Solutions**:
- Verify correct client ID is set in environment variables
- Ensure you're using platform-specific client IDs (not web client ID for mobile)
- Check that bundle ID matches Google Cloud Console configuration
- Validate Google Services files are correctly placed and named

#### 2. "Sign in cancelled" or "Sign in failed"
```
Error: Authentication failed: cancel
```

**Solutions**:
- Check network connectivity
- Verify Google Sign-In API is enabled in Google Cloud Console
- Ensure redirect URIs are properly configured
- Try clearing app data and signing in again

#### 3. "Network error" or Timeout Issues
```
Error: Network error during social sign-in
```

**Solutions**:
- Check internet connection
- Verify API base URL is correct in environment variables
- Check if backend endpoint is accessible
- Review backend logs for authentication failures

#### 4. "State parameter mismatch"
```
Error: State parameter mismatch - possible CSRF attack
```

**Solutions**:
- This indicates a security issue - ensure your app scheme is unique
- Check for interfering OAuth redirects
- Verify no other apps are using the same redirect URI

### Common Apple Sign-In Issues

#### 1. "Not available on this device"
```
Error: Apple Sign-In is not available on this device
```

**Solutions**:
- Apple Sign-In requires iOS 13+
- Only works on physical devices for production
- Simulator support is limited to development

#### 2. "Sign in was cancelled"
```
Error: ERR_CANCELLED
```

**Solutions**:
- User cancelled the sign-in process (normal behavior)
- No action needed - this is expected user behavior

#### 3. "Apple Authentication Failed"
```
Error: ERR_FAILED or ERR_INVALID_RESPONSE
```

**Solutions**:
- Ensure Apple Sign-In capability is enabled in Apple Developer Console
- Verify app bundle ID matches Apple Developer Console configuration
- Check that entitlements are properly configured in app.config.js

### Backend Integration Issues

#### 1. "Invalid response structure from backend"
```
Error: Social sign-in failed: Invalid response structure
```

**Solutions**:
- Verify backend returns correct response format
- Check responseCode is "0" or 0 for success
- Ensure data.data.accessToken is present in response

#### 2. "Token verification failed"
```
Error: Social sign-in failed: Invalid token
```

**Solutions**:
- Implement proper token verification on backend
- For Google: Use Google's token verification API
- For Apple: Verify JWT signature with Apple's public keys
- Check token expiration and audience

#### 3. "User creation failed"
```
Error: Social sign-in failed: User creation error
```

**Solutions**:
- Check backend user creation logic
- Verify email uniqueness constraints
- Handle existing user linking scenarios
- Review backend error logs

### General Debugging

#### Enable Debug Logging
The social auth service includes comprehensive logging:

```typescript
// Check console for detailed logs during sign-in process
// Logs include:
// - Client ID configuration status
// - Redirect URI generation
// - OAuth flow steps
// - Token exchange details
// - Backend communication
```

#### Validation Tools
```bash
# Check configuration
npm run config:check

# Validate Google Services files
npm run validate-config
```

#### Common Environment Issues
- **Mixed environments**: Ensure your .env matches your Google Services files
- **Missing files**: Run `npm run config:check` to verify all required files exist
- **Wrong bundle IDs**: Bundle ID in environment must match Google Cloud Console

### Error Code Reference

| Error Code | Provider | Description | Solution |
|------------|----------|-------------|----------|
| `SIGN_IN_CANCELLED` | Google | User cancelled | Normal behavior |
| `INVALID_CLIENT` | Google | Wrong client ID | Check environment variables |
| `NETWORK_ERROR` | Both | Connection issue | Check connectivity |
| `ERR_CANCELLED` | Apple | User cancelled | Normal behavior |
| `ERR_NOT_AVAILABLE` | Apple | iOS < 13 or simulator | Use physical device |
| `INVALID_TOKEN` | Backend | Token verification failed | Check backend implementation |

### Getting Help

1. **Check the logs**: All operations are logged with detailed information
2. **Validate configuration**: Use `npm run config:check`
3. **Review environment variables**: Ensure all required variables are set
4. **Test step by step**: Start with Google Services file validation
5. **Check backend**: Verify your backend properly handles the authentication endpoint

## Build Requirements

### Development Builds

```bash
# Create development builds with social auth
eas build --profile development --platform ios
eas build --profile development --platform android

# Or use npm scripts
npm run build:ios-dev
npm run build:android-dev
```

**Development Build Requirements**:
- Google Services files for preview environment
- Preview client IDs in environment variables
- Bundle ID: `com.digitizeapp.digitizeapp`

### Production Builds

```bash
# Create production builds
eas build --profile production --platform ios
eas build --profile production --platform android
```

**Production Build Requirements**:
- Production Google Services files
- Production client IDs in environment variables  
- Bundle ID: `com.digitizeapp.app`
- Production redirect URIs added to Google Cloud Console

### Environment-Specific Configuration

The build system automatically selects the correct configuration based on `APP_VARIANT`:

| Environment | APP_VARIANT | Bundle ID | Google Services Files |
|-------------|-------------|-----------|----------------------|
| Development | != "production" | `com.digitizeapp.digitizeapp` | preview files |
| Production | "production" | `com.digitizeapp.app` | production files |

### Pre-Build Checklist

- [ ] **Google Services Files**: All 4 files are present and correctly named
- [ ] **Environment Variables**: Platform-specific client IDs are configured
- [ ] **Bundle IDs**: Match between Google Cloud Console and app configuration
- [ ] **Redirect URIs**: Added to Google Cloud Console for target environment
- [ ] **Apple Developer Console**: Sign In with Apple capability enabled
- [ ] **Backend**: Social authentication endpoint is ready and tested

## Security Best Practices

### Client-Side Security

1. **Use Platform-Specific Client IDs**:
   ```bash
   # ✅ Good - Platform-specific
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
   
   # ❌ Avoid - Single web client ID for all platforms
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=single_web_client_id
   ```

2. **CSRF Protection**:
   - State parameter is automatically generated and validated
   - Redirect URIs are auto-generated with proper schemes
   - No manual intervention required

3. **Token Handling**:
   - ID tokens are sent directly to backend for verification
   - No long-term storage of social provider tokens
   - Access tokens are generated by your backend after verification

### Backend Security

1. **Always Verify Tokens**:
   ```typescript
   // ✅ Good - Verify tokens on backend
   const googleUser = await verifyGoogleToken(idToken);
   const appleUser = await verifyAppleToken(identityToken);
   
   // ❌ Never - Don't trust client data without verification
   const user = createUser(clientProvidedData);
   ```

2. **Token Verification Implementation**:
   - **Google**: Use Google's token verification endpoint
   - **Apple**: Verify JWT signature using Apple's public keys
   - Check token expiration, audience, and issuer

3. **User Management Security**:
   - Validate email uniqueness across all authentication methods
   - Implement proper user linking for existing accounts
   - Use strong session management after authentication

4. **Rate Limiting**:
   - Implement rate limiting on authentication endpoints
   - Monitor for suspicious authentication patterns
   - Log all authentication attempts for audit

### Environment Security

1. **Separate Environments**:
   - Use different Google Cloud projects for development and production
   - Different bundle IDs and client IDs for each environment
   - Separate backend environments with different secrets

2. **Secret Management**:
   - Store client IDs in environment variables, not in code
   - Use different .env files for different environments
   - Never commit production secrets to version control

3. **Certificate Security**:
   - Use proper SHA-1 fingerprints for Android OAuth
   - Keep signing certificates secure
   - Use different certificates for development and production

### Monitoring and Audit

1. **Authentication Logging**:
   - Log all authentication attempts (success and failure)
   - Monitor for unusual patterns or repeated failures
   - Track which social providers are used most

2. **Error Monitoring**:
   - Monitor social authentication error rates
   - Set up alerts for authentication service failures
   - Track user experience issues with social login

3. **Security Monitoring**:
   - Monitor for CSRF attacks (state parameter mismatches)
   - Track token verification failures on backend
   - Monitor for suspicious redirect URI usage

### Compliance Considerations

1. **Data Privacy**:
   - Only request necessary user information from social providers
   - Implement proper data retention policies
   - Provide clear privacy notices for social authentication

2. **Terms of Service**:
   - Comply with Google and Apple developer terms
   - Implement proper attribution for social sign-in buttons
   - Follow platform-specific design guidelines

3. **GDPR/Privacy**:
   - Implement user data deletion for social accounts
   - Provide data export functionality
   - Handle user consent for social authentication

## Additional Resources

### Documentation Links
- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/ios)
- [Apple Sign-In Documentation](https://developer.apple.com/documentation/sign_in_with_apple)
- [Expo Google Authentication](https://docs.expo.dev/guides/google-authentication/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

### Internal Documentation
- [`GOOGLE_SERVICES_SETUP.md`](./GOOGLE_SERVICES_SETUP.md) - Google Services files configuration
- [`CONFIG_STRUCTURE.md`](./CONFIG_STRUCTURE.md) - Project configuration overview
- [`hooks/use-auth-manager/README.md`](../hooks/use-auth-manager/README.md) - Authentication state management

### Validation Tools
```bash
# Check configuration
npm run config:check

# Validate Google Services files
npm run validate-config

# Get configuration help
npm run config:help
```

### Code Examples
- **Hook Implementation**: [`hooks/use-social-auth/index.tsx`](../hooks/use-social-auth/index.tsx)
- **Service Implementation**: [`services/features/social-auth/socialAuthService.ts`](../services/features/social-auth/socialAuthService.ts)
- **Component Example**: [`components/SocialLoginButtons/index.tsx`](../components/SocialLoginButtons/index.tsx)
- **Error Handling**: [`utils/socialAuthErrors.ts`](../utils/socialAuthErrors.ts)
