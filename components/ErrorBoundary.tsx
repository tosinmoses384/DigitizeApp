import React from 'react';
import { View } from 'react-native';
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

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <View />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


