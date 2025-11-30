
# World-Class Coding Guide for the DigitizeApp App

> **🚨 CRITICAL NOTICE**: This guide is the single source of truth for all code contributions. Every line of code, every architectural decision, and every implementation must strictly adhere to these standards. **NO EXCEPTIONS.**

## 📋 Table of Contents

1. [Core Philosophy & Guiding Principles](#1-core-philosophy--guiding-principles)
2. [Architectural Blueprint](#2-architectural-blueprint)
3. [React Native Best Practices](#3-react-native-best-practices)
4. [Component Design & Implementation](#4-component-design--implementation)
5. [Coding Style & Conventions](#4-coding-style--conventions)
6. [Asynchronous Operations & API Services](#5-asynchronous-operations--api-services)
7. [Testing Philosophy](#6-testing-philosophy)
8. [Performance Best Practices](#7-performance-best-practices)
9. [Security & Data Handling](#8-security--data-handling)
10. [Accessibility (a11y)](#9-accessibility-a11y)
11. [Git Workflow & Version Control](#10-git-workflow--version-control)
12. [LLM-Specific Instructions & Anti-Hallucination Protocol](#11-llm-specific-instructions--anti-hallucination-protocol)
13. [Code Quality & Maintenance](#12-code-quality--maintenance)
14. [Code Review Guidelines](#13-code-review-guidelines)

---

## 1. Core Philosophy & Guiding Principles

This document outlines the architectural and stylistic standards for the DigitizeApp application. The primary goal is to build a scalable, maintainable, and high-performance React Native application that meets enterprise-grade standards. **Every contribution, whether from a human developer or an AI, must adhere to these principles without exception.**

-   **User-Centricity**: The end-user experience is our highest priority. Performance, responsiveness, and intuitive design are non-negotiable.
-   **Modularity & Decoupling**: Features should be built as modular, decoupled components. A change in one feature should have zero unexpected side effects on another. UI components should be stateless and unaware of business logic.
-   **Clarity Over Cleverness**: Code should be simple, readable, and easy to understand. Avoid overly complex abstractions or "clever" one-liners that obscure intent.
-   **Type Safety is Paramount**: We use TypeScript everywhere. `any` is strictly forbidden except in placeholder or transitional code that is explicitly marked with a `// TODO:` comment.
-   **Think Asynchronously**: The application is inherently asynchronous. All I/O operations (network, storage) must be handled without blocking the UI thread, using `async/await` and Promises.
-   **Automate Everything**: Linters, formatters, and tests are not optional. They are integral to the development process and ensure a consistent and reliable codebase.

---

## 2. Architectural Blueprint

Our architecture follows a clear separation of concerns, dividing the application into distinct layers.

### 2.1. Directory Structure

The directory structure is designed for scalability and discoverability.

```
/app/           # Routing and Screens (one file per route)
/assets/        # Static assets (images, fonts)
/components/    # Reusable, stateless UI components
/constants/     # Global constants (colors, styles, layout)
/contexts/      # React Context providers for global state
/hooks/         # Reusable React hooks with business logic
/services/      # API clients and business logic services
/stores/        # Zustand global state management
/utils/         # Helper functions (formatters, validators)
```

-   **`app`**: Strictly for screen layout and navigation wiring. Minimal to no business logic should reside here. Screens should be composed of components from `/components`.
-   **`components`**: The building blocks of our UI. Components must be **stateless** and receive all data and callbacks via props. They should be unaware of their context.
-   **`hooks`**: Encapsulate complex business logic, stateful logic, and interactions with services. This is where the "brains" of a feature live.
-   **`services`**: Handle all external interactions, primarily API calls. They are responsible for fetching, transforming, and sending data. They should not contain any UI-related code.
-   **`stores`**: For managing global, cross-feature state using Zustand.

### 2.2. State Management Strategy

We employ a hybrid state management approach.

-   **Local State (`useState`, `useReducer`)**: For state that is confined to a single component (e.g., form inputs, modal visibility).
-   **Feature State (`useCustomHook`)**: For state that is shared across a few components within a single feature. This state is managed within a custom hook in the `/hooks` directory.
-   **Global State (`Zustand`)**: For state that is truly global and needs to be accessed by multiple, unrelated features across the app (e.g., user authentication status, global upload queue). Zustand is preferred for its simplicity and performance.

**Zustand Best Practices**:
-   Create separate slices for different domains of global state (e.g., `createAuthSlice`, `createUploadSlice`).
-   Use memoized selectors to prevent unnecessary re-renders in components.
-   Actions must be clearly defined and should be the only way to modify the state.

## 3. React Native Best Practices

This section outlines the essential best practices for developing high-quality React Native applications that are performant, maintainable, and scalable, following the latest industry standards as of 2024.

### 3.1. Performance Optimization

- **Component Optimization**:
  - Use `React.memo()` with custom comparison functions for functional components to prevent unnecessary re-renders.
  - Implement `useCallback` for all callback props and `useMemo` for expensive calculations or derived state.
  - Avoid inline objects and functions in render methods; extract them as constants or memoize them.
  - Use the `useEffect` dependency array correctly to prevent unnecessary effect runs.

- **List Optimization**:
  - Always implement `keyExtractor` with stable, unique keys for `FlatList` and `SectionList`.
  - Use `getItemLayout` for fixed-height items to skip measurement and improve scrolling performance.
  - Fine-tune `windowSize`, `maxToRenderPerBatch`, and `updateCellsBatchingPeriod` for optimal list performance.
  - Implement `onEndReached` and `onEndReachedThreshold` for infinite scrolling.
  - Use `removeClippedSubviews` with caution; profile performance as it may degrade on some Android devices.
  - Consider `FlashList` from Shopify for better performance with complex lists.

- **Image Optimization**:
  - Use `resizeMode` appropriately based on content requirements.
  - Implement progressive image loading with low-quality image placeholders (LQIP).
  - Use `prefetch` for images that will be viewed soon, especially in carousels or galleries.
  - Consider using `react-native-fast-image` for advanced caching and priority-based loading.
  - Implement proper image sizing to avoid layout shifts and memory issues.
  - Use WebP format for better compression and faster loading times.
  - Implement responsive image sizing using `PixelRatio` and `Dimensions` API.

- **Hermes Engine**:
  - Enable Hermes JavaScript engine for improved startup time and reduced memory usage.
  - Configure ProGuard rules for optimal code shrinking and obfuscation.
  - Use RAM bundles for better initial load performance.

- **JavaScript Thread Optimization**:
  - Move heavy computations to native threads using `InteractionManager` or `react-native-worklets-core`.
  - Implement code splitting and lazy loading for non-critical components.
  - Use `requestIdleCallback` for non-urgent background tasks.

- **Memory Management**:
  - Implement proper cleanup in `useEffect` hooks to prevent memory leaks.
  - Use `useRef` for mutable values that shouldn't trigger re-renders.
  - Profile memory usage with Xcode Instruments and Android Profiler regularly.
  - Implement proper image caching and cleanup strategies.
  - Use `recyclerlistview` for very large lists with dynamic content.

### 3.2. Navigation

- **Navigation Architecture**:
  - Use React Navigation as the primary navigation library (v7+).
  - Implement a type-safe navigation system using TypeScript generics.
  - Structure navigation to support deep linking and universal links.
  - Implement proper authentication flows with navigation state persistence.

- **Performance Optimization**:
  - Use dynamic imports with `React.lazy()` and `Suspense` for route-based code splitting.
  - Implement preloading strategies for critical screens.
  - Use `useFocusEffect` for data refetching and side effects.
  - Optimize tab navigation with `lazy: true` and `unmountOnBlur` where appropriate.

- **Navigation Patterns**:
  - Implement proper back button handling for Android.
  - Use navigation events for analytics and tracking.
  - Implement proper deep linking with fallback screens.
  - Handle navigation state persistence across app restarts.

- **Gesture Navigation**:
  - Implement smooth gesture-based navigation.
  - Customize transition animations for better UX.
  - Handle edge cases with gesture response distance and velocity.

### 3.4. Modal Management & Transitions (🚨 CRITICAL)

**Modal Transition Pattern** - This pattern is **MANDATORY** for all modals that trigger other modals or navigations. Failure to follow this pattern will result in **UI freezing and race conditions**.

#### The Problem: Modal Stacking Race Condition

When a modal action immediately opens another modal or navigates, the animations conflict, causing:
- ❌ UI freezing (app becomes unresponsive)
- ❌ Visual glitches and jank
- ❌ Animation stuttering
- ❌ State management issues

**Example of BROKEN code:**
```typescript
// ❌ WRONG - This will freeze the UI!
const handleAddOutfit = () => {
  setShowActionModal(false);     // Close first modal
  setShowSelectionModal(true);   // Immediately open second modal
  // Race condition! Second modal tries to open while first is still closing
};
```

#### The Solution: onCloseComplete Callback Pattern

Always use the `onCloseComplete` callback to sequence modal transitions. This ensures the first modal's closing animation completes before the next action.

**Implementation Steps:**

1. **Add `onCloseComplete` prop to your modal component:**
```typescript
interface MyActionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;  // ✅ Add this
  onAction1: () => void;
  onAction2: () => void;
}
```

2. **Track pending actions with state:**
```typescript
const MyActionModal: React.FC<MyActionModalProps> = ({
  isVisible,
  onClose,
  onCloseComplete,
  onAction1,
  onAction2,
}) => {
  // Track which action to execute after modal closes
  const [pendingAction, setPendingAction] = useState<'action1' | 'action2' | null>(null);

  // When user clicks an action:
  // 1. Store which action to execute
  // 2. Close the modal (triggers animation)
  const handleAction1 = useCallback(() => {
    setPendingAction('action1');
    onClose();
  }, [onClose]);

  const handleAction2 = useCallback(() => {
    setPendingAction('action2');
    onClose();
  }, [onClose]);

  // 3. After modal closes completely, execute the action
  const handleCloseComplete = useCallback(() => {
    if (pendingAction === 'action1') {
      onAction1();
    } else if (pendingAction === 'action2') {
      onAction2();
    }
    
    setPendingAction(null);
    
    if (onCloseComplete) {
      onCloseComplete();
    }
  }, [pendingAction, onAction1, onAction2, onCloseComplete]);

  return (
    <NewBottomModal
      isShow={isVisible}
      onClose={onClose}
      onCloseComplete={handleCloseComplete}  // ✅ Pass the callback
    >
      {/* Modal content */}
    </NewBottomModal>
  );
};
```

3. **In the parent component, safely open next modal:**
```typescript
// ✅ CORRECT - Action is called AFTER first modal closes
const handleAction = useCallback(() => {
  // This is called by onCloseComplete, so first modal is fully closed
  // Safe to open next modal now!
  setShowNextModal(true);
}, []);

<MyActionModal
  isVisible={showActionModal}
  onClose={() => setShowActionModal(false)}
  onAction1={handleAction}
  onAction2={handleOtherAction}
/>
```

#### Real-World Example

See these reference implementations:
- `modals/CollectionActionsModal.tsx` - Perfect example of the pattern
- `modals/OutfitCardActionModal.tsx` - Implements the pattern correctly
- `modals/PlanActionSheetModal.tsx` - Shows multi-modal sequencing

#### Alternative Pattern: setTimeout (Less Preferred)

If `onCloseComplete` is not available, use `setTimeout` with a 300-400ms delay:
```typescript
const handleAction = () => {
  onClose();
  setTimeout(() => {
    // Delay allows close animation to complete
    setShowNextModal(true);
  }, 350);
};
```

⚠️ **Warning**: This is less reliable and should only be used as a fallback. The callback pattern is always preferred.

#### Testing Checklist

When implementing modal transitions, verify:
- [ ] Modal closes smoothly without UI freezing
- [ ] Next modal/screen opens only after first modal is fully closed
- [ ] No visual glitches or animation stuttering
- [ ] Works on both iOS and Android
- [ ] No state management race conditions
- [ ] Proper cleanup if user dismisses modal before action executes

#### Code Review Enforcement

**Reviewers must reject any PR that:**
- Opens a modal/navigation immediately after closing another modal without proper sequencing
- Does not use `onCloseComplete` or `setTimeout` for modal transitions
- Exhibits UI freezing during modal interactions

This pattern is **non-negotiable** and must be applied everywhere in the codebase.

### 3.5. Styling & Theming

- **Style Architecture**:
  - Use StyleSheet.create() for all styles to enable optimizations.
  - Implement a design system with reusable style tokens.
  - Use a theme provider for consistent theming across the app.
  - Implement dark/light mode support with system preference detection.

- **Performance-Centric Styling**:
  - Avoid inline styles and complex style calculations in render.
  - Use `useWindowDimensions` instead of `Dimensions.get()` for responsive layouts.
  - Implement platform-specific optimizations using `Platform.select()`.
  - Use `PixelRatio` for pixel-perfect designs across devices.

- **Component Styling**:
  - Create reusable styled components with `styled-components` or `restyle`.
  - Implement responsive layouts using flexbox and percentage-based dimensions.
  - Use React Native's `PixelRatio` for consistent border widths and shadows.
  - Optimize style inheritance and composition.

- **Accessibility in Styling**:
  - Ensure sufficient color contrast (minimum 4.5:1 for normal text).
  - Support dynamic type scaling for text.
  - Implement proper touch targets (minimum 44x44 points).
  - Test with system font size and display zoom settings.

- **Animation Performance**:
  - Use `useNativeDriver: true` for animations when possible.
  - Implement gesture-based animations with `react-native-reanimated`.
  - Use `InteractionManager` for scheduling animations after navigation.
  - Implement skeleton loaders for smooth content loading states.


### 3.6. Security

- **Data Protection**:
  - Use `expo-secure-store` or `@react-native-community/async-storage` with encryption for sensitive data.
  - Implement biometric authentication for accessing sensitive features.
  - Use Android's EncryptedSharedPreferences and iOS Keychain Services for platform-specific secure storage.
  - Never log sensitive information (tokens, PII) in development or production.
  - Implement proper session management with secure token storage and refresh token rotation.

- **Network Security**:
  - Enforce HTTPS with TLS 1.2+ for all network communications.
  - Implement certificate pinning using `react-native-cert-pinner` or similar.
  - Use SSL certificate transparency to detect fraudulent certificates.
  - Implement network security configuration for Android (network_security_config.xml).
  - Use App Transport Security (ATS) on iOS with proper exceptions.

- **Code Security**:
  - Obfuscate JavaScript bundle using ProGuard/R8 for Android and Hermes for both platforms.
  - Disable developer menu and debugging in production builds.
  - Implement code integrity checks to detect tampering.
  - Use environment variables for sensitive configuration (never hardcode).
  - Implement proper error handling that doesn't leak sensitive information.

- **Authentication & Authorization**:
  - Implement OAuth 2.0 with PKCE for authentication flows.
  - Use short-lived access tokens with secure refresh tokens.
  - Implement proper token storage and automatic token refresh.
  - Use biometric authentication for sensitive operations.
  - Implement proper session timeout and re-authentication flows.

- **Input Validation**:
  - Validate all user inputs on both client and server sides.
  - Sanitize all data before rendering to prevent XSS attacks.
  - Use parameterized queries to prevent SQL injection.
  - Implement rate limiting and request validation.

### 3.7. Internationalization (i18n) & Localization

- **Implementation**:
  - Use `react-i18next` or `i18n-js` with TypeScript support.
  - Store all user-facing strings in JSON translation files.
  - Implement language detection with fallback to device settings.
  - Support dynamic language switching without app restart.

- **RTL Support**:
  - Implement proper RTL (Right-to-Left) layout support.
  - Test all UI components in both LTR and RTL modes.
  - Use `I18nManager` for programmatic RTL handling.
  - Ensure proper text alignment and layout mirroring.

- **Localization Best Practices**:
  - Support locale-specific number, date, and time formatting.
  - Handle pluralization and gender-specific translations.
  - Account for text expansion/contraction in different languages.
  - Test with long strings and special characters.
  - Support locale-specific assets (images, fonts) when necessary.

- **Accessibility in i18n**:
  - Ensure translated content maintains accessibility standards.
  - Support dynamic type scaling in all languages.
  - Test screen readers with different languages.
  - Consider cultural differences in color meanings and symbols.

### 3.8. Accessibility (a11y)

- **Semantic Markup**:
  - Use semantic components (`<Button>`, `<Link>`, etc.) instead of generic `<View>` for interactive elements.
  - Implement proper heading hierarchy (`h1`-`h6`) using `accessibilityRole="header"` and `accessibilityLevel`.
  - Use `accessibilityHint` to provide additional context when needed, but don't be redundant with `accessibilityLabel`.
  - Implement proper form labels and error messages with `accessibilityLabelledBy`.

- **Screen Readers**:
  - Test all interactive elements with both VoiceOver (iOS) and TalkBack (Android).
  - Implement proper focus management for modals, dialogs, and navigation.
  - Use `accessibilityLiveRegion` for dynamic content updates.
  - Implement proper grouping of related elements with `accessibilityElementsHidden` and `importantForAccessibility`.

- **Visual Accessibility**:
  - Ensure minimum touch target size of 44x44 points for all interactive elements.
  - Support Dynamic Type for text scaling (use relative units for font sizes).
  - Maintain sufficient color contrast (minimum 4.5:1 for normal text, 3:1 for large text).
  - Don't rely solely on color to convey information.
  - Support system-wide accessibility settings (bold text, reduce motion, etc.).

- **Navigation & Interaction**:
  - Ensure all functionality is available via keyboard and screen reader.
  - Implement proper focus management and keyboard navigation.
  - Provide visual feedback for all interactive elements.
  - Support system-wide accessibility shortcuts.

- **Testing & Validation**:
  - Use the Accessibility Inspector in Xcode and Accessibility Scanner for Android.
  - Test with screen readers and keyboard navigation.
  - Include users with disabilities in usability testing.
  - Validate against WCAG 2.1 AA standards.

### 3.9. Environment Configuration & Build Process

- **Environment Management**:
  - Use `react-native-config` with TypeScript support for environment variables.
  - Implement environment-specific configuration files (`.env.development`, `.env.staging`, `.env.production`).
  - Never commit sensitive information to version control (use `.gitignore`).
  - Use CI/CD variables for sensitive data in production builds.

- **Build Optimization**:
  - Enable Hermes JavaScript engine for both iOS and Android.
  - Configure ProGuard/R8 for code shrinking and obfuscation.
  - Use App Bundle (.aab) for Android to reduce download size.
  - Implement code splitting and dynamic imports.
  - Optimize assets and resources (WebP, vector drawables).

- **Release Management**:
  - Implement proper versioning (semantic versioning).
  - Use fastlane for automated deployments.
  - Set up beta testing with TestFlight and Play Console.
  - Implement phased rollouts for production releases.
  - Monitor crash reports and performance metrics.

- **Development Experience**:
  - Configure hot reloading and fast refresh.
  - Set up proper source maps for debugging.
  - Implement development-only features (Reactotron, Flipper plugins).
  - Use environment variables to enable/disable features.

### 3.10. Monitoring & Analytics

- **Crash Reporting**:
  - Integrate Sentry or Crashlytics for crash reporting.
  - Log non-fatal errors and warnings with appropriate severity levels.
  - Implement proper error boundaries to prevent app crashes.
  - Set up real-time alerts for critical issues.

- **Performance Monitoring**:
  - Use React Native Performance Monitor for real-time performance insights.
  - Track key metrics: app startup time, screen transitions, and JavaScript thread performance.
  - Monitor memory usage and identify memory leaks.
  - Track and optimize frame drops (jank) for smooth UI.
  - Implement custom performance markers for critical user journeys.

- **Analytics & User Behavior**:
  - Track user interactions and feature usage.
  - Monitor conversion funnels and user flows.
  - Implement A/B testing for key features.
  - Respect user privacy and implement proper consent management.
  - Comply with GDPR, CCPA, and other relevant regulations.

- **Continuous Improvement**:
  - Set up regular performance audits.
  - Monitor app size and optimize dependencies.
  - Track and reduce time-to-interactive (TTI).
  - Implement progressive loading for better perceived performance.
  - Regularly update dependencies to benefit from performance improvements.

By following these comprehensive best practices, we ensure our React Native applications are performant, accessible, secure, and provide an excellent user experience across all platforms and devices.

---

## 4. Component Design & Implementation

-   **Functional Components Only**: All components must be functional components using React Hooks. Class components are forbidden.
-   **Props over State**: Components should be as stateless as possible. Lift state up to the parent screen or a custom hook.
-   **Clear Prop Interfaces**: Every component must have a well-defined TypeScript interface for its props.
-   **Separation of Concerns**: Separate presentational components from container components (which are typically screens or custom hooks).

### React useEffect Guidelines

**CRITICAL**: Before using `useEffect`, read: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

#### **When NOT to Use useEffect**

**❌ DON'T use useEffect for:**

1. **Transforming data for rendering**
```typescript
// ❌ BAD: Unnecessary useEffect
const UserProfile = ({ user }) => {
  const [displayName, setDisplayName] = useState('');
  
  useEffect(() => {
    setDisplayName(`${user.firstName} ${user.lastName}`);
  }, [user]);
  
  return <Text>{displayName}</Text>;
};

// ✅ GOOD: Calculate during render
const UserProfile = ({ user }) => {
  const displayName = `${user.firstName} ${user.lastName}`;
  return <Text>{displayName}</Text>;
};
```

2. **Handling user events**
```typescript
// ❌ BAD: Using useEffect for user interaction
const Button = ({ onPress }) => {
  useEffect(() => {
    // This is wrong - use event handlers instead
  }, []);
  
  return <TouchableOpacity onPress={onPress} />;
};

// ✅ GOOD: Direct event handling
const Button = ({ onPress }) => {
  return <TouchableOpacity onPress={onPress} />;
};
```

3. **Resetting state when props change**
```typescript
// ❌ BAD: useEffect to reset state
const Form = ({ userId }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    setFormData({}); // Reset when userId changes
  }, [userId]);
  
  return <FormInputs data={formData} />;
};

// ✅ GOOD: Use key prop or calculate during render
const Form = ({ userId }) => {
  const [formData, setFormData] = useState({});
  
  return <FormInputs key={userId} data={formData} />;
};
```

4. **Updating state based on props/state changes**
```typescript
// ❌ BAD: useEffect for derived state
const ProductList = ({ products, filter }) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  useEffect(() => {
    setFilteredProducts(products.filter(p => p.category === filter));
  }, [products, filter]);
  
  return <FlatList data={filteredProducts} />;
};

// ✅ GOOD: Calculate during render
const ProductList = ({ products, filter }) => {
  const filteredProducts = products.filter(p => p.category === filter);
  return <FlatList data={filteredProducts} />;
};
```

#### **When TO Use useEffect**

**✅ DO use useEffect for:**

1. **Synchronizing with external systems (APIs)**
```typescript
// ✅ GOOD: API synchronization
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await userService.getUser(userId);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  if (loading) return <LoadingSpinner />;
  return <UserDetails user={user} />;
};
```

2. **Setting up subscriptions or listeners**
```typescript
// ✅ GOOD: Event listener setup
const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    const subscription = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High },
      (newLocation) => setLocation(newLocation)
    );
    
    return () => subscription.remove(); // Cleanup
  }, []);
  
  return <Text>Location: {location?.coords.latitude}</Text>;
};
```

3. **Cleanup that must happen when component unmounts**
```typescript
// ✅ GOOD: Proper cleanup
const WebSocketConnection = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/rooms/${roomId}`);
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };
    
    return () => {
      ws.close(); // Cleanup: close connection
    };
  }, [roomId]);
  
  return <MessageList messages={messages} />;
};
```

4. **Focus/blur effects**
```typescript
// ✅ GOOD: Focus-based effects
const SearchScreen = () => {
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsFocused(true);
      // Refresh data when screen comes into focus
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsFocused(false);
    });
    
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);
  
  return <SearchInput focused={isFocused} />;
};
```

#### **useEffect Best Practices**

1. **Always include dependencies**
```typescript
// ❌ BAD: Missing dependencies
useEffect(() => {
  fetchData(userId, filter);
}, []); // Missing userId and filter

// ✅ GOOD: Complete dependency array
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]);
```

2. **Use cleanup functions**
```typescript
// ❌ BAD: No cleanup
useEffect(() => {
  const timer = setInterval(() => {
    updateData();
  }, 1000);
  // Missing cleanup - memory leak!
}, []);

// ✅ GOOD: Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    updateData();
  }, 1000);
  
  return () => clearInterval(timer); // Cleanup
}, []);
```

3. **Avoid infinite loops**
```typescript
// ❌ BAD: Infinite loop
useEffect(() => {
  setCount(count + 1); // This will cause infinite re-renders
}, [count]);

