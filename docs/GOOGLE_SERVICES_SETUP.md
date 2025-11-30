# Google Services Files Setup for Multiple Environments

Your app is now configured to use different Google Services files for preview/development and production builds.

## Required Files

You need to create **4 Google Services files** in the organized config structure:

### iOS Files
- `config/google-services/ios/GoogleService-Info-preview.plist` - For development/preview builds
- `config/google-services/ios/GoogleService-Info-production.plist` - For production builds

### Android Files  
- `config/google-services/android/google-services-preview.json` - For development/preview builds
- `config/google-services/android/google-services-production.json` - For production builds

## How It Works

The app automatically selects the correct files based on the `APP_VARIANT` environment variable:

- **Preview/Development**: `APP_VARIANT != "production"`
  - Uses `config/google-services/ios/GoogleService-Info-preview.plist` for iOS
  - Uses `config/google-services/android/google-services-preview.json` for Android
  - Bundle ID: `com.digitizeapp.digitizeapp`

- **Production**: `APP_VARIANT = "production"`
  - Uses `config/google-services/ios/GoogleService-Info-production.plist` for iOS  
  - Uses `config/google-services/android/google-services-production.json` for Android
  - Bundle ID: `com.digitizeapp.app`

## Setup Steps

### 1. Create Separate Google Cloud Projects (Recommended)
For better isolation, create separate projects for preview and production:
- `digitize-app-preview` 
- `digitize-app-production`

### 2. Configure OAuth Clients for Each Environment

#### Preview Environment
1. Go to Google Cloud Console for your preview project
2. Create iOS OAuth client with bundle ID: `com.digitizeapp.digitizeapp`
3. Create Android OAuth client with package name: `com.digitizeapp.digitizeapp`
4. Download `GoogleService-Info.plist` → rename to `GoogleService-Info-preview.plist` and place in `config/google-services/ios/`
5. Download `google-services.json` → rename to `google-services-preview.json` and place in `config/google-services/android/`

#### Production Environment  
1. Go to Google Cloud Console for your production project
2. Create iOS OAuth client with bundle ID: `com.digitizeapp.app`
3. Create Android OAuth client with package name: `com.digitizeapp.app`
4. Download `GoogleService-Info.plist` → rename to `GoogleService-Info-production.plist` and place in `config/google-services/ios/`
5. Download `google-services.json` → rename to `google-services-production.json` and place in `config/google-services/android/`

### 3. Verify Organized File Structure
```
config/
├── google-services/
│   ├── ios/
│   │   ├── GoogleService-Info-preview.plist
│   │   └── GoogleService-Info-production.plist
│   └── android/
│       ├── google-services-preview.json
│       ├── google-services-production.json
│       └── google-services-original.json        # Your original file (reference)
├── push-notifications/                         # Ready for future APNs/FCM setup
│   ├── ios/
│   └── android/
└── README.md                                   # Configuration documentation
```

### 4. Validate Your Setup
Use the built-in validation tools to check your configuration:
```bash
# Check configuration completeness
npm run config:check

# Get setup help
npm run config:help

# Run validation script directly
./scripts/validate-config.sh
```

### 4. Update Environment Variables
You'll need separate client IDs for each environment:

**.env (for preview/development)**
```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_preview_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_preview_ios_client_id.apps.googleusercontent.com  
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_preview_android_client_id.apps.googleusercontent.com
```

**.env.production**
```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_production_web_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_production_ios_client_id.apps.googleusercontent.com  
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_production_android_client_id.apps.googleusercontent.com
```

## Testing

### Preview Build
```bash
# This will use preview Google Services files
npx expo start --dev-client
# or
eas build --profile preview
```

### Production Build
```bash
# This will use production Google Services files
APP_VARIANT=production eas build --profile production
```

## Troubleshooting

### File Not Found Errors
- Ensure all 4 files exist in the project root with exact names
- Check file permissions (should be readable)

### OAuth Errors
- Verify bundle IDs match between Google Cloud Console and app.config.js
- Ensure SHA-1 fingerprints are correct for Android
- Check that redirect URIs are properly configured

### Environment Variable Issues
- Verify the correct .env file is being loaded for each build type
- Ensure all client IDs are properly set

## Current Status
✅ App configuration updated to support dynamic Google Services files  
✅ Organized folder structure created in `config/google-services/`  
✅ Validation tools and scripts added (`npm run config:check`)  
✅ Documentation and developer tools in place  
✅ Security setup with proper gitignore configuration  
❌ Missing actual Google Services files (you need to download these from Google Cloud Console)  
❌ Missing environment variables (update your .env files)

## Next Steps
1. **Download Real Configuration Files**: Replace placeholder files with actual downloads from Google Cloud Console
2. **Update Environment Variables**: Add the correct client IDs to your .env files
3. **Validate Setup**: Run `npm run config:check` to verify everything is working
4. **Test Both Environments**: Build and test both preview and production variants
