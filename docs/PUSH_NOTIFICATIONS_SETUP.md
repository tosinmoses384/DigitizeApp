# Push Notifications Configuration

This folder will contain push notification configuration files for different environments.

## Placeholder Structure

```
push-notifications/
├── ios/
│   ├── AuthKey_preview.p8              # APNs auth key for preview/dev
│   ├── AuthKey_production.p8           # APNs auth key for production
│   └── apns-config.json                # APNs configuration metadata
└── android/
    ├── fcm-config-preview.json         # FCM config for preview/dev
    └── fcm-config-production.json      # FCM config for production
```

## Setup Instructions (Future)

### iOS (APNs)
1. Download `.p8` auth keys from Apple Developer Console
2. Place environment-specific keys in `ios/` folder
3. Update `app.config.js` with APNs configuration

### Android (FCM)
1. Configure FCM settings in Firebase Console
2. Download FCM configuration files
3. Place in `android/` folder with environment suffixes

---

**Status**: Placeholder structure - to be configured when implementing push notifications