// ✅ GOOD: Use functional updates
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // Or use useCallback for stable references
```

4. **Extract complex logic to custom hooks**
```typescript
// ❌ BAD: Complex useEffect in component
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 50+ lines of complex logic here
  }, [userId]);
  
  return <UserDetails user={user} loading={loading} error={error} />;
};

// ✅ GOOD: Extract to custom hook
const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Complex logic here
  }, [userId]);
  
  return { user, loading, error };
};

const UserProfile = ({ userId }) => {
  const { user, loading, error } = useUser(userId);
  return <UserDetails user={user} loading={loading} error={error} />;
};
```

#### **useEffect Code Review Checklist**

When reviewing code with `useEffect`, check:

- [ ] **Is useEffect necessary?** Could this be calculated during render instead?
- [ ] **Are all dependencies included?** Use ESLint rule `exhaustive-deps`
- [ ] **Is there proper cleanup?** For subscriptions, timers, listeners
- [ ] **No infinite loops?** Dependencies don't cause re-renders
- [ ] **Complex logic extracted?** Consider custom hooks for complex effects
- [ ] **Error handling?** Async operations have proper error handling
- [ ] **Loading states?** User feedback for async operations
- [ ] **Performance impact?** Effect doesn't run too frequently
-   **Atomic Design Principles**: Build complex components by composing smaller, single-purpose components.

---

## 4. Coding Style & Conventions

We use **ESLint** and **Prettier** to enforce a consistent coding style. These are not suggestions; they are rules.

-   **Code Comments & Logging**:
    -   **Avoid Comments**: Write self-documenting code with clear variable and function names instead of comments. If you find yourself writing a comment, consider if you can make the code clearer instead.
    -   **No console.log in Production Code**: Never commit `console.log` statements. Use proper logging utilities if logging is needed for debugging during development, and remove all debug logs before committing.
    -   **Temporary Logging**: If you must add temporary logging for debugging, mark it clearly with a `// TEMP:` prefix and remove it before committing.

