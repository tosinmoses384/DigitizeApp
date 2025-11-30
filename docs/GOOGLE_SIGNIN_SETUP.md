# Google Sign-In Platform Configuration Guide

⚠️ **IMPORTANT**: This documentation has been superseded by the new organized configuration structure.

## 🔄 **Migration Complete**

Your Google Services configuration has been migrated to an organized structure. Please refer to the updated documentation:

- **[`GOOGLE_SERVICES_SETUP.md`](./GOOGLE_SERVICES_SETUP.md)** - Updated setup guide with new structure
- **[`config/README.md`](./config/README.md)** - Configuration folder overview  
- **[`CONFIG_MIGRATION_COMPLETE.md`](./CONFIG_MIGRATION_COMPLETE.md)** - Migration summary

## 🎯 **Quick Migration Summary**

**Before** (Old structure):
```
digitize-app/
├── GoogleService-Info.plist           # Single file in root
├── google-services.json               # Single file in root
└── app.config.js                      # Hard-coded paths
```

**After** (New organized structure):
```
digitize-app/
├── config/
│   ├── google-services/
│   │   ├── ios/
│   │   │   ├── GoogleService-Info-preview.plist
│   │   │   └── GoogleService-Info-production.plist
│   │   └── android/
│   │       ├── google-services-preview.json
│   │       └── google-services-production.json
│   └── push-notifications/            # Ready for future use
├── app.config.js                      # Dynamic environment detection
└── scripts/validate-config.sh         # Validation tools
```

## ✅ **What's New**

1. **Environment Separation**: Different configs for preview vs production
2. **Organized Structure**: Service-specific folders for better organization  
3. **Future-Ready**: Prepared for push notifications and other services
4. **Validation Tools**: `npm run config:check` to verify setup
5. **Security**: Proper gitignore for sensitive configuration files

## 🚀 **Next Steps**

1. **Use New Documentation**: Follow [`GOOGLE_SERVICES_SETUP.md`](./GOOGLE_SERVICES_SETUP.md)
2. **Validate Setup**: Run `npm run config:check`
3. **Download Real Files**: Replace placeholder files with actual Google Cloud Console downloads

---

**Status**: ⚠️ **Deprecated** - Use [`GOOGLE_SERVICES_SETUP.md`](./GOOGLE_SERVICES_SETUP.md) instead

## 📋 Step-by-Step Setup Guide

### 1. Google Cloud Console Setup

#### Create iOS Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `digitize-app` 
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Choose **iOS** as application type
6. Set Bundle ID: `com.digitizeapp.digitizeapp` (matches your app.config.js)
7. Copy the generated iOS client ID

#### Create Android Client ID  
1. In the same Credentials page, click **Create Credentials > OAuth 2.0 Client IDs**
2. Choose **Android** as application type
3. Set Package name: `com.digitizeapp.digitizeapp`
4. Get SHA-1 certificate fingerprint:
   ```bash
   # For development (debug keystore)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # For production, use your release keystore
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
5. Add the SHA-1 fingerprint to the Android client configuration
6. Copy the generated Android client ID

#### Keep Web Client ID
Your existing web client ID `84323878545-i781s6sqis22kvp32es8vsguh68pg2td.apps.googleusercontent.com` can be kept for web platform.

### 2. Download Configuration Files

#### For Android
1. In Google Cloud Console, go to your Android client
2. Download the `google-services.json` file
3. Replace your current `google-services.json` with the new one
4. Make sure it includes the OAuth client configuration (not empty arrays)

#### For iOS  
1. In Google Cloud Console, go to your iOS client
2. Download the `GoogleService-Info.plist` file
3. Add it to your iOS project:
   ```bash
   # Copy to iOS folder
   cp GoogleService-Info.plist ios/digitizeappprev/
   ```

### 3. Update Environment Variables

Update your `.env.production` file with the new client IDs:

```bash
# Replace with your actual client IDs - all three are required
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=84323878545-i781s6sqis22kvp32es8vsguh68pg2td.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com  
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
```

**Note**: The legacy `EXPO_PUBLIC_GOOGLE_CLIENT_ID` has been discontinued. You must now use platform-specific client IDs.

### 4. Update App Configuration

Add Google service configuration to your `app.config.js`:

```javascript
// In your app.config.js, add to android section:
android: {
  package: getBundleIdentifier(),
  icon: "./assets/images/AppIconn.png",
  googleServicesFile: "./google-services.json", // Add this line
  permissions: [
    // ... existing permissions
  ],
},

// In your app.config.js, add to ios section:
ios: {
  bundleIdentifier: getBundleIdentifier(),
  googleServicesFile: "./GoogleService-Info.plist", // Add this line
  // ... rest of iOS config
},
```

### 5. Add Required Dependencies

Your current dependencies are good, but make sure you have:
- ✅ `expo-auth-session`
- ✅ `expo-web-browser` 
- ✅ `expo-crypto`

### 6. Authorized Redirect URIs Configuration

#### For Development (Expo Go)
Add these to ALL your Google OAuth clients (Web, iOS, Android):
```
https://auth.expo.io/@digitizeapp/digitize-app
```

#### For Production (Standalone builds)
Add these redirect URIs based on your app scheme:
```
digitize-app://oauth
com.digitizeapp.digitizeapp://oauth
```

### 7. Testing the Implementation

1. **Test with Development Build**:
   ```bash
   expo start --dev-client
   ```

2. **Test with Production Build**:
   ```bash
   eas build --profile production --platform ios
   eas build --profile production --platform android
   ```

### 8. Troubleshooting Common Issues

#### Invalid Client Error
- Verify client IDs match your environment variables
- Check bundle identifier matches Google Console configuration
- Ensure SHA-1 fingerprint is correct for Android

#### Redirect URI Mismatch
- Add both development and production redirect URIs to Google Console
- Verify app scheme in app.config.js matches redirect URI

#### Empty OAuth Client Arrays
- Re-download google-services.json after adding OAuth clients
- Ensure you created Android client (not just enabled Google Sign-In API)

## 🎯 Next Steps

1. **Create iOS and Android client IDs** in Google Cloud Console
2. **Download configuration files** (google-services.json and GoogleService-Info.plist)  
3. **Update environment variables** with new client IDs
4. **Test on all platforms** (iOS, Android, Web)

The updated code now properly handles platform-specific client IDs and should work correctly once you complete the Google Cloud Console setup.
