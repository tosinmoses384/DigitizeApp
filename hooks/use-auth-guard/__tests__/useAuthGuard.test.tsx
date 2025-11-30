import { renderHook, act } from '@testing-library/react-native';
import { useAuthGuard } from '../index';
import { useRouter } from 'expo-router';
import { useToast } from 'react-native-toast-notifications';
import { useClearStorage } from '../../clear-storage';

// Mock dependencies
jest.mock('expo-router');
jest.mock('react-native-toast-notifications');
jest.mock('../../clear-storage');
jest.mock('../../../redux/store');

const mockRouter = {
  replace: jest.fn(),
};

const mockToast = {
  show: jest.fn(),
};

const mockClearStorage = jest.fn();

const mockDispatch = jest.fn();

(useRouter as jest.Mock).mockReturnValue(mockRouter);
(useToast as jest.Mock).mockReturnValue(mockToast);
(useClearStorage as jest.Mock).mockReturnValue({ clearStorage: mockClearStorage });

// Mock Redux
jest.mock('../../../redux/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

describe('useAuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle 401 auth errors correctly', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await act(async () => {
      const isAuthError = result.current.handleAuthError({ responseCode: 401 });
      expect(isAuthError).toBe(true);
    });

    expect(mockClearStorage).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(2); // setProfile(null) and setToken('')
    expect(mockToast.show).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.',
      expect.objectContaining({ type: 'warning' })
    );
    expect(mockRouter.replace).toHaveBeenCalledWith('/Onboarding');
  });

  it('should handle string 401 auth errors', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await act(async () => {
      const isAuthError = result.current.handleAuthError({ responseCode: '401' });
      expect(isAuthError).toBe(true);
    });

    expect(mockClearStorage).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/Onboarding');
  });

  it('should handle status code 401 auth errors', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await act(async () => {
      const isAuthError = result.current.handleAuthError({ status: 401 });
      expect(isAuthError).toBe(true);
    });

    expect(mockClearStorage).toHaveBeenCalled();
  });

  it('should not handle non-auth errors', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isAuthError = result.current.handleAuthError({ responseCode: 500 });
    expect(isAuthError).toBe(false);

    expect(mockClearStorage).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should handle API responses correctly', () => {
    const { result } = renderHook(() => useAuthGuard());

    // Normal response
    const normalResponse = { data: 'test', status: 200 };
    const handledResponse = result.current.handleApiResponse(normalResponse);
    expect(handledResponse).toBe(normalResponse);

    // Auth error response
    const authResponse = { responseCode: 401 };
    const handledAuthResponse = result.current.handleApiResponse(authResponse);
    expect(handledAuthResponse).toBe(null);
  });

  it('should wrap API calls with auth guard', async () => {
    const { result } = renderHook(() => useAuthGuard());

    const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });
    const guardedCall = result.current.withAuthGuard(mockApiCall);

    const response = await guardedCall('token123');
    expect(response).toEqual({ data: 'success' });
    expect(mockApiCall).toHaveBeenCalledWith('token123');
  });

  it('should handle auth errors in wrapped API calls', async () => {
    const { result } = renderHook(() => useAuthGuard());

    const mockApiCall = jest.fn().mockResolvedValue({ responseCode: 401 });
    const guardedCall = result.current.withAuthGuard(mockApiCall);

    await expect(guardedCall('token123')).rejects.toThrow('Authentication failed');
    expect(mockClearStorage).toHaveBeenCalled();
  });

  it('should handle network errors in wrapped API calls', async () => {
    const { result } = renderHook(() => useAuthGuard());

    const networkError = {
      response: { status: 401 }
    };
    const mockApiCall = jest.fn().mockRejectedValue(networkError);
    const guardedCall = result.current.withAuthGuard(mockApiCall);

    await expect(guardedCall('token123')).rejects.toThrow('Authentication failed');
    expect(mockClearStorage).toHaveBeenCalled();
  });

  it('should pass through non-auth errors in wrapped API calls', async () => {
    const { result } = renderHook(() => useAuthGuard());

    const serverError = new Error('Server error');
    const mockApiCall = jest.fn().mockRejectedValue(serverError);
    const guardedCall = result.current.withAuthGuard(mockApiCall);

    await expect(guardedCall('token123')).rejects.toThrow('Server error');
    expect(mockClearStorage).not.toHaveBeenCalled();
  });
});
