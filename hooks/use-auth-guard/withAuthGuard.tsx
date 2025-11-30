import React, { useEffect, ComponentType } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../redux/store';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../use-auth';

export interface WithAuthGuardOptions {
  redirectTo?: string;
  loadingMessage?: string;
  requireProfile?: boolean;
}

export function withAuthGuard<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthGuardOptions = {}
) {
  const {
    redirectTo = '/Onboarding',
    loadingMessage = 'Checking authentication...',
    requireProfile = true,
  } = options;

  const AuthGuardedComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const { isCheckingAuth, isAuthenticated, token, profile } = useAuth();
    const { profileLoader } = useAppSelector((state) => state?.userProfileSlice);

    useEffect(() => {
      if (!isCheckingAuth && !isAuthenticated) {
        console.log('User not authenticated, redirecting to:', redirectTo);
        router.replace(redirectTo as any);
      }
    }, [isCheckingAuth, isAuthenticated, router]);

    // Show loading while checking auth or loading profile
    if (isCheckingAuth || profileLoader) {
      return <LoadingScreen message={loadingMessage} />;
    }

    // Not authenticated
    if (!isAuthenticated || !token) {
      return <LoadingScreen message="Redirecting to login..." />;
    }

    // Require profile but it's not loaded yet
    if (requireProfile && !profile) {
      return <LoadingScreen message="Loading profile..." />;
    }

    // All checks passed, render the component
    return <Component {...props} />;
  };

  // Set display name for debugging
  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`;

  return AuthGuardedComponent;
}

export default withAuthGuard;
