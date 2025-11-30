import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePaginatedQuery } from './use-paginated-query';
import timelineServices from '@services/features/timeline-service/timelineServices';

export interface UserStorySlidesDataType {
  userId: string;
  userImage: string;
  username: string;
  stories: Array<StoryItemDataType>;
  isOfficial: boolean;
  isViewed: boolean;
}

export interface StoryItemDataType {
  storyId: string;
  storyMediaUrl: string;
  swipeText: string;
  type: string;
  isViewed: boolean;
  hasTag: boolean;
  createdOn: Date;
}

interface UseStoriesParams {
  token: string;
  pageSize?: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export const useStories = ({
  token,
  userId,
  pageSize = '12',
  enabled = true,
  refetchOnFocus = true,
}: UseStoriesParams & { userId?: string }) => {
  const fetchStories = async (pageToken: string) => {
    return await timelineServices.getStoriesQuery(
      token,
      pageSize,
      pageToken
    );
  };

  const query = usePaginatedQuery<UserStorySlidesDataType>({
    queryKey: ['stories', userId || '', pageSize],
    queryFn: fetchStories,
    enabled: enabled && !!token,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useFocusEffect(
    useCallback(() => {
      if (refetchOnFocus && enabled && token) {
        if (__DEV__) {
          console.log('useStories: Screen focused, refetching stories...');
        }
        query.refetch();
      }
    }, [refetchOnFocus, enabled, token, query.refetch])
  );

  return query;
};

