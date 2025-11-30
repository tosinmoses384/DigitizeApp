# EAS Build Configuration Guide

This document explains how the EAS (Expo Application Services) build system is configured in this project, including custom build workflows and Google Services integration.

## Overview

The project uses custom EAS build workflows located in `.eas/build/` to handle:
- **Google Services configuration** for different environments
- **Gradle optimizations** for Android builds
- **Platform-specific build requirements**
- **Multi-environment support** (development, preview, production)

## Build Workflow Files

### 📁 `.eas/build/` Directory Structure

```
.eas/build/
├── android-with-google-services.yml           # Main Android production builds
├── android-debug-with-google-services.yml     # Android debug builds
├── ios-with-google-services.yml               # Main iOS production builds
├── ios-simulator-with-google-services.yml     # iOS simulator builds
└── simple-with-google-services.yml            # Simple/basic builds
```

## 🤖 Android Build Workflow

### File: `android-with-google-services.yml`

This is the main Android build configuration that handles:

#### **Build Steps Overview:**

1. **Checkout** - Get the source code
2. **Google Services Setup (Pre-install)** - Copy environment-specific Google Services files
3. **Dependencies** - Install npm packages with authentication
4. **Google Services Setup (Post-install)** - Re-apply Google Services after dependencies
5. **Prebuild** - Generate native Android project
6. **Google Services Setup (Post-prebuild)** - Final Google Services configuration
7. **EAS Configuration** - Configure updates and credentials
8. **Gradle Optimizations** - Apply Gradle 8.13 performance settings
9. **Build** - Run the actual Android build
10. **Artifact Upload** - Upload build artifacts

#### **Google Services Integration:**

The build runs the Google Services setup **three times** to ensure configuration persists:

```yaml
# Pre-install: Initial setup
APP_VARIANT=${ eas.env.APP_VARIANT } node scripts/copy-google-services.js

# Post-install: After dependencies installation
APP_VARIANT=${ eas.env.APP_VARIANT } node scripts/copy-google-services.js

# Post-prebuild: After native project generation
APP_VARIANT=${ eas.env.APP_VARIANT } node scripts/copy-google-services.js
```

#### **Gradle 8.13 Optimizations:**

The build applies modern Gradle configurations for optimal performance:

```properties
# Modern Android build settings for Gradle 8.13
android.enableJetifier=true          # Legacy dependency support
android.useAndroidX=true             # Modern Android support library

# Performance optimizations for Gradle 8.13
# Note: Configuration cache is disabled due to React Native/Expo compatibility
org.gradle.configuration-cache=false # Disabled - incompatible with React Native/Expo
org.gradle.parallel=true            # Parallel task execution
org.gradle.caching=true             # Build caching for speed
```

**Why these settings?**
- **Configuration Cache**: **DISABLED** - React Native and Expo use external Node.js processes during configuration, which is incompatible with Gradle's configuration cache
- **Parallel Execution**: Runs independent tasks simultaneously
- **Build Caching**: Reuses outputs from previous builds when inputs haven't changed
- **Jetifier**: Ensures legacy dependencies work with AndroidX
- **AndroidX**: Modern Android support library (required for current React Native)

## 🍎 iOS Build Workflow

### File: `ios-with-google-services.yml`

Similar structure to Android but handles iOS-specific requirements:
- **GoogleService-Info.plist** configuration
- **iOS code signing** and provisioning profiles
- **Xcode build settings**

## 🔧 Environment Variables

### Required Environment Variables:

| Variable | Description | Values |
|----------|-------------|---------|
| `APP_VARIANT` | Determines which Google Services config to use | `development`, `preview`, `production` |

### How APP_VARIANT Works:

```javascript
// In scripts/copy-google-services.js
switch (appVariant) {
  case 'production':
    androidFileName = 'google-services-production.json';
    break;
  case 'preview':
    androidFileName = 'google-services-preview.json';
    break;
  case 'development':
    androidFileName = 'google-services-preview.json'; // Uses preview config
    break;
}
```

