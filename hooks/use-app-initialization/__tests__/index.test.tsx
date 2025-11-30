import { renderHook } from '@testing-library/react-native';
import { useAppInitialization } from '../use-app-initialization';

// Mock expo-font and expo-splash-screen
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]), // Mock fonts as loaded
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAppInitialization());

    expect(result.current.fontsLoaded).toBe(true);
    expect(result.current.isAppReady).toBe(true);
  });

  it('should handle font loading correctly', () => {
    const mockUseFonts = require('expo-font').useFonts;
    mockUseFonts.mockReturnValue([false]); // Fonts not loaded

    const { result } = renderHook(() => useAppInitialization());

    expect(result.current.fontsLoaded).toBe(false);
  });

  it('should call splash screen methods', () => {
    const mockPreventAutoHide = require('expo-splash-screen').preventAutoHideAsync;
    const mockHideAsync = require('expo-splash-screen').hideAsync;

    renderHook(() => useAppInitialization());

    expect(mockPreventAutoHide).toHaveBeenCalled();
    // Note: hideAsync is called asynchronously in useEffect
  });
});
