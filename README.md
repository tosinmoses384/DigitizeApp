# DigitizeApp - Fashion Marketplace Mobile Application

A comprehensive React Native mobile application built with Expo for a fashion marketplace platform that enables users to buy, sell, and manage their wardrobe digitally. This app combines e-commerce functionality with social features, AI-powered styling, and a complete wardrobe management system.

## 📱 Overview

**DigitizeApp** is a full-featured fashion marketplace mobile application that allows users to:

- **Buy & Sell**: Browse and purchase fashion items from other users, or list your own items for sale
- **Digital Wardrobe**: Digitize and organize your clothing collection in a personal digital wardrobe
- **Social Features**: Share outfits, follow other users, create posts, and interact with the community
- **AI Stylist**: Get AI-powered outfit suggestions and styling recommendations
- **Collections & Outfits**: Create and manage outfit collections with calendar planning
- **Messaging**: Real-time chat with buyers/sellers, shipping tracking, and order management
- **Payments**: Secure payment processing with Stripe integration
- **Multi-language Support**: Available in English, Arabic, Spanish, and French

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Routing**: Expo Router (file-based routing)
- **State Management**: 
  - Redux Toolkit for global state
  - Zustand for local component state
  - React Query (TanStack Query) for server state
- **UI/UX**: 
  - React Native Reanimated for animations
  - React Native Gesture Handler
  - Bottom Sheet components
  - Custom theming system
- **Backend Integration**: RESTful API with Axios
- **Authentication**: 
  - JWT-based authentication with refresh tokens
  - Google Sign-In
  - Apple Sign-In
  - Email/Phone OTP verification
- **Real-time Features**: WebSocket for chat and notifications
- **Payments**: Stripe React Native SDK
- **Image Processing**: 
  - Background removal
  - Image compression and optimization
  - Collage creation with Skia
- **Internationalization**: React Intl with formatjs
- **Analytics**: Vexo Analytics integration
- **Push Notifications**: Expo Notifications

### Project Structure

```
├── app/                          # Expo Router file-based routing
│   ├── (authenticated)/         # Protected routes requiring authentication
│   │   ├── (tabs)/              # Main tab navigation (Home, Wardrobe, Add, AI, Profile)
│   │   ├── chats/               # Messaging and chat functionality
│   │   ├── itemDetail/          # Item detail pages
│   │   ├── profileDetails/      # User profile management
│   │   └── ...                  # Various authenticated screens
│   ├── item/                    # Public item viewing
│   ├── post/                    # Public post viewing
│   ├── preloved/                # Preloved items section
│   ├── Auth.tsx                 # Authentication flow
│   ├── Login.tsx                # Login screen
│   ├── Signup.tsx               # Registration screen
│   └── ...                      # Other public screens
├── components/                   # Reusable UI components
│   ├── auth/                   # Authentication-related components
│   ├── buttons/                # Button components
│   ├── purchase/               # Purchase flow components
│   ├── wardrobe/               # Wardrobe management components
│   ├── ai-stylist/             # AI styling features
│   ├── collage/                # Collage creation tools
│   └── ...                     # Other component categories
├── services/                    # Business logic and API services
│   ├── api.ts                  # Main API client with interceptors
│   ├── features/               # Feature-specific services
│   │   ├── marketplace/        # Marketplace operations
│   │   ├── wardrobe-service/   # Wardrobe management
│   │   ├── order-service/      # Order processing
│   │   ├── shipping-service/   # Shipping management
│   │   ├── identity-service/   # Authentication
│   │   └── ...                 # Other feature services
│   └── http-client/            # HTTP client abstractions
├── hooks/                       # Custom React hooks
│   ├── use-auth/               # Authentication hooks
│   ├── use-wardrobe-items/     # Wardrobe data hooks
│   ├── use-purchase-flow/      # Purchase process hooks
│   └── ...                     # Other custom hooks
├── redux/                       # Redux store and slices
│   ├── slice/                  # Feature slices
│   └── store/                  # Store configuration
├── stores/                      # Zustand stores
├── providers/                  # React context providers
│   ├── AuthProvider.tsx        # Authentication context
│   ├── I18nProvider.tsx       # Internationalization
│   └── GlobalOfflineProvider.tsx # Offline state management
├── constants/                   # App constants, colors, styles
├── utils/                       # Utility functions
├── config/                      # Configuration files
│   ├── app-config.ts          # App configuration
│   ├── linking.ts             # Deep linking configuration
│   └── google-services/        # Google Services files (iOS/Android)
├── locales/                     # Translation files (i18n)
│   ├── en.json
│   ├── ar.json
│   ├── es.json
│   └── fr.json
├── assets/                      # Images, fonts, icons
├── docs/                        # Documentation
└── scripts/                     # Build and utility scripts
```

## 🚀 Key Features