## 🛠️ Development Workflow

### For New Developers:

1. **Understand the Build Process:**
   - Each build automatically configures Google Services for the target environment
   - Gradle optimizations are applied automatically
   - No manual file copying required

2. **Running Builds:**
   ```bash
   # Preview build (uses preview Google Services)
   eas build --profile preview --platform android
   
   # Production build (uses production Google Services)
   eas build --profile production --platform android
   ```

3. **Environment Configuration:**
   - Ensure your EAS build profiles set the correct `APP_VARIANT`
   - Check `eas.json` for profile configurations

### Adding New Environments:

1. **Add Google Services files:**
   ```
   config/google-services/android/google-services-{new-env}.json
   config/google-services/ios/GoogleService-Info-{new-env}.plist
   ```

2. **Update the copy script:**
   ```javascript
   // In scripts/copy-google-services.js
   case 'new-env':
     androidFileName = 'google-services-new-env.json';
     iosFileName = 'GoogleService-Info-new-env.plist';
     break;
   ```

3. **Add EAS profile:**
   ```json
   // In eas.json
   "new-env": {
     "extends": "base",
     "env": {
       "APP_VARIANT": "new-env"
     }
   }
   ```

## 🚨 Troubleshooting

### Common Issues:

#### **Configuration Cache Incompatibility:**
- **Cause**: React Native and Expo use external Node.js processes during Gradle configuration
- **Solution**: Configuration cache must be disabled (`org.gradle.configuration-cache=false`)
- **Impact**: Builds will be slightly slower but will work reliably
- **Note**: This is a known limitation with React Native/Expo projects

#### **"Missing project_info object" Error:**
- **Cause**: Malformed `google-services.json` file
- **Solution**: Ensure the Google Services file has proper structure with `project_info` object
- **Check**: Verify files in `config/google-services/android/` are properly formatted

#### **"Google Services file not found" Error:**
- **Cause**: `APP_VARIANT` not set or incorrect
- **Solution**: Check EAS build profile has correct environment variable
- **Debug**: Look at build logs for Google Services setup steps

#### **Gradle Build Failures:**
- **Cause**: Incompatible Gradle settings
- **Solution**: Current configuration is optimized for Gradle 8.13
- **Note**: Don't upgrade to Gradle 9 without updating Expo/React Native

### Debug Commands:

```bash
# Test Google Services script locally
APP_VARIANT=preview node scripts/copy-google-services.js

# Check current Gradle version
cd android && ./gradlew --version

# Verify Google Services files exist
find . -name "google-services.json" -type f
```

## 📊 Build Performance

### Expected Performance with Current Configuration:

- **First Build**: ~10-15 minutes (depending on project size)
- **Subsequent Builds**: ~5-8 minutes (with configuration cache)
- **Cache Hit Rate**: ~70-80% for incremental changes

### Performance Monitoring:

Check build logs for:
```
Configuration cache is an incubating feature.
Reusing configuration cache.
BUILD SUCCESSFUL in 2m 30s
```

## 🔄 Maintenance

### Regular Maintenance Tasks:

1. **Update Google Services files** when Firebase configuration changes
2. **Review Gradle settings** when upgrading Expo SDK
3. **Monitor build times** and adjust cache settings if needed
4. **Update documentation** when adding new environments or workflows

### When to Update This Configuration:

- **Expo SDK upgrades** - May require Gradle setting adjustments
- **React Native upgrades** - Could affect Gradle compatibility
- **New environment additions** - Need to update build workflows
- **Performance issues** - May need to adjust cache/parallel settings

---

## 📚 Related Documentation

- [Google Services Setup](./GOOGLE_SERVICES_SETUP.md) - Configuration file setup
- [Google Services EAS Setup](./GOOGLE_SERVICES_EAS_SETUP.md) - EAS-specific setup
- [Config Structure](./CONFIG_STRUCTURE.md) - Overall project configuration

---

*Last Updated: August 2025*
*Gradle Version: 8.13*
*Expo SDK: 53.0.19*
*React Native: 0.79.5*
