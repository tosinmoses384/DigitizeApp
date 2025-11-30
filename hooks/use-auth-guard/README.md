# Auth Guard Implementation Guide

## Overview

The Auth Guard system provides a centralized approach to handling authentication errors, protecting routes, and managing API calls with automatic auth error handling.

## Components

### 1. `useAuthGuard` Hook
Core hook that provides auth error handling utilities.

```typescript
import { useAuthGuard } from '@hooks/use-auth-guard';

const { handleAuthError, handleApiResponse, withAuthGuard } = useAuthGuard();

// Handle auth errors manually
const isAuthError = handleAuthError(response);

// Wrap API calls with auth guard
const guardedApiCall = withAuthGuard(originalApiCall);
```

### 2. `withAuthGuard` HOC
Higher-order component for protecting entire screens.

```typescript
import { withAuthGuard } from '@hooks/use-auth-guard';

const MyComponent = () => <div>Protected content</div>;

export default withAuthGuard(MyComponent, {
  redirectTo: '/login',
  loadingMessage: 'Checking authentication...',
  requireProfile: true,
});
```

### 3. `useApiService` Hook
Simplified API calling with built-in auth protection.

```typescript
import { useApiService } from '@hooks/use-auth-guard';

const { callApi, callApiWithLoading } = useApiService();

// Simple API call
const result = await callApi(
  (token) => myApiService.getData(token),
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);

// API call with loading state
await callApiWithLoading(
  (token) => myApiService.getData(token),
  setLoading,
  { onSuccess: handleSuccess }
);
```

## Migration Guide

### Step 1: Replace Manual Auth Checks

**Before:**
```typescript
.then((res: any) => {
  if (res?.responseCode === "401" || res?.responseCode === 401) {
    return router.push("/Onboarding");
  }
  // Handle success
})
```

**After:**
```typescript
import { useApiService } from '@hooks/use-auth-guard';

const { callApi } = useApiService();

await callApi(
  (token) => myApiService.call(token),
  {
    onSuccess: (res) => {
      // Handle success - auth errors handled automatically
    }
  }
);
```

### Step 2: Protect Screens

**Before:**
```typescript
const MyScreen = () => {
  const { token } = useAppSelector(state => state.userProfileSlice);
  
  if (!token) {
    router.replace('/Onboarding');
    return null;
  }
  
  return <div>Content</div>;
};
```

**After:**
```typescript
import { withAuthGuard } from '@hooks/use-auth-guard';

const MyScreen = () => <div>Content</div>;

export default withAuthGuard(MyScreen);
```

### Step 3: Centralized Error Handling

The auth guard automatically:
- Clears auth state on 401 errors
- Shows user-friendly toast messages
- Redirects to login screen
- Prevents duplicate auth error handling

## Benefits

1. **Reduced Code Duplication**: No more manual 401 checks in every component
2. **Consistent UX**: Standardized auth error messages and redirections
3. **Improved Maintainability**: Single source of truth for auth logic
4. **Better Error Handling**: Automatic cleanup and state management
5. **Type Safety**: Full TypeScript support with proper interfaces

## Best Practices

1. **Use `withAuthGuard` for screen-level protection**
2. **Use `useApiService` for API calls within components**
3. **Use `useAuthGuard` for custom auth logic when needed**
4. **Configure appropriate loading messages for better UX**
5. **Test auth flows thoroughly in development**

## Implementation Timeline

1. **Phase 1**: Implement auth guard hooks (✅ Complete)
2. **Phase 2**: Refactor critical screens (Recommended: start with ProfileMain, EmailConfirmation)
3. **Phase 3**: Migrate remaining authenticated screens
4. **Phase 4**: Remove legacy manual auth checks

## Testing

```typescript
// Test auth guard functionality
const { handleAuthError } = useAuthGuard();

// Test 401 response
const authError = handleAuthError({ responseCode: 401 });
expect(authError).toBe(true);

// Test non-auth error
const normalError = handleAuthError({ responseCode: 500 });
expect(normalError).toBe(false);
```

This implementation provides a robust, scalable solution for authentication management across your React Native application.