-   **File Naming**:
    -   Components: `PascalCase.tsx` (e.g., `PrimaryButton.tsx`)
    -   Hooks: `kebab-case.ts` (e.g., `use-auth.ts`)
    -   Services: `camelCase.ts` (e.g., `authService.ts`)
-   **Variable Naming**:
    -   Use `camelCase` for variables and functions.
    -   Use `PascalCase` for types, interfaces, and components.
    -   Boolean variables should be prefixed with `is`, `has`, or `should` (e.g., `isLoading`).
-   **Imports**:
    -   Organize imports in the following order:
        1.  React imports
        2.  External library imports (npm packages)
        3.  Internal absolute path imports (`@components/`, `@services/`)
        4.  Relative path imports (`../`, `./`)
    -   Use absolute paths (`@/components/Button`) over deep relative paths (`../../../../components/Button`).
-   **Styling**:
    -   Use `StyleSheet.create` for all component styles. Inline styles are only acceptable for highly dynamic, one-off cases.
    -   Define colors, fonts, and spacing in `/constants` and reuse them. Do not use magic numbers or hardcoded color strings in components.

---

## 5. Asynchronous Operations & API Services

-   **`async/await`**: This is the required standard for all asynchronous operations. Avoid `.then()` and `.catch()` chains for primary logic flow.
-   **Centralized API Logic**: All API interactions must be handled within the `/services` layer. Components and hooks should not make direct network calls.
-   **Error Handling**: Every API call must be wrapped in a `try/catch` block. The service is responsible for catching raw errors, classifying them (as per `img.md`), and throwing a structured, classified error that the UI layer can gracefully handle.
-   **Loading State**: Any component or hook that initiates an asynchronous operation must manage its own loading state. The user must always receive immediate feedback that their action is being processed.

