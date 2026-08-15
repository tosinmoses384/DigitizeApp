import authNavigationEvents from '../utils/authNavigationEvents';

describe('AuthNavigationEvents', () => {
  it('should call listener when emitComplete is invoked', () => {
    const listener = jest.fn();
    authNavigationEvents.subscribeComplete(listener);

    authNavigationEvents.emitComplete();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should support multiple listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    authNavigationEvents.subscribeComplete(listener1);
    authNavigationEvents.subscribeComplete(listener2);

    authNavigationEvents.emitComplete();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe listener when cleanup function is called', () => {
    const listener = jest.fn();
    const unsubscribe = authNavigationEvents.subscribeComplete(listener);

    unsubscribe();
    authNavigationEvents.emitComplete();

    expect(listener).not.toHaveBeenCalled();
  });

  it('should not throw if a listener throws an error', () => {
    const failingListener = jest.fn(() => {
      throw new Error('listener error');
    });
    const healthyListener = jest.fn();

    authNavigationEvents.subscribeComplete(failingListener);
    authNavigationEvents.subscribeComplete(healthyListener);

    expect(() => authNavigationEvents.emitComplete()).not.toThrow();
    expect(healthyListener).toHaveBeenCalledTimes(1);
  });

  it('should not add the same listener twice', () => {
    const listener = jest.fn();
    authNavigationEvents.subscribeComplete(listener);
    authNavigationEvents.subscribeComplete(listener);

    authNavigationEvents.emitComplete();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
