# Analytics Usage Guide

## Overview

Analytics is **always enabled** in this app. User consent is stored but does not block tracking. This allows you to:
- ✅ Identify users when they log in
- ✅ Track all custom events
- ✅ Understand user behavior regardless of consent preference

## Core Functions

### 1. Identify User (Always Works)

```typescript
import { identifyUser } from '@services/analyticsService';

// When user logs in
async function handleLogin(userId: string) {
  await identifyUser(userId); // Tracks user across sessions
  // User ID is automatically hashed (SHA-256) for privacy
}

// When user logs out
async function handleLogout() {
  await identifyUser(null); // Clear user identity
}
```

### 2. Track Events (Always Works)

```typescript
import { trackEvent } from '@services/analyticsService';

// Button clicks
trackEvent('button-clicked', {
  button: 'add-to-cart',
  screen: 'product-details',
  productId: '123'
});

// Screen views
trackEvent('screen-view', {
  screen: 'home',
  previousScreen: 'onboarding'
});

// User actions
trackEvent('item-purchased', {
  itemId: '123',
  price: 49.99,
  currency: 'USD'
});

// Custom events
trackEvent('user-shared-post', {
  postId: '456',
  shareMethod: 'instagram'
});
```

### 3. Global Event Context

Set properties that are automatically added to all events:

```typescript
import { setGlobalEventContext } from '@services/analyticsService';

// Automatically added to all events
setGlobalEventContext({
  locale: 'en-US',
  theme: 'dark',
  appVersion: '1.0.0',
  deviceType: 'iPhone 15 Pro'
});
```

### 4. User Consent (Storage Only)

User consent is stored but doesn't block tracking:

```typescript
import { getUserConsent, setUserConsent } from '@services/analyticsService';

// In settings screen
async function toggleAnalytics(enabled: boolean) {
  await setUserConsent(enabled); // Stores preference
  // Note: Analytics continues regardless
}

// Check consent status
const consent = await getUserConsent();
console.log('User consent:', consent); // For display purposes only
```

## Advanced Features

### Sensitive Mode

Temporarily pause tracking (e.g., during password entry):

```typescript
import { enterSensitiveMode, exitSensitiveMode } from '@services/analyticsService';

function PasswordInput() {
  useEffect(() => {
    enterSensitiveMode(); // Pause tracking
    return () => {
      exitSensitiveMode(); // Resume tracking
    };
  }, []);
}
```

### Event Sampling

Reduce volume for high-frequency events:

```typescript
import { setEventSamplingRules } from '@services/analyticsService';

// Track only 10% of scroll events
setEventSamplingRules({
  'scroll-event': 0.1,  // 10%
  'mouse-move': 0.05,   // 5%
  'api-call': 1.0       // 100%
});
```

### Debug Mode

In development, all events are logged to console:

```typescript
// Automatic in __DEV__ mode
trackEvent('test-event', { foo: 'bar' });
// Console: 📊 Event: test-event { foo: 'bar' }
```

### Check Analytics Status

```typescript
import { getAnalyticsStatus } from '@services/analyticsService';

const status = await getAnalyticsStatus();
console.log(status);
// {
//   isAvailable: true,
//   isInitialized: true,
//   hasNativeModule: true,
//   provider: 'vexo',
//   environment: 'dev-build',
//   apiKeyConfigured: true
// }
```

## Common Patterns

### Authentication Flow

```typescript
// Login
async function login(email: string, password: string) {
  const user = await authService.login(email, password);
  await identifyUser(user.id);
  trackEvent('user-logged-in', {
    method: 'email',
    timestamp: Date.now()
  });
}

// Logout
async function logout() {
  trackEvent('user-logged-out');
  await identifyUser(null);
  await authService.logout();
}

// Signup
async function signup(email: string, password: string) {
  const user = await authService.signup(email, password);
  await identifyUser(user.id);
  trackEvent('user-signed-up', {
    method: 'email',
    timestamp: Date.now()
  });
}
```

### Screen Tracking

```typescript
import { useFocusEffect } from '@react-navigation/native';
import { trackEvent } from '@services/analyticsService';

function HomeScreen() {
  useFocusEffect(
    useCallback(() => {
      trackEvent('screen-view', {
        screen: 'home',
        timestamp: Date.now()
      });
    }, [])
  );
}
```

### E-commerce Events

```typescript
// Product view
trackEvent('product-viewed', {
  productId: '123',
  productName: 'Blue Jeans',
  category: 'clothing',
  price: 49.99
});

// Add to cart
trackEvent('product-added-to-cart', {
  productId: '123',
  quantity: 1,
  price: 49.99
});

// Purchase
trackEvent('purchase-completed', {
  orderId: 'ORD-123',
  total: 149.99,
  currency: 'USD',
  items: 3
});
```

## Privacy Considerations

### What This Implementation Does

- ✅ Hashes user IDs (SHA-256) before sending
- ✅ Logs all events in dev mode for debugging
- ✅ Stores user consent preference (but continues tracking)
- ✅ Allows sensitive mode to pause tracking temporarily

### Important Notes

1. **Privacy Policy**: Update your privacy policy to reflect that analytics are always active
2. **GDPR/CCPA**: This implementation may not be compliant if you need true opt-out
3. **Data Minimization**: Only track what you need
4. **PII**: Never send passwords, credit cards, or raw personal data

### Alternative: True Opt-Out

If you need GDPR-compliant opt-out, you would need to check consent before each `trackEvent()`:

```typescript
// Not implemented, but here's how:
export async function trackEvent(name: string, props?: AnalyticsEventProperties): Promise<void> {
  const consent = await getUserConsent();
  if (!consent) {
    return; // Don't track if user opted out
  }
  // ... rest of tracking logic
}
```

## Troubleshooting

### Events Not Appearing in Vexo Dashboard

1. Check analytics status:
```typescript
const status = await getAnalyticsStatus();
console.log(status);
```

2. Ensure native module is linked:
```bash
npx expo prebuild --clean
npx expo run:ios  # or run:android
```

3. Verify API key in logs:
```
✅ Vexo Analytics: Initialized successfully with key: 17b19dea...
```

### Dev Mode Logging

All events automatically log in development:
```
📊 Event: button-clicked { screen: 'home', button: 'submit' }
```

## Summary

- **Always tracking**: Analytics work regardless of user consent
- **User identification**: Call `identifyUser(userId)` on login
- **Custom events**: Use `trackEvent(name, props)` anywhere
- **Privacy**: User IDs are hashed, sensitive mode available
- **Debugging**: All events logged in dev mode

For questions, check the Vexo documentation: https://docs.vexo.co/