---

## 6. Testing Philosophy

-   **Manual Testing**:
    -   Every change must be tested on both a physical iOS and Android device before being considered complete.

---

## 7. Performance Best Practices

A performant application is a core user requirement. All code must be written with performance as a primary consideration.

-   **Proactive Memoization**:
    -   All non-trivial functional components that receive props must be wrapped in `React.memo`.
    -   `useCallback` must be used for all function definitions that are passed as props to memoized child components to prevent re-renders caused by function re-creation.
    -   `useMemo` must be used for all non-primitive data (objects, arrays) passed as props to prevent re-renders caused by reference changes.
-   **`FlatList` Optimization**:
    -   `keyExtractor` is mandatory for all `FlatList` implementations.
    -   The `renderItem` function passed to a `FlatList` must be a memoized callback.
    -   Use `getItemLayout` whenever list items have a fixed height to bypass expensive measurement calculations.
-   **Avoid Anonymous Functions in Props**: Never use anonymous functions for props in JSX (e.g., `onPress={() => doSomething()}`). This creates a new function on every render, breaking memoization. Always use a memoized callback.
-   **Bundle Size Awareness**: Before adding a new third-party dependency, its size and impact on the final bundle must be analyzed and justified. Use tools like `react-native-bundle-visualizer` when necessary.

