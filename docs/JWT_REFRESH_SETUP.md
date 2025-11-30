# JWT Refresh Token Implementation Guide

## Overview

This implementation provides automatic JWT token refresh functionality for your Expo React Native app. When an access token expires, the system automatically uses the refresh token to get new tokens and retries the failed request transparently.

## Architecture

### Core Components

1. **`utils/tokenStore.ts`** - Secure token storage using expo-secure-store
2. **`services/api.ts`** - Axios interceptor with automatic token refresh
3. **`providers/AuthProvider.tsx`** - React Context for authentication state
4. **Updated `hooks/use-auth-manager/index.tsx`** - Integration with existing auth system

### Flow Diagram

```
API Request → Interceptor adds token → Server responds
     ↓
If 401 error → Check if refreshing → Get refresh token
     ↓
Call /v1/signin/refresh-token → Store new tokens → Retry original request
     ↓
If refresh fails → Clear tokens → Trigger logout
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install expo-secure-store
```

### 2. Update Your App Root

Wrap your app with the AuthProvider:

```tsx
// App.tsx or your root component
import AuthProvider from './providers/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      {/* Your existing app content */}
    </AuthProvider>
  );
}
```

### 3. Update Login Flow

Replace your existing login logic to use the new JWT system:

```tsx
// Before (in your Auth.tsx or login component)
const handleLogin = async () => {
  const response = await axios.post('/identity/v1/signin/user', credentials);
  await AsyncStorage.setItem('accessToken', response.data.accessToken);
  // ... rest of login logic
};

// After
import { useAuth } from '../providers/AuthProvider';

const { login } = useAuth();

const handleLogin = async () => {
  try {
    const response = await login(credentials);
    // Tokens are automatically stored securely
    // Navigation and state updates are handled automatically
  } catch (error) {
    // Handle login error
  }
};
```

### 4. Update API Calls

Replace direct axios calls with the new apiService:

```tsx
// Before
import axios from 'axios';

const response = await axios.get('/api/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

// After
import apiService from '../services/api';

const response = await apiService.get('/api/profile');
// Token is automatically attached and refreshed if needed
```

### 5. Backend Requirements

Ensure your backend supports the refresh token endpoint:

```typescript
// POST /v1/signin/refresh-token
// Request body:
{
  "refreshToken": "string"
}

// Response:
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

## Usage Examples

### Basic API Call

```tsx
import apiService from '../services/api';

// This call will automatically handle token refresh
const getUserData = async () => {
  try {
    const response = await apiService.get('/identity/v1/user/profile');
    return response.data;
  } catch (error) {
    // Handle error (token refresh is automatic)
    console.error('API call failed:', error);
  }
};
```

### Using the Auth Context

```tsx
import { useAuth } from '../providers/AuthProvider';

const MyComponent = () => {
  const { 
    isAuthenticated, 
    login, 
    logout, 
    profile, 
    isCheckingAuth 
  } = useAuth();

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedContent />;
};
```

### Service Layer Pattern

```tsx
// services/userService.ts
import apiService from './api';

class UserService {
  async getProfile() {
    const response = await apiService.get('/identity/v1/user/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await apiService.put('/identity/v1/user/profile', data);
    return response.data;
  }
}

export default new UserService();
```

## Migration Guide

### From AsyncStorage to SecureStore

The system automatically migrates existing tokens from AsyncStorage to SecureStore on first load:

1. Checks SecureStore for tokens
2. If not found, checks AsyncStorage
3. If found in AsyncStorage, migrates to SecureStore
4. Cleans up old AsyncStorage entries

### Backward Compatibility

The implementation maintains backward compatibility with your existing:
- `useAuthManager` hook
- Redux state management
- Navigation patterns
- Error handling

## Security Features

### Token Storage
- Access and refresh tokens stored in expo-secure-store
- Automatic cleanup on logout
- Migration from less secure AsyncStorage

### Request Security
- Automatic token attachment to requests
- Secure token refresh flow
- Automatic logout on refresh failure

### Error Handling
- Graceful handling of network errors
- Retry logic for failed requests
- Proper cleanup on authentication failures

## Troubleshooting

### Common Issues

1. **"Cannot find module 'expo-secure-store'"**
   - Run: `npm install expo-secure-store`

2. **Tokens not refreshing**
   - Check that your backend refresh endpoint returns both tokens
   - Verify the endpoint URL matches your backend

3. **Infinite refresh loops**
   - Ensure refresh token endpoint doesn't require authentication
   - Check that refresh tokens have longer expiry than access tokens

4. **Migration issues**
   - Clear app data and re-login if migration fails
   - Check AsyncStorage keys match the expected format

### Debug Mode

Enable debug logging by adding this to your environment:

```typescript
// In your app initialization
if (__DEV__) {
  console.log('JWT Refresh Token System Enabled');
}
```

## Testing

Use the provided example component to test the implementation:

```tsx
import ProfileExample from '../examples/ProfileExample';

// Add to your app for testing
<ProfileExample />
```

This component demonstrates:
- Automatic token refresh on API calls
- Login/logout functionality
- Error handling
- Multiple concurrent API calls

## Performance Considerations

### Token Refresh Optimization
- Single refresh request for multiple failed calls
- Failed request queuing during refresh
- Automatic retry of queued requests

### Storage Performance
- Minimal SecureStore operations
- Efficient token validation
- Background token cleanup

## Production Checklist

- [ ] Backend refresh endpoint implemented and tested
- [ ] Universal links configured for deep linking after auth
- [ ] Error tracking for authentication failures
- [ ] Token expiry times properly configured (24h access, 30d refresh)
- [ ] Logout endpoint implemented (optional but recommended)
- [ ] Security audit of token storage and transmission

## API Reference

### TokenStore
```typescript
TokenStore.storeTokens(tokens: TokenPair): Promise<void>
TokenStore.getAccessToken(): Promise<string | null>
TokenStore.getRefreshToken(): Promise<string | null>
TokenStore.clearTokens(): Promise<void>
```

### ApiService
```typescript
apiService.get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
apiService.post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
apiService.setTokens(tokens: TokenPair): Promise<void>
apiService.clearTokens(): Promise<void>
```

### AuthProvider
```typescript
const { 
  isAuthenticated, 
  login, 
  logout, 
  refreshProfile,
  token,
  profile 
} = useAuth();
```
