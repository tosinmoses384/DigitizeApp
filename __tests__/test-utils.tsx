import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react-native';

// Mock Redux store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      userProfileSlice: (state = {
        token: '',
        profile: null,
        refetchUserState: false,
        profileLoaderState: false,
      }, action) => state,
    },
    preloadedState: initialState,
  });
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialState = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const store = createMockStore(initialState);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock implementations for common hooks
export const mockHooks = {
  useAuth: {
    isCheckingAuth: false,
    isAuthenticated: true,
    token: 'mock-token',
    profile: { id: '1', name: 'Test User', email: 'test@example.com' },
    fetchUser: jest.fn(),
    handleAuthFailure: jest.fn(),
  },
  useAppInitialization: {
    isAppReady: true,
    fontsLoaded: true,
  },
  useNavigationSetup: {
    navigation: {
      addListener: jest.fn(() => jest.fn()),
      dispatch: jest.fn(),
    },
  },
  useAppTrackingTransparency: {
    trackingStatus: 'granted' as const,
    hasRequested: true,
    requestTrackingPermission: jest.fn().mockResolvedValue('granted'),
    checkTrackingStatus: jest.fn().mockResolvedValue('granted'),
    canTrack: true,
  },
  useLayoutSetup: {
    isAppReady: true,
    fontsLoaded: true,
    isCheckingAuth: false,
    isAuthenticated: true,
    token: 'mock-token',
    profile: { id: '1', name: 'Test User' },
    colorScheme: 'light' as const,
    navigation: { addListener: jest.fn() },
    handleDeepLink: jest.fn(),
  },
};

export * from '@testing-library/react-native';