---

## 8. Security & Data Handling

Protecting user data is a non-negotiable responsibility. The following security practices are mandatory.

-   **Secrets Management**: No API keys, tokens, or other secrets are ever to be hardcoded in the source code. All secrets must be loaded from environment variables using `expo-constants`.
-   **Sensitive Data Storage**:
    -   **`AsyncStorage`** is to be used for non-sensitive, public data and user preferences only.
    -   **`expo-secure-store`** must be used for any sensitive data, including authentication tokens, refresh tokens, and any personally identifiable information (PII).
-   **API Interaction**: Always use HTTPS. All communication with the backend must be encrypted.
-   **Client-Side Validation**: While the server is the source of truth, all user-submitted data must be validated on the client-side using a schema-based library like `Zod` or `Yup`. This provides immediate user feedback and acts as a first line of defense.

---

## 9. Accessibility (a11y)

A world-class application is accessible to everyone. Accessibility is a core requirement for all UI development.

-   **Mandatory Labels**: All interactive elements (`TouchableOpacity`, `Pressable`, buttons, links) **must** have an `accessibilityLabel` that clearly and concisely describes the element and its action (e.g., "Button, Navigate to Settings").
-   **Roles & States**: All interactive elements must have an appropriate `accessibilityRole` (e.g., `button`, `link`, `header`). The `accessibilityState` prop must be used to describe the element's current state (e.g., `{ selected: true, disabled: false }`).
-   **Color Contrast**: All text and meaningful icons must meet the WCAG AA standard for color contrast against their background. Use the pre-vetted colors in `/constants/Colors.ts`.
-   **Testing**: The "definition of done" for any UI task includes manual testing with screen readers (VoiceOver on iOS, TalkBack on Android).

---

## 10. Git Workflow & Version Control

A clean, understandable version control history is essential for collaboration and maintainability.

-   **Branching Strategy**:
    -   `main`: Production-ready, stable code. Direct commits are forbidden.
    -   `develop`: The primary development branch. Features are merged here after review.
    -   `feature/<ticket-number>-<short-description>`: All new work must be done on a feature branch, created from `develop` (e.g., `feature/T-123-add-upload-indicator`).
