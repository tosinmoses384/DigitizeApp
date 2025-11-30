// Detect build profile from EAS environment
// Check multiple environment variables to ensure proper production detection
const isProduction =
  process.env.APP_VARIANT === "production" ||
  process.env.EAS_BUILD_PROFILE === "production" ||
  process.env.NODE_ENV === "production";

// Helper function to get app name based on profile
const getAppName = () => {
  return !isProduction ? "digitizeapp-prev" : "digitizeapp";
};

// Helper function to get bundle identifier based on profile
const getBundleIdentifier = () => {
  return !isProduction ? "com.digitizeapp.digitizeapp" : "com.digitizeapp.app";
};

// Helper function to get iOS Google Services file based on profile
const getIOSGoogleServicesFile = () => {
  return !isProduction
    ? "./config/google-services/ios/GoogleService-Info-preview.plist"
    : "./config/google-services/ios/GoogleService-Info-production.plist";
};

// Helper function to get Android Google Services file based on profile
const getAndroidGoogleServicesFile = () => {
  return !isProduction
    ? "./config/google-services/android/google-services-preview.json"
    : "./config/google-services/android/google-services-production.json";
};

// Helper function to get linking prefixes based on environment
const getLinkingPrefixes = () => {
  const basePrefixes = [
    "digitize-app://", // Custom scheme for all environments
  ];

  if (isProduction) {
    return [
      ...basePrefixes,
      "com.digitizeapp.app://", // Production bundle ID scheme
      "https://digitizeapp.app", // Production universal links
    ];
  } else {
    // Preview/Development environment
    return [
      ...basePrefixes,
      "com.digitizeapp.digitizeapp://", // Preview bundle ID scheme
      "https://staging.digitizeapp.com", // Staging universal links
      "https://preview.digitizeapp.app", // Preview universal links (future)
    ];
  }
};

export default {
  expo: {
    updates: {
      url: "https://u.expo.dev/d9574698-801e-408b-a227-5ba38af40840",
      fallbackToCacheTimeout: 0,
    },
    // Force development client to false when running with EXPO_USE_DEV_CLIENT=false
    // developmentClient: isExpoGo ? false : undefined,
    name: getAppName(),
    slug: "digitize-app",
    newArchEnabled: true,
    version: "1.0.3",
    runtimeVersion: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/AppIconn.png",
    scheme: "digitize-app",
    userInterfaceStyle: "automatic",
    // Enhanced deep linking configuration
    linking: {
      prefixes: getLinkingPrefixes(), // Dynamic prefixes based on environment
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: getBundleIdentifier(),
      buildNumber: "28", // Set build number locally to ensure proper incrementation (updated for version 1.0.2)
      icon: "./assets/images/ios-app-icon.png",
      requireFullScreen: true,
      deviceFamily: [1], // 1 = iPhone only, 2 = iPad only, [1,2] = Universal
      googleServicesFile: getIOSGoogleServicesFile(), // Dynamic Google Sign-In configuration based on build variant
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
        "com.apple.developer.associated-domains": [
          "applinks:staging.digitizeapp.com",
          "applinks:digitizeapp.app",
          "applinks:preview.digitizeapp.app"
        ],
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "This app needs camera access to let you take photos of items you want to sell on the marketplace",
        NSPhotoLibraryUsageDescription:
          "DigitizeApp uses your photo library to let you upload images of your clothes and outfits to your digital wardrobe.",
        NSLocationWhenInUseUsageDescription:
          "This app needs location access to help you find nearby pickup points and calculate shipping costs",
        NSUserTrackingUsageDescription:
          "This app would like to track your activity to provide personalized recommendations and improve your shopping experience",
        UIRequiredDeviceCapabilities: ["armv7"],
        UIDeviceFamily: [1], // iPhone only
        UIRequiresFullScreen: true, // Force full screen mode
        UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
      },
    },
    android: {
      package: getBundleIdentifier(),
      icon: "./assets/images/AppIconn.png",
      googleServicesFile: getAndroidGoogleServicesFile(), // Dynamic Google Sign-In configuration based on build variant
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "staging.digitizeapp.com",
            },
            {
              scheme: "https",
              host: "digitizeapp.app",
            },
            {
              scheme: "https",
              host: "preview.digitizeapp.app",
            }
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-dev-client",
      "expo-video",
      "expo-router",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          ios: {
            deviceFamily: [1], // 1 = iPhone only, 2 = iPad only, [1,2] = Universal
          },
        },
      ],
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission:
            "This app would like to track your activity to provide personalized recommendations and improve your shopping experience",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "This app needs location access to help you find nearby pickup points and calculate shipping costs.",
          locationWhenInUsePermission:
            "This app needs location access to help you find nearby pickup points and calculate shipping costs.",
        },
      ],
      "expo-apple-authentication",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.replace('.apps.googleusercontent.com', '') || ''}`,
        },
      ],
      "react-native-compressor",
    ],
    experiments: {
      typedRoutes: true,
    },
    packagerOpts: {
      config: "metro.config.js",
      sourceExts: [
        "expo.ts",
        "expo.tsx",
        "expo.js",
        "expo.jsx",
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "wasm",
        "svg",
      ],
    },
    extra: {
      eas: {
        projectId: "d9574698-801e-408b-a227-5ba38af40840",
      },
      vexoApiKey: process.env.EXPO_VEXO_API_KEY || '',
    },
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
    },
    owner: "digitizeapp",
  },
};
