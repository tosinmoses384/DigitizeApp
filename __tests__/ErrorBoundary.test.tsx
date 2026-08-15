import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Mock analytics
jest.mock('../services/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

const ProblemChild = () => {
  throw new Error('Test error');
};

const GoodChild = () => <Text>All good</Text>;

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors during tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(getByText('All good')).toBeTruthy();
  });

  it('should render fallback UI when a child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('An unexpected error occurred. Please try again.')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should track the error via analytics', () => {
    const { trackEvent } = require('../services/analyticsService');

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(trackEvent).toHaveBeenCalledWith('js-error', {
      message: 'Test error',
      component: 'ErrorBoundary',
    });
  });

  it('should recover when Try Again is pressed', () => {
    let shouldThrow = true;

    const ConditionalChild = () => {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <Text>Recovered</Text>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ConditionalChild />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the child before retrying
    shouldThrow = false;

    fireEvent.press(getByText('Try Again'));

    expect(getByText('Recovered')).toBeTruthy();
  });
});