-   **Commit Message Format**: All commit messages must follow the **Conventional Commits** specification. This is strictly enforced to enable automated changelog generation and a readable history.
    -   **Format**: `<type>(<scope>): <subject>` (e.g., `feat(upload): add global progress indicator`).
    -   **Types**: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`.
-   **Pull Request (PR) Process**:
    -   PRs are opened from a `feature/*` branch to merge into `develop`.
    -   The PR description must clearly explain the "what" and "why" of the changes.
    -   The PR must be reviewed and approved by at least one other team member before merging.

---

## 11. LLM-Specific Instructions & Anti-Hallucination Protocol

As an AI contributor, you are expected to follow this guide with absolute precision and adopt the mindset of a world-class software engineer. **FAILURE TO FOLLOW THESE INSTRUCTIONS WILL RESULT IN CODE REJECTION.**

### 11.1. Mandatory Adherence Protocol

**🚨 CRITICAL REQUIREMENTS - NO EXCEPTIONS:**

-   **Zero Hallucination Policy**: If you are unsure about ANY technical detail, API, or best practice, you MUST:
    1. **STOP** and explicitly state your uncertainty
    2. **SEARCH** for the latest 2025+ documentation using web search
    3. **VERIFY** information against official sources
    4. **CITE** your sources when making recommendations
    5. **AVOID** making assumptions or using outdated information

-   **Documentation Verification Protocol**: Before implementing any feature or using any library:
    1. Check the official documentation (React Native, Expo, TypeScript, etc.)
    2. Verify compatibility with current versions (2025+)
    3. Confirm best practices are current
    4. Reference specific documentation sections in your explanations

-   **Adopt a World-Class Engineering Mindset**: Your primary goal is not just to write code that works, but to write code that is robust, scalable, and easy for humans to maintain. Be meticulous in your approach. Every line of code should be deliberate and thought through.

### 11.2. Pre-Implementation Requirements

**BEFORE making ANY changes, you MUST:**

1. **Understand Before You Act**: Demonstrate a full understanding of the file's role, functions, and current state. State your understanding explicitly before proposing any edit.

2. **Analyze First, Code Second**: Explicitly state which parts of this guide you are implementing and reference specific sections.

3. **Verify Current Standards**: For any React Native, TypeScript, or Expo features, verify they are current as of 2025+ and cite your sources.

4. **Check Dependencies**: Verify all suggested packages are:
   - Currently maintained
   - Compatible with React Native 0.75+
   - Have TypeScript support
   - Follow security best practices

### 11.3. Code Implementation Standards

**MANDATORY PRACTICES:**

-   **Justify Every Change**: Do not remove existing code unless you can clearly articulate why it is necessary with specific references to this guide or architectural decisions.

-   **Adhere to File Structure**: Always create new files in the correct directories as specified in section 2.1. Never deviate from the established architecture.

-   **Respect Abstractions**: Do not bypass service layers or state management patterns. If a function you need doesn't exist in a service, add it to the service first.

-   **NO COMMENTS IN CODE**: NEVER add explanatory comments to code. Write self-documenting code with clear naming and structure. Only TODOs/FIXMEs with ticket numbers are allowed. See section 12.2 for complete details.

-   **Be Verbose in Your Reasoning**: Explain *why* you are making a change in your RESPONSE TEXT, referencing specific principles in this document. Example: "I am adding this logic to a new custom hook in `/hooks` to encapsulate feature-specific state, in accordance with section 2.2 of the coding guide." **Do NOT add these explanations as comments in the code itself.**

### 11.4. Anti-Hallucination Safeguards

**WHEN YOU DON'T KNOW SOMETHING:**

```typescript
// ❌ NEVER DO THIS - Making assumptions
// "React Native has a built-in feature for X"

// ✅ ALWAYS DO THIS - Acknowledge uncertainty
// "I need to verify the current React Native API for X. Let me check the latest documentation."
```

**REQUIRED VERIFICATION STEPS:**

1. **API Verification**: Before using any React Native, Expo, or third-party API:
   - Check official documentation
   - Verify current version compatibility
   - Confirm TypeScript support
   - Check for deprecation warnings

2. **Best Practice Verification**: Before recommending any pattern:
   - Verify it's current as of 2025+
   - Check React Native community consensus
   - Confirm performance implications
   - Validate security considerations

3. **Dependency Verification**: Before suggesting any package:
   - Check npm package page for maintenance status
   - Verify React Native compatibility
   - Check for security vulnerabilities
   - Confirm TypeScript support

### 11.5. Documentation Requirements

**MANDATORY CITATIONS:**

When making any technical recommendation, you MUST include:
- Official documentation links
- Version numbers
- Last updated dates
- Specific section references

**EXAMPLE FORMAT:**
```
According to React Native 0.75+ documentation (https://reactnative.dev/docs/...), 
the recommended approach for [feature] is [approach]. This was updated in [date] 
and replaces the previous [old approach].
```

### 11.6. Error Handling Protocol

**WHEN YOU ENCOUNTER UNCERTAINTY:**

1. **Explicitly State**: "I need to verify this information"
2. **Search**: Use web search to find current documentation
3. **Cite Sources**: Provide specific links and version information
4. **Recommend Verification**: Suggest the user verify independently
5. **Provide Alternatives**: If uncertain, provide multiple approaches with pros/cons

### 11.7. Code Quality Enforcement

**MANDATORY CHECKS BEFORE SUBMITTING:**

- [ ] All code follows TypeScript best practices (2025+ standards)
- [ ] All React Native APIs are current and verified
- [ ] All dependencies are maintained and secure
- [ ] All patterns follow this coding guide
- [ ] All recommendations are cited with sources
- [ ] No assumptions made without verification
- [ ] All code is production-ready
- [ ] Performance implications are considered
- [ ] Security implications are addressed
- [ ] Accessibility requirements are met
- [ ] **ZERO explanatory comments in code** (only TODO/FIXME with tickets allowed)
- [ ] All `console.log` statements wrapped in `__DEV__` or removed

### 11.8. Communication Standards

**REQUIRED COMMUNICATION PATTERN:**

1. **State Understanding**: "I understand this file handles [purpose] and currently [current state]"
2. **Reference Guide**: "Following section X.Y of the coding guide, I will [action]"
3. **Verify Sources**: "Based on [official source] documentation, the current best practice is [approach]"
4. **Explain Changes**: "I am making this change because [specific reason] as outlined in [guide section]"
5. **Acknowledge Limitations**: "I have verified this approach with [sources], but recommend you confirm [specific aspect]"

### 11.9. Enforcement Consequences

**FAILURE TO FOLLOW THESE INSTRUCTIONS RESULTS IN:**

- Immediate code rejection
- Requirement to re-implement with proper verification
- Mandatory documentation review
- Additional verification steps for future contributions

**SUCCESS CRITERIA:**

- All code follows current 2025+ standards
- All recommendations are properly cited
- No assumptions or hallucinations
- Complete adherence to this guide
- Production-ready, maintainable code
- **ZERO explanatory comments in code** (self-documenting only)
- All console statements wrapped in `__DEV__` or removed

## 12. Code Quality & Maintenance

### 12.1. Console Logging
- **No `console.log` in Production Code**: `console.log` statements are strictly prohibited in production code. They should only be used temporarily during development and must be removed before committing.
- **Use Debugging Tools**: For production debugging, use proper logging services or React Native's built-in debugging tools.
- **Temporary Debugging**: If you must use `console.log` for debugging, wrap them in a development-only condition:
  ```typescript
  if (__DEV__) {
    console.log('Debug information:', data);
  }
  ```
  And remove them before committing your changes.

### 12.2. Code Comments

**🚨 CRITICAL: DO NOT ADD COMMENTS TO CODE**

- **Self-Documenting Code is Mandatory**: Write code that is self-explanatory through clear naming, structure, and refactoring. **Comments should NOT be added to explain code.**
  
- **If You Think You Need a Comment, You Don't**: If code seems to need explanation:
  1. **Extract to a well-named function** instead of commenting
  2. **Use descriptive variable names** instead of commenting
  3. **Refactor complex logic** into smaller, clearer pieces
  4. **Simplify the code** until it's self-explanatory

- **Absolutely Prohibited Comments**:
  ```typescript
  // ❌ NEVER DO THIS - Explanatory comments
  // Navigate to home immediately for smooth UX
  router.replace({ pathname: '/home' });
  
  // ❌ NEVER DO THIS - Implementation comments
  // Close modal after a short delay to allow navigation to complete
  setTimeout(() => onClose(), 300);
  
  // ❌ NEVER DO THIS - Obvious comments
  // Increment counter
  counter++;
  ```

- **The ONLY Acceptable Comments**:
  1. **TODOs and FIXMEs**: Must include ticket number and be addressed promptly:
     ```typescript
     // TODO: T-123 - Refactor to use new service layer
     // FIXME: T-456 - Handle edge case when API returns null
     ```
  2. **Complex Algorithm Citations**: Only for mathematical/algorithmic implementations requiring academic reference
  3. **Legal/Copyright**: Only at file headers when legally required

- **Code Review Rejection**: Code with explanatory comments will be rejected. If a reviewer asks "what does this do?", refactor the code to be clearer, don't add a comment.

- **LLM Instruction**: AI assistants must NEVER add explanatory comments to code. If you think code needs explanation, refactor it to be self-documenting instead.

**Example - Replace Comments with Clear Code**:
```typescript
// ❌ BAD: Using comments
// Check if user has permission
if (user.role === 'admin' || user.role === 'moderator') {
  // Allow access
  allowAccess();
}

// ✅ GOOD: Self-documenting code
const hasModeratorPermission = user.role === 'admin' || user.role === 'moderator';
if (hasModeratorPermission) {
  allowAccess();
}

// ❌ BAD: Using comments
// Navigate to home after successful login to prevent jerky transition
router.replace({ pathname: '/home' });
setTimeout(() => onClose(), 300);

// ✅ GOOD: Extract to well-named function
const navigateToHomeAndCloseModal = () => {
  router.replace({ pathname: '/home' });
  setTimeout(() => onClose(), 300);
};
navigateToHomeAndCloseModal();
```

By adhering to these guidelines, we will maintain a clean, professional, and maintainable codebase that is easy to understand and modify without cluttering code with unnecessary comments.

---

---

## 13. Code Review Guidelines

Code review is a critical process that ensures code quality, knowledge sharing, and prevents bugs from reaching production. This section provides comprehensive guidelines for conducting effective code reviews.

### 13.1. Code Review Checklist

Use this checklist for every code review to ensure comprehensive coverage:

#### **Architecture & Design**
- [ ] **Separation of Concerns**: Business logic is in services/hooks, UI logic is in components
- [ ] **Single Responsibility**: Each function/component has one clear purpose
- [ ] **Dependency Direction**: Dependencies flow inward (components → hooks → services)
- [ ] **No Circular Dependencies**: Check for circular imports between modules
- [ ] **Proper Abstraction**: No business logic in UI components
- [ ] **State Management**: Appropriate use of local vs global state

#### **TypeScript & Type Safety**
- [ ] **No `any` Types**: All variables have proper types (except with explicit `// TODO:`)
- [ ] **Interface Definitions**: All props have well-defined interfaces
- [ ] **Generic Usage**: Proper use of TypeScript generics where applicable
- [ ] **Type Guards**: Proper type checking for external data
- [ ] **Null Safety**: Proper handling of nullable values

#### **Performance**
- [ ] **React.memo**: Non-trivial components are memoized
- [ ] **useCallback**: All callback props are memoized
- [ ] **useMemo**: Expensive calculations are memoized
- [ ] **FlatList Optimization**: `keyExtractor` and `getItemLayout` implemented
- [ ] **No Anonymous Functions**: No inline functions in JSX props
- [ ] **Bundle Size**: New dependencies are justified and minimal

#### **Security**
- [ ] **No Hardcoded Secrets**: All sensitive data uses environment variables
- [ ] **Secure Storage**: Sensitive data uses `expo-secure-store`
- [ ] **Input Validation**: All user inputs are validated
- [ ] **HTTPS Only**: All network requests use secure protocols
- [ ] **Error Handling**: No sensitive information in error messages

#### **Accessibility**
- [ ] **accessibilityLabel**: All interactive elements have descriptive labels
- [ ] **accessibilityRole**: Proper roles assigned to all elements
- [ ] **Color Contrast**: Meets WCAG AA standards
- [ ] **Touch Targets**: Minimum 44x44 points for all interactive elements
- [ ] **Screen Reader**: Tested with VoiceOver/TalkBack

#### **Code Quality**
- [ ] **No console.log**: No debug statements in production code (wrap in `__DEV__` if needed for development)
- [ ] **No Explanatory Comments**: Code has ZERO explanatory comments (only TODO/FIXME allowed)
- [ ] **Self-Documenting**: Code is clear through naming and structure, not comments
- [ ] **Consistent Naming**: Follows established naming conventions
- [ ] **Error Handling**: Proper try/catch blocks for async operations
- [ ] **Loading States**: User feedback for all async operations

### 13.2. Common Anti-patterns and Code Smells

#### **Performance Anti-patterns**
```typescript
// ❌ BAD: Anonymous function in JSX
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
/>

// ✅ GOOD: Memoized callback
const renderItem = useCallback(({ item }: { item: Item }) => (
  <ItemComponent item={item} />
), []);

<FlatList data={items} renderItem={renderItem} />
```

#### **State Management Anti-patterns**
```typescript
// ❌ BAD: Business logic in component
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Direct API call in component
    fetch('/api/user').then(response => {
      setUser(response.data);
    });
  }, []);
  
  return <View>{user?.name}</View>;
};

// ✅ GOOD: Logic in custom hook
const useProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { user, loading, fetchUser };
};
```

#### **Type Safety Anti-patterns**
```typescript
// ❌ BAD: Using any type
const processData = (data: any) => {
  return data.someProperty;
};

// ✅ GOOD: Proper typing
interface DataType {
  someProperty: string;
  otherProperty: number;
}

const processData = (data: DataType) => {
  return data.someProperty;
};
```

#### **Security Anti-patterns**
```typescript
// ❌ BAD: Hardcoded API key
const API_KEY = 'sk-1234567890abcdef';

// ✅ GOOD: Environment variable
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// ❌ BAD: Storing sensitive data in AsyncStorage
await AsyncStorage.setItem('authToken', token);

// ✅ GOOD: Using secure storage
await SecureStore.setItemAsync('authToken', token);
```

### 13.3. Automated Code Quality Checks

#### **Pre-commit Hooks**
Ensure these tools are configured and running:
- [ ] **ESLint**: Catches syntax errors and enforces style rules
- [ ] **Prettier**: Ensures consistent code formatting
- [ ] **TypeScript Compiler**: Catches type errors
- [ ] **Husky**: Runs checks before commits
- [ ] **Lint-staged**: Runs linters only on staged files

#### **CI/CD Pipeline Checks**
- [ ] **Type Checking**: `tsc --noEmit`
- [ ] **Linting**: `eslint . --ext .ts,.tsx`
- [ ] **Formatting**: `prettier --check .`
- [ ] **Bundle Analysis**: Check for size regressions
- [ ] **Security Audit**: `npm audit` for vulnerabilities

### 13.4. Performance Review Guidelines

#### **Bundle Size Analysis**
- [ ] **New Dependencies**: Justify size impact of new packages
- [ ] **Tree Shaking**: Ensure unused code is eliminated
- [ ] **Code Splitting**: Implement lazy loading for non-critical features
- [ ] **Asset Optimization**: Images and fonts are optimized

#### **Runtime Performance**
- [ ] **Render Performance**: No unnecessary re-renders
- [ ] **Memory Usage**: No memory leaks in useEffect cleanup
- [ ] **List Performance**: FlatList optimizations implemented
- [ ] **Image Loading**: Proper image optimization and caching

### 13.5. Security Review Checklist

#### **Data Protection**
- [ ] **Sensitive Data**: No PII in logs or error messages
- [ ] **Token Storage**: Secure storage for authentication tokens
- [ ] **Input Sanitization**: All user inputs are sanitized
- [ ] **API Security**: Proper authentication and authorization

#### **Network Security**
- [ ] **HTTPS Only**: All network requests use secure protocols
- [ ] **Certificate Pinning**: Implemented for critical endpoints
- [ ] **Request Validation**: All API requests are validated
- [ ] **Error Handling**: No sensitive information in error responses

### 13.6. Code Review Process

#### **For Reviewers**
1. **Understand the Context**: Read the PR description and related tickets
2. **Check Architecture**: Ensure changes follow established patterns
3. **Verify Tests**: Ensure adequate test coverage
4. **Performance Impact**: Consider performance implications
5. **Security Review**: Check for security vulnerabilities
6. **Documentation**: Ensure code is self-documenting

#### **For Authors**
1. **Self-Review**: Review your own code before requesting review
2. **Clear Description**: Provide clear PR description with context
3. **Small PRs**: Keep changes focused and manageable
4. **Test Coverage**: Include tests for new functionality
5. **Documentation**: Update documentation if needed

### 13.7. Review Comments Best Practices

#### **Constructive Feedback**
```typescript
// ❌ BAD: Vague feedback
// "This doesn't look right"

// ✅ GOOD: Specific, actionable feedback
// "This component is handling both UI and business logic. 
//  Consider moving the API call to a custom hook in /hooks 
//  to follow our separation of concerns principle."
```

#### **Code Suggestions**
```typescript
// ❌ BAD: Just pointing out problems
// "This will cause performance issues"

// ✅ GOOD: Providing solutions
// "This will cause performance issues because the function 
//  is recreated on every render. Consider using useCallback:
//  const handlePress = useCallback(() => { ... }, [dependency]);"
```

### 13.8. Review Approval Criteria

A PR should only be approved when:
- [ ] All checklist items are satisfied
- [ ] Code follows established patterns
- [ ] Performance implications are acceptable
- [ ] Security review is complete
- [ ] Tests are adequate and passing
- [ ] Documentation is updated if needed
- [ ] No anti-patterns or code smells remain
- [ ] **Code has ZERO explanatory comments** (only TODO/FIXME with tickets)
- [ ] All `console.log` wrapped in `__DEV__` or removed
- [ ] All LLM instructions have been followed (if applicable)
- [ ] All recommendations are properly cited with sources
- [ ] No assumptions or hallucinations are present

### 13.9. Enforcement & Compliance

#### **Mandatory Compliance Checks**
- [ ] **Architecture Compliance**: All code follows the established directory structure and separation of concerns
- [ ] **TypeScript Compliance**: No `any` types without explicit `// TODO:` comments
- [ ] **Performance Compliance**: All components are properly memoized and optimized
- [ ] **Security Compliance**: No hardcoded secrets, proper data handling
- [ ] **Accessibility Compliance**: All interactive elements have proper labels and roles
- [ ] **Code Quality Compliance**: No console.log statements, proper error handling
- [ ] **Documentation Compliance**: All changes are self-documenting and follow naming conventions

#### **Automated Enforcement**
- **Pre-commit Hooks**: All code must pass ESLint, Prettier, and TypeScript checks
- **CI/CD Pipeline**: Automated testing and quality checks on every PR
- **Bundle Analysis**: Automatic bundle size impact analysis
- **Security Scanning**: Automated vulnerability scanning for dependencies
- **Performance Monitoring**: Automated performance regression detection

#### **Manual Enforcement**
- **Code Review**: Every PR requires approval from at least one senior developer
- **Architecture Review**: Major architectural changes require team review
- **Security Review**: Security-sensitive changes require security team approval
- **Performance Review**: Performance-critical changes require performance team review

---

## 14. Quick Reference & Cheat Sheets

### 14.1. File Structure Quick Reference
```
/app/           # Screens and routing only
/components/    # Stateless UI components
/hooks/         # Business logic and stateful logic
/services/      # API clients and external interactions
/stores/        # Zustand global state management
/utils/         # Helper functions
/constants/     # Global constants and styles
```

### 14.2. Component Creation Checklist
- [ ] Functional component with TypeScript interface
- [ ] Props interface defined
- [ ] React.memo wrapper (if non-trivial)
- [ ] useCallback for all callback props
- [ ] useMemo for expensive calculations
- [ ] Proper accessibility labels and roles
- [ ] StyleSheet.create for all styles
- [ ] No business logic in component

### 14.3. Hook Creation Checklist
- [ ] Single responsibility principle
- [ ] Proper TypeScript typing
- [ ] Error handling for async operations
- [ ] Loading state management
- [ ] Cleanup in useEffect
- [ ] Memoized callbacks and values
- [ ] No direct API calls (use services)

### 14.4. Service Creation Checklist
- [ ] Single responsibility for domain
- [ ] Proper error handling and classification
- [ ] TypeScript interfaces for all data
- [ ] No UI-related code
- [ ] Proper async/await usage
- [ ] Environment variable usage for configuration
- [ ] HTTPS-only communication

### 14.5. Performance Optimization Checklist
- [ ] React.memo for components
- [ ] useCallback for functions
- [ ] useMemo for expensive calculations
- [ ] FlatList keyExtractor and getItemLayout
- [ ] No anonymous functions in JSX
- [ ] Proper image optimization
- [ ] Bundle size analysis for new dependencies

### 14.6. Security Checklist
- [ ] No hardcoded secrets or API keys
- [ ] Secure storage for sensitive data
- [ ] Input validation and sanitization
- [ ] HTTPS for all network requests
- [ ] Proper error handling (no sensitive data exposure)
- [ ] Authentication and authorization checks

---

## 15. Version History & Updates

### Current Version: 2.0 (2025)
- Enhanced LLM instructions with anti-hallucination protocol
- Comprehensive code review guidelines
- Updated React Native best practices for 2025+
- Added enforcement mechanisms and compliance checks
- Improved documentation structure and navigation

### Previous Versions
- **v1.0**: Initial coding guide with basic standards
- **v1.5**: Added performance and security guidelines

---

## 16. Contact & Support

For questions about this coding guide or to suggest improvements:
- **Technical Lead**: [Contact Information]
- **Architecture Team**: [Contact Information]
- **Security Team**: [Contact Information]

---

**By adhering to this guide, we will build a robust, professional, and world-class application that stands the test of time and serves our users excellently.**