### 1. Marketplace
- Browse fashion items with advanced filtering (category, size, color, brand, condition, material, price)
- Search functionality with autocomplete
- Item details with multiple images, seller information, reviews
- Make offers and negotiate prices
- Bundle purchases with discounts
- Favorites/wishlist functionality

### 2. Digital Wardrobe
- Upload and organize clothing items
- Tag items with metadata (category, brand, size, color, condition, material, season)
- Create and manage outfit collections
- Calendar-based outfit planning
- Wardrobe privacy settings
- Search and filter wardrobe items

### 3. Social Features
- User profiles with followers/following
- Create and share posts
- Stories feature (similar to Instagram)
- Like, comment, and interact with posts
- Follow other users and brands
- Activity feed and timeline

### 4. AI Stylist
- AI-powered outfit suggestions
- Virtual try-on interface
- Style recommendations based on wardrobe
- Outfit generation using AI

### 5. Messaging & Communication
- Real-time chat with WebSocket
- Message templates for common interactions
- Shipping tracking integration
- Order confirmation and updates
- Delivery confirmation activities
- Report issues functionality

### 6. Order Management
- Purchase flow with multiple delivery options
- Shipping address management
- Shipping provider selection
- Tracking information
- Order history and status
- Transaction history

### 7. Payments & Wallet
- Stripe payment integration
- Wallet balance management
- Payout account setup
- Withdrawal requests
- Transaction history
- Payment method management

### 8. Authentication & Security
- Email/Phone registration with OTP verification
- Google Sign-In integration
- Apple Sign-In integration
- JWT token-based authentication with automatic refresh
- Two-factor authentication support
- Password reset functionality
- Account security settings

### 9. Internationalization
- Multi-language support (English, Arabic, Spanish, French)
- RTL (Right-to-Left) support for Arabic
- Locale-aware formatting (dates, numbers, currency)
- Dynamic language switching

### 10. Additional Features
- Push notifications
- Deep linking and universal links
- Offline mode detection
- Image compression and optimization
- Background removal for product photos
- Collage creation tool
- Analytics integration
- Error tracking and reporting

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- EAS CLI (for building and deploying)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 1_MLH_sampleCode
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory (this file is gitignored):
   ```bash
   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com
   EXPO_PUBLIC_WEB_BASE_URL=https://your-web-url.com
   
   # Google Sign-In (Optional - for social authentication)
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
   
   # Analytics (Optional)
   EXPO_VEXO_API_KEY=your_vexo_api_key
   
   # Stripe (Optional - for payments)
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Configure Google Services** (Required for Google Sign-In)
   
   The app uses environment-specific Google Services files. See [`docs/GOOGLE_SERVICES_SETUP.md`](./docs/GOOGLE_SERVICES_SETUP.md) for detailed instructions.
   
   You need to place the following files:
   - `config/google-services/ios/GoogleService-Info-preview.plist`
   - `config/google-services/ios/GoogleService-Info-production.plist`
   - `config/google-services/android/google-services-preview.json`
   - `config/google-services/android/google-services-production.json`
   
   Validate your setup:
   ```bash
   npm run config:check
   ```

5. **Start the development server**
   ```bash
   npm start
   # or
   npm run start:dev-client
   ```

6. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (limited support)
   npm run web
   ```

## 📱 Building for Production

### Development Builds

```bash
# Android
npm run build:android-dev

# iOS
npm run build:ios-dev
```

### Production Builds

```bash
# Set production variant
export APP_VARIANT=production

# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

The app automatically selects the correct configuration files based on the `APP_VARIANT` environment variable:
- **Preview/Development**: Uses preview Google Services files, bundle ID `com.digitizeapp.digitizeapp`
- **Production**: Uses production Google Services files, bundle ID `com.digitizeapp.app`

## 🔧 Development

### Available Scripts

```bash
# Development
npm start                    # Start Expo dev server
npm run start:dev-client     # Start with dev client
npm run android              # Run on Android
npm run ios                  # Run on iOS
npm run web                  # Run on web

# Testing
npm test                     # Run tests
npm run lint                 # Run ESLint

# Configuration
npm run config:check         # Validate Google Services setup
npm run config:help          # Show configuration help

# Building
npm run build:android-dev    # Build Android development
npm run build:ios-dev        # Build iOS development

