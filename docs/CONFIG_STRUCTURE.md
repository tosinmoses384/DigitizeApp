# Configuration Files Structure

This folder contains all external service configuration files organized by service type and environment.

## Folder Structure

```
config/
├── google-services/
│   ├── ios/
│   │   ├── GoogleService-Info-preview.plist      # iOS config for preview/dev
│   │   └── GoogleService-Info-production.plist   # iOS config for production
│   └── android/
│       ├── google-services-preview.json          # Android config for preview/dev
│       ├── google-services-production.json       # Android config for production
│       └── google-services-original.json         # Original file (reference)
├── push-notifications/                           # Future: APNs certificates, FCM configs
├── analytics/                                    # Future: Analytics configurations
└── README.md                                     # This file
```

## Environment-Based File Selection

The app automatically selects the correct configuration files based on the `APP_VARIANT` environment variable:

### Preview/Development (`APP_VARIANT != "production"`)
- **iOS**: `config/google-services/ios/GoogleService-Info-preview.plist`
- **Android**: `config/google-services/android/google-services-preview.json`
- **Bundle ID**: `com.digitizeapp.digitizeapp`

### Production (`APP_VARIANT = "production"`)
- **iOS**: `config/google-services/ios/GoogleService-Info-production.plist`
- **Android**: `config/google-services/android/google-services-production.json`
- **Bundle ID**: `com.digitizeapp.app`

## Security

🔒 **Important**: This entire `config/` folder is gitignored to prevent sensitive configuration data from being committed to version control.

## Future Expansions

This structure is designed to accommodate additional services:

### Push Notifications
```
config/push-notifications/
├── ios/
│   ├── AuthKey_preview.p8              # APNs auth key for preview
│   └── AuthKey_production.p8           # APNs auth key for production
└── android/
    └── fcm-config.json                 # FCM configuration
```

### Analytics & Monitoring
```
config/analytics/
├── mixpanel-config.json
├── amplitude-config.json
└── sentry-config.json
```

### Third-party Services
```
config/services/
├── stripe/
├── sendgrid/
└── aws/
```

## Setup Instructions

1. **Download configuration files** from your respective service consoles (Google Cloud, Apple Developer, etc.)
2. **Place files** in the appropriate environment folders
3. **Verify paths** in `app.config.js` match the file locations
4. **Test builds** for both preview and production environments

## File Naming Convention

- Use environment suffixes: `-preview`, `-production`
- Keep original service naming: `GoogleService-Info.plist`, `google-services.json`
- For reference files: add `-original` suffix

## Troubleshooting

### File Not Found Errors
- Verify files exist in correct folder structure
- Check file permissions (must be readable)
- Ensure paths in `app.config.js` are correct

### Wrong Environment Configuration
- Verify `APP_VARIANT` environment variable is set correctly
- Check that the right files are being selected for your build type

---

**Last Updated**: July 4, 2025
