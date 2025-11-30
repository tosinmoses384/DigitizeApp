import {useState, useEffect, useCallback} from 'react';
import {router} from 'expo-router';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {setRefetchUserDashboardState} from '../redux/slice/profile/profileSlice';
import wardrobeServices from '../services/features/wardrobe-service/wardrobeServices';

interface UseSellerFollowersFollowingProps {
  userId: string;
  type: 'followers' | 'following';
  search?: string;
}

export const useSellerFollowersFollowing = ({
  userId,
  type,
  search = '',
}: UseSellerFollowersFollowingProps) => {
  const dispatch = useAppDispatch();
  const {token, profile} = useAppSelector(state => state?.userProfileSlice);

  // State management
  const [pageToken, setPageToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any[]>([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load more followers (pagination)
  const getTrifters = useCallback(() => {
    if (pageToken && type === 'followers') {
      wardrobeServices
        .sellerFollowersQuery(
          token,
          search || '',
          '12',
          pageToken || '',
          userId,
        )
        .then((res: any) => {
          setLoading(false);
          let newData = res?.data?.dataset || [];
          setDetails(prevDetails => [...prevDetails, ...newData]);
          setPageToken(res?.data?.pageToken);
          if (res?.responseCode === '401' || res?.responseCode === 401) {
            return router.push('/Onboarding');
          }
        })
        .catch(error => {
          setLoading(false);
        });
    }
  }, [pageToken, type, token, search, userId]);

  // Load initial followers data
  const getInitialItems = useCallback(() => {
    if (type !== 'followers') return;

    setPageToken('');
    setDetails([]);
    setLoading(true);

    wardrobeServices
      .sellerFollowersQuery(token, search || '', '12', '', userId)
      .then((res: any) => {
        setLoading(false);

        setDetails(res?.data?.dataset || []);
        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken);
        }
        if (res?.responseCode === '401' || res?.responseCode === 401) {
          return router.push('/Onboarding');
        }
      })
      .catch(error => {
        setLoading(false);
      });
  }, [type, token, search, userId]);

  // Handle follow action (remove follower)
  const handleFollow = useCallback(
    (storeData: any) => {
      setBtnLoader(true);
      setActiveId(storeData?.id);

      let getNewServer = wardrobeServices.removeTrifter(storeData?.id, token);

      getNewServer
        .then((res: any) => {
          setBtnLoader(false);
          if (res?.succeeded) {
            setActiveId(null);
            dispatch(setRefetchUserDashboardState(true));
            return getInitialItems();
          }
          if (res?.responseCode === '401' || res?.responseCode === 401) {
            return router.push('/Onboarding');
          }
        })
        .catch(error => {
          setBtnLoader(false);
        });
    },
    [token, dispatch, getInitialItems],
  );

  // Update item state (for follow/unfollow actions)
  const updateItemState = useCallback(
    (data: any) => {
      const findExistingItems = details?.find(
        (list: any) => list?.id === data?.id,
      );

      if (findExistingItems) {
        const getNewUpdate = details?.map((list: any) =>
          list?.id === data?.id
            ? {
                ...list,
                isFollowing: list?.isFollowing ? false : true,
              }
            : list,
        );
        setDetails(getNewUpdate);
      }
    },
    [details],
  );

  // Handle follow and unfollow actions
  const handleFollowAndUnfollow = useCallback(
    (selectedData: any) => {
      setBtnLoader(true);
      setActiveId(selectedData?.id);
      let data = {
        brandId: selectedData?.id,
      };

      let getNewServer = selectedData?.isFollowing
        ? wardrobeServices.unfollowTrifters(data, token)
        : wardrobeServices.followTrifters(data, token);

      getNewServer
        .then((res: any) => {
          setBtnLoader(false);
          if (res?.status === 200) {
            dispatch(setRefetchUserDashboardState(true));
            return updateItemState(selectedData);
          }
          if (res?.responseCode === '401' || res?.responseCode === 401) {
            return router.push('/Onboarding');
          }
        })
        .catch(error => {
          setBtnLoader(false);
        });
    },
    [token, dispatch, updateItemState],
  );

  // Load initial data when dependencies change
  useEffect(() => {
    if (token && type === 'followers') {
      getInitialItems();
    }
  }, [token, search, type, getInitialItems]);

  return {
    // Data
    details,
    loading,
    pageToken,
    btnLoader,
    activeId,

    // Actions
    getTrifters,
    getInitialItems,
    handleFollow,
    handleFollowAndUnfollow,
    updateItemState,

    // State setters (for external control if needed)
    setDetails,
    setLoading,
    setPageToken,
    setBtnLoader,
    setActiveId,
  };
};
