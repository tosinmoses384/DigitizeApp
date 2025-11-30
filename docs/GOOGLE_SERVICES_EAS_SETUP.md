# Google Services Configuration for EAS Build (Android & iOS)

This document explains how the Google Services configuration is handled for different build environments on both Android and iOS platforms.

## Problem

EAS Build was failing with the error:
```
File google-services.json is missing. 
The Google Services Plugin cannot function without it.
```

The Google Services Plugin expects:
- `google-services.json` to be located in `android/app/`
- `GoogleService-Info.plist` to be located in `ios/`

But our project stores environment-specific configuration files in `config/google-services/` with prefixed names.

## Solution

We've implemented an automated solution that copies the correct Google Services files for both platforms based on the build profile before the build starts.

### File Structure

```
config/
└── google-services/
    ├── android/
    │   ├── google-services-preview.json     # Preview environment
    │   ├── google-services-production.json  # Production environment
    │   └── google-services-original.json    # Backup/original
    └── ios/
        ├── GoogleService-Info-preview.plist     # Preview environment
        └── GoogleService-Info-production.plist  # Production environment
```

### How It Works

1. **Build Profile Detection**: Each EAS build profile sets an `APP_VARIANT` environment variable
2. **Prebuild Hook**: Before the build starts, `scripts/copy-google-services.js` runs
3. **File Copy**: The script copies the appropriate files to:
   - `android/app/google-services.json` (for Android)
   - `ios/GoogleService-Info.plist` (for iOS)
4. **Build Continues**: The Google Services Plugin finds the files and proceeds normally

### Build Profile Mapping

| Build Profile | APP_VARIANT | Android Source | iOS Source |
|---------------|-------------|----------------|------------|
| `preview` | `preview` | `google-services-preview.json` | `GoogleService-Info-preview.plist` |
| `production` | `production` | `google-services-production.json` | `GoogleService-Info-production.plist` |
| `development` | `development` | `google-services-preview.json` | `GoogleService-Info-preview.plist` |

### EAS Configuration

The `eas.json` file includes `prebuildCommand` for each profile:

```json
{
  "build": {
    "preview": {
      "prebuildCommand": "node scripts/copy-google-services.js",
      // ... other config
    },
    "production": {
      "prebuildCommand": "node scripts/copy-google-services.js", 
      // ... other config
    }
  }
}
```

## Local Testing

You can test the configuration locally:

```bash
# Test all variants
npm run test-google-services

# Test specific variant
APP_VARIANT=production npm run setup-google-services
```

## Scripts

- `scripts/copy-google-services.js` - Copies the correct file based on APP_VARIANT
- `scripts/test-google-services.js` - Tests all variants locally
- `npm run setup-google-services` - Manually run the copy script
- `npm run test-google-services` - Test all variants

## Important Notes

1. **Generated Files**: These files are generated and should not be committed to git:
   - `android/app/google-services.json`
   - `ios/GoogleService-Info.plist`
2. **Environment Files**: Keep the environment-specific files in `config/google-services/`
3. **Cross-Platform**: The script handles both Android and iOS automatically
4. **Graceful Fallback**: If iOS files don't exist, the script will warn but continue (useful for Android-only builds)
5. **Build Logs**: Check EAS build logs to confirm the script runs successfully

## Troubleshooting

If you still get missing configuration file errors:

1. **Check source files exist**:
   - `config/google-services/android/google-services-{variant}.json`
   - `config/google-services/ios/GoogleService-Info-{variant}.plist`
2. **Verify environment variable**: Ensure `APP_VARIANT` is set correctly in build profile
3. **Check build logs**: Look for script execution output in EAS build logs
4. **Validate prebuild command**: Ensure `prebuildCommand` is configured in `eas.json`
5. **Platform-specific issues**:
   - Android: Verify the JSON file is valid
   - iOS: Ensure the plist file has correct structure

## Adding New Environments

To add a new environment:

1. **Create configuration files**:
   - `config/google-services/android/google-services-{environment}.json`
   - `config/google-services/ios/GoogleService-Info-{environment}.plist`
2. **Update the script**: Add the mapping in `scripts/copy-google-services.js`
3. **Create build profile**: Add new profile in `eas.json` with appropriate `APP_VARIANT`

## Platform-Specific Notes

### Android
- File location: `android/app/google-services.json`
- Required for Firebase services on Android
- JSON format with project configuration

### iOS  
- File location: `ios/GoogleService-Info.plist`
- Required for Firebase services on iOS
- Plist format with project configuration
- Contains bundle identifier and API keys
