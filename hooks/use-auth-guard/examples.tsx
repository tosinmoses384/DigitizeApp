// Example: Refactoring ProfileMain component to use Auth Guard

// BEFORE (Original approach):
/*
const ProfileMain = () => {
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [loading, setLoading] = useState(false);

  const getUserDashboard = () => {
    setLoading(true);
    marketPlaceServices
      .userSocialProfile(token)
      .then((res: any) => {
        setLoading(false);
        if (res?.status === 200) {
          setUserDashboard(res?.data);
          return;
        }
        if (res?.responseCode === "401" || res?.responseCode === 401) {
          return router.push("/Onboarding"); // Manual auth handling
        }
      })
      .catch((error) => {
        setLoading(false);
      });
  };
};
*/

// AFTER (Using Auth Guard):
import React, { useState, useEffect } from 'react';
import { useApiService } from '@hooks/use-auth-guard';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';

const ProfileMainComponent = () => {
  const [userDashboard, setUserDashboard] = useState(null);
  const { callApiWithLoading } = useApiService();
  const [loading, setLoading] = useState(false);

  const getUserDashboard = async () => {
    await callApiWithLoading(
      (token) => marketplaceServices.userSocialProfile(token),
      setLoading,
      {
        onSuccess: (res: any) => {
          if (res?.status === 200) {
            setUserDashboard(res?.data);
          }
        },
        onError: (error) => {
          console.error('Failed to fetch user dashboard:', error);
          // Error handling without manual auth checks
        }
        // Auth errors are handled automatically by the guard
      }
    );
  };

  useEffect(() => {
    getUserDashboard();
  }, []);

  return (
    // Your component JSX here
    <div>Profile Main Content</div>
  );
};

// Wrap the component with auth guard
export const ProfileMain = withAuthGuard(ProfileMainComponent, {
  loadingMessage: 'Loading profile...',
  requireProfile: true,
});

export default ProfileMain;
