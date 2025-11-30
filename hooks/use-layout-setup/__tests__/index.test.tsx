import { renderHook } from '@testing-library/react-native';
import { useLayoutSetup } from '../index';

// Mock dependencies
jest.mock('@hooks/use-auth', () => ({
  useAuth: () => ({
    isCheckingAuth: false,
    isAuthenticated: true,
    token: 'mock-token',
    profile: { id: '1', name: 'Test User' },
  }),
}));

jest.mock('@hooks/use-app-initialization', () => ({
  useAppInitialization: () => ({
    isAppReady: true,
    fontsLoaded: true,
  }),
}));

jest.mock('@hooks/use-navigation-setup', () => ({
  useNavigationSetup: () => ({
    navigation: { addListener: jest.fn() },
  }),
}));

jest.mock('@hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@hooks/use-deep-linking', () => ({
  useDeepLinking: () => ({
    handleDeepLink: jest.fn(),
  }),
}));

describe('useLayoutSetup', () => {
  it('should return all necessary layout state', () => {
    const { result } = renderHook(() => useLayoutSetup());

    expect(result.current).toEqual({
      isAppReady: true,
      fontsLoaded: true,
      isCheckingAuth: false,
      isAuthenticated: true,
      token: 'mock-token',
      profile: { id: '1', name: 'Test User' },
      colorScheme: 'light',
      navigation: { addListener: expect.any(Function) },
      handleDeepLink: expect.any(Function),
    });
  });

  it('should handle loading state correctly', () => {
    // Mock loading state
    jest.mocked(require('../use-app-initialization').useAppInitialization).mockReturnValue({
      isAppReady: false,
      fontsLoaded: false,
    });

    const { result } = renderHook(() => useLayoutSetup());

    expect(result.current.isAppReady).toBe(false);
    expect(result.current.fontsLoaded).toBe(false);
  });
});
