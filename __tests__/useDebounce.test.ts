import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('should not update value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('hello');
  });

  it('should update value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('world');
  });

  it('should reset timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => { jest.advanceTimersByTime(200); });

    rerender({ value: 'abc' });
    act(() => { jest.advanceTimersByTime(200); });

    // 'ab' should not have been set because timer was reset
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(100); });

    // Now 300ms have passed since 'abc' was set
    expect(result.current).toBe('abc');
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => { jest.advanceTimersByTime(299); });
    expect(result.current).toBe('initial');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('updated');
  });
});
