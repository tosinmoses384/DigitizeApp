type Listener = () => void;

class AuthNavigationEvents {
  private completeListeners: Set<Listener> = new Set();

  subscribeComplete(listener: Listener): () => void {
    this.completeListeners.add(listener);
    return () => {
      this.completeListeners.delete(listener);
    };
  }

  emitComplete(): void {
    this.completeListeners.forEach(listener => {
      try {
        listener();
      } catch {
        // noop
      }
    });
  }
}

const authNavigationEvents = new AuthNavigationEvents();

export default authNavigationEvents;

