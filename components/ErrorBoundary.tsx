import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { trackEvent } from '@services/analyticsService';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  async componentDidCatch(error: Error): Promise<void> {
    try {
      trackEvent('js-error', { message: String(error?.message || ''), component: 'ErrorBoundary' });
    } catch {}
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontFamily: 'DMSansSemiBold',
    color: '#071827',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#5C6F7F',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF3B4A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSansSemiBold',
  },
});

export default ErrorBoundary;


