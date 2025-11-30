import React from 'react';
import { renderWithProviders, mockHooks } from '../../__tests__/test-utils';
import RootLayout from '../_layout';

// Mock all the dependencies
jest.mock('../hooks/use-layout-setup', () => ({
  useLayoutSetup: jest.fn(() => mockHooks.useLayoutSetup),
}));

jest.mock('../components/LoadingScreen', () => ({
  LoadingScreen: ({ message }: { message: string }) => (
    <div testID="loading-screen" data-message={message}>
      {message}
    </div>
  ),
}));

jest.mock('../components/AppNavigationStack', () => ({
  AppNavigationStack: () => <div testID="navigation-stack">Navigation</div>,
}));

jest.mock('../components/AppTrackingTransparencyWrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div testID="att-wrapper">{children}</div>
  ),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
    <div testID="gesture-handler">{children}</div>
  ),
}));

jest.mock('react-native-toast-notifications', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div testID="toast-provider">{children}</div>
  ),
}));

jest.mock('react-native', () => ({
  StatusBar: () => <div testID="status-bar">StatusBar</div>,
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation stack when app is ready', () => {
    const { getByTestId } = renderWithProviders(<RootLayout />);

    expect(getByTestId('att-wrapper')).toBeTruthy();
    expect(getByTestId('status-bar')).toBeTruthy();
    expect(getByTestId('gesture-handler')).toBeTruthy();
    expect(getByTestId('toast-provider')).toBeTruthy();
    expect(getByTestId('navigation-stack')).toBeTruthy();
  });

  it('should render loading screen when app is not ready', () => {
    const mockUseLayoutSetup = require('../hooks/use-layout-setup').useLayoutSetup;
    mockUseLayoutSetup.mockReturnValue({
      ...mockHooks.useLayoutSetup,
      isAppReady: false,
      fontsLoaded: false,
      isCheckingAuth: true,
    });

    const { getByTestId } = renderWithProviders(<RootLayout />);

    expect(getByTestId('loading-screen')).toBeTruthy();
    expect(getByTestId('loading-screen')).toHaveAttribute('data-message', 'Initializing app...');
  });

  it('should render loading screen when fonts are not loaded', () => {
    const mockUseLayoutSetup = require('../hooks/use-layout-setup').useLayoutSetup;
    mockUseLayoutSetup.mockReturnValue({
      ...mockHooks.useLayoutSetup,
      fontsLoaded: false,
    });

    const { getByTestId } = renderWithProviders(<RootLayout />);

    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('should render loading screen when checking authentication', () => {
    const mockUseLayoutSetup = require('../hooks/use-layout-setup').useLayoutSetup;
    mockUseLayoutSetup.mockReturnValue({
      ...mockHooks.useLayoutSetup,
      isCheckingAuth: true,
    });

    const { getByTestId } = renderWithProviders(<RootLayout />);

    expect(getByTestId('loading-screen')).toBeTruthy();
  });

  it('should integrate properly with Redux store', () => {
    const initialState = {
      userProfileSlice: {
        token: 'test-token',
        profile: { id: '1', name: 'Test User' },
        refetchUserState: false,
        profileLoaderState: false,
      },
    };

    const { store } = renderWithProviders(<RootLayout />, { initialState });

    expect(store.getState().userProfileSlice.token).toBe('test-token');
    expect(store.getState().userProfileSlice.profile.name).toBe('Test User');
  });
});