# Maintenance
npm run clean:android        # Clean Android build cache
npm run clean:ios            # Clean iOS build cache
npm run reset-project        # Reset project configuration
```

### Code Structure Guidelines

- **Components**: Reusable UI components in `components/`
- **Screens**: Route-based screens in `app/`
- **Services**: API and business logic in `services/`
- **Hooks**: Custom React hooks in `hooks/`
- **State Management**: 
  - Redux for global app state
  - Zustand for component-level state
  - React Query for server state
- **Styling**: Use the theme system from `constants/Colors.ts` and `constants/Styles.ts`

### Environment Configuration

The app supports multiple environments:
- **Development/Preview**: Default environment
- **Production**: Set `APP_VARIANT=production`

Each environment uses different:
- Bundle identifiers
- Google Services files
- API endpoints (via environment variables)
- App names

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Google Services Setup](./docs/GOOGLE_SERVICES_SETUP.md)** - Complete guide for Google Sign-In configuration
- **[Social Auth Setup](./docs/SOCIAL_AUTH_SETUP.md)** - Social authentication configuration
- **[Push Notifications Setup](./docs/PUSH_NOTIFICATIONS_SETUP.md)** - Push notification configuration
- **[JWT Refresh Setup](./docs/JWT_REFRESH_SETUP.md)** - JWT token management
- **[EAS Build Configuration](./docs/EAS_BUILD_CONFIGURATION.md)** - Build configuration guide
- **[Configuration Structure](./docs/CONFIG_STRUCTURE.md)** - Config folder organization

Additional documentation:
- **[Analytics Usage](./ANALYTICS_USAGE.md)** - Analytics integration guide
- **[Development Checklist](./DEVELOPMENT_CHECKLIST.md)** - Development workflow
- **[Coding Guidelines](./Coding.md)** - Code style and best practices

## 🔐 Security Considerations

### ⚠️ CRITICAL: Credentials & Secrets

**IMPORTANT**: This repository is configured for public use. The following files contain sensitive credentials and MUST be excluded from version control:

- `.env` files (environment variables) - ✅ Already in `.gitignore`
- `google-services.json` (root level - if exists) - ✅ Already in `.gitignore`
- **Google Services files in `config/google-services/`** - ⚠️ **CONTAINS API KEYS - Added to `.gitignore`**
- API keys and secrets

**⚠️ ACTION REQUIRED Before Making Repository Public:**

1. **Verify Google Services files are NOT committed:**
   ```bash
   git status
   # Ensure config/google-services/**/*.json and config/google-services/**/*.plist are not listed
   ```

2. **If files are already committed, remove them from git history:**
   ```bash
   git rm --cached -r config/google-services/
   git commit -m "Remove Google Services credential files"
   ```

3. **Create placeholder files (optional) for documentation:**
   ```bash
   # Create example/template files without real credentials
   touch config/google-services/.gitkeep
   ```

4. **Verify no credentials are hardcoded:**
   - Search for API keys: `grep -r "AIza" . --exclude-dir=node_modules`
   - Search for client IDs: `grep -r "apps.googleusercontent.com" . --exclude-dir=node_modules`
   - All sensitive data should be in environment variables

5. **Environment Variables:**
   - All API keys, secrets, and configuration should be in `.env` files
   - `.env` files are already in `.gitignore`
   - Never commit actual `.env` files

**Current Status:**
- ✅ `.env` files are gitignored
- ✅ `config/google-services/**/*.json` and `config/google-services/**/*.plist` are now gitignored
- ⚠️ **You must verify these files are not already committed to git history**

### Token Management

- JWT tokens are stored securely using `expo-secure-store`
- Automatic token refresh is implemented
- Tokens are automatically cleared on logout

## 🌍 Internationalization

The app supports multiple languages:
- English (en)
- Arabic (ar) - with RTL support
- Spanish (es)
- French (fr)

Translation files are located in `locales/`. To add a new language:
1. Create a new JSON file in `locales/`
2. Add translations following the existing structure
3. Update the language selector component

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Test files are located alongside their source files with the `.test.ts` or `.test.tsx` extension.

## 🐛 Troubleshooting

### Common Issues

1. **"Could not parse Expo config"**
   - Ensure Google Services files are properly configured
   - Run `npm run config:check` to validate

2. **OAuth/Social Sign-In errors**
   - Verify Google Services files match the bundle identifier
   - Check that client IDs are correctly set in environment variables
   - See [`docs/SOCIAL_AUTH_SETUP.md`](./docs/SOCIAL_AUTH_SETUP.md)

3. **Build failures**
   - Clean build cache: `npm run clean:android` or `npm run clean:ios`
   - Verify all dependencies are installed: `npm install`
   - Check EAS configuration in `eas.json`

4. **Token refresh issues**
   - Check network connectivity
   - Verify API base URL is correct
   - See [`docs/JWT_REFRESH_SETUP.md`](./docs/JWT_REFRESH_SETUP.md)

5. **Image upload/compression issues**
   - Check device storage permissions
   - Verify image picker permissions are granted
   - Check available device storage

For more detailed troubleshooting, refer to the documentation in the `docs/` folder.

## 🤝 Contributing

1. Follow the coding guidelines in [`Coding.md`](./Coding.md)
2. Ensure all tests pass
3. Run linting: `npm run lint`
4. Update documentation if needed
5. Follow the development checklist in [`DEVELOPMENT_CHECKLIST.md`](./DEVELOPMENT_CHECKLIST.md)


## 🔗 Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Note**: This is a sample codebase for demonstration purposes. Before deploying to production, ensure all security measures are in place, credentials are properly configured, and the app is thoroughly tested.

**Last Updated**: 2026
