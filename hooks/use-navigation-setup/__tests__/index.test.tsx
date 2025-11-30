import { renderHook } from '@testing-library/react-native';
import { useNavigationSetup } from '../use-navigation-setup';

// Mock expo-router
const mockAddListener = jest.fn();
const mockDispatch = jest.fn();

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    addListener: mockAddListener,
    dispatch: mockDispatch,
  }),
}));

describe('useNavigationSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddListener.mockReturnValue(() => {}); // Mock cleanup function
  });

  it('should setup navigation listener', () => {
    const { result } = renderHook(() => useNavigationSetup());

    expect(mockAddListener).toHaveBeenCalledWith('beforeRemove', expect.any(Function));
    expect(result.current.navigation).toBeDefined();
  });

  it('should handle beforeRemove event correctly', () => {
    renderHook(() => useNavigationSetup());

    // Get the listener function that was passed to addListener
    const listenerFunction = mockAddListener.mock.calls[0][1];
    
    // Mock event object
    const mockEvent = {
      preventDefault: jest.fn(),
      data: { action: 'test-action' },
    };

    // Call the listener
    listenerFunction(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith('test-action');
  });

  it('should cleanup listener on unmount', () => {
    const mockCleanup = jest.fn();
    mockAddListener.mockReturnValue(mockCleanup);

    const { unmount } = renderHook(() => useNavigationSetup());

    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });
});
