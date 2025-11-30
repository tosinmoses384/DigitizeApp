import ApiResponsePayload from '../../http-client/abstractions/models/ApiResponsePayload';
import endpointService from '../../http-client/endpoints/public/endpointClientService';
import {
  ICommentResponse,
  ICreatePostRequest,
  ICreatePostResponse,
  IDeleteStoryResponse,
  IEditPostRequest,
  IEditPostResponse,
  IIsLikePostResponse,
  IPostByIdResponse,
  IPostCommentRequest,
  IPostCommentResponse,
  IPostsResponse,
  IPostStoryRequest,
  IPostStoryResponse,
  IStoryByIdResponse,
  IStoryTagRequest,
  IStoryTagResponse,
  IViewedStoryResponse,
  IReportPostRequest,
  IReportPostResponse,
} from './models';

const timelineServices = {
  createPost: (
    model: ICreatePostRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreatePostResponse>> => {
    return endpointService.Post<ICreatePostRequest, ICreatePostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts`,
      {
        requestId: model?.requestId,
        isRequestIdWardrobeItemId: model?.isRequestIdWardrobeItemId,
        caption: model?.caption,
        tagIds: model?.tagIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  editPost: (
    model: IEditPostRequest,
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IEditPostResponse>> => {
    return endpointService.Put<IEditPostRequest, IEditPostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${id}`,
      {
        caption: model?.caption,
        tagIds: model?.tagIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  deletePost: (
    token: string,
    deleteId: string,
  ): Promise<ApiResponsePayload<ICreatePostResponse>> => {
    return endpointService.Delete<ICreatePostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${deleteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  likePost: (
    token: string,
    postId: string,
  ): Promise<ApiResponsePayload<IIsLikePostResponse>> => {
    return endpointService.PostWihtoutRequestBody<IIsLikePostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${postId}/likes`,
    );
  },

  unLikePost: (
    token: string,
    postId: string,
  ): Promise<ApiResponsePayload<IIsLikePostResponse>> => {
    return endpointService.PutWithoutRequestBody<IIsLikePostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${postId}/likes`,
    );
  },

  getPostQuery: (
    token: string,
    pageSize: string,
    pageToken?: string,
    activeTab?: string,
    filterByCategory?: string,
    sellerId?: string,
    filterByType?: string,
    signal?: AbortSignal,
  ): Promise<ApiResponsePayload<IPostsResponse>> => {
    let url: string;

    // Use different API contracts based on the tab type
    if (activeTab === 'ItemPost' || activeTab === 'OutfitPost') {
      // NEW API CONTRACT for Items and Outfits
      let filterType = filterByType;

      // Build URL with new parameter format
      url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts?filterByCategory=${filterByCategory}&filterByType=${filterType}&pageSize=${pageSize}`;

      // Add pageToken if provided
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      // Add sellerId if provided
      if (sellerId) {
        url += `&userId=${sellerId}`;
      }
    } else {
      // ORIGINAL API CONTRACT for Posts and other tabs
      url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts?PageSize=${pageSize}&PageToken=${pageToken || ''}&FilterByType=${filterByType || ''}&FilterByCategory=${filterByCategory || ''}&userId=${sellerId || ''}`;
    }

    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
  },

  getPostQueryUpdated: (
    token: string,
    pageSize: string,
    activeTab?: string,
    filterByCategory?: string,
    sellerId?: string,
    filterByType?: string,
    pageToken?: string,
    signal?: AbortSignal,
  ): Promise<ApiResponsePayload<IPostsResponse>> => {
    let url: string;

    // Use different API contracts based on the tab type
    if (activeTab === 'ItemPost' || activeTab === 'OutfitPost') {
      // NEW API CONTRACT for Items and Outfits
      let filterType = filterByType;

      // Build URL with new parameter format matching the provided endpoint
      url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts?`;

      // Add userId (sellerId) if provided
      if (sellerId) {
        url += `userId=${sellerId}&`;
      }

      // Add filterByCategory
      if (filterByCategory) {
        url += `filterByCategory=${filterByCategory}&`;
      }

      // Add filterByType
      if (filterType) {
        url += `filterByType=${filterType}&`;
      }

      // Add pageSize
      url += `pageSize=${pageSize}`;

      // Add pageToken if provided
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      // Remove trailing '&' if present
      url = url.replace(/&$/, '');
    } else {
      // ORIGINAL API CONTRACT for Posts and other tabs
      url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts?PageSize=${pageSize}&PageToken=${pageToken || ''}&FilterByType=${filterByType || ''}&FilterByCategory=${filterByCategory || ''}&userId=${sellerId || ''}`;
    }

    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
  },

  getPostCommentsQuery: (
    token: string,
    postId: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<ICommentResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${postId}/comments?PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getPostCommentsReplysQuery: (
    token: string,
    postId: string,
    pageSize: string,
    pageToken?: string,
    commentId?: string,
  ): Promise<ApiResponsePayload<ICommentResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${postId}/comments/${commentId}/replies?PageSize=${pageSize}&PageToken=${pageToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getPostLikesQuery: (
    token: string,
    postId: string,
    pageSize: string,
    pageToken?: string,
    Query?: string,
  ): Promise<ApiResponsePayload<ICommentResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${postId}/likes?Query=${Query}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getPostByIdQuery: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IPostByIdResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  postComment: (
    model: IPostCommentRequest,
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IPostCommentResponse>> => {
    return endpointService.Post<IPostCommentRequest, IPostCommentResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${id}/comments`,
      {
        comment: model?.comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  postReplyComment: (
    model: IPostCommentRequest,
    token: string,
    id: string,
    commentId: string,
  ): Promise<ApiResponsePayload<IPostCommentResponse>> => {
    return endpointService.Post<IPostCommentRequest, IPostCommentResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/posts/${id}/comments/${commentId}/replies`,
      {
        comment: model?.comment,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  postStories: (
    model: IPostStoryRequest,
    token: string,
  ): Promise<ApiResponsePayload<IPostStoryResponse>> => {
    return endpointService.Post<IPostStoryRequest, IPostStoryResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories`,
      {
        requestId: model?.requestId,
        storyType: model?.storyType,
        caption: model?.caption,
        tagIds: model?.tagIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getStoriesQuery: (
    token: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IPostsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories?PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  deleteStory: (
    token: string,
    deleteId: string,
  ): Promise<ApiResponsePayload<IDeleteStoryResponse>> => {
    return endpointService.Delete<IDeleteStoryResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories/${deleteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  editStories: (
    model: IStoryTagRequest,
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IStoryTagResponse>> => {
    return endpointService.Put<IStoryTagRequest, IStoryTagResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories/${id}`,
      {
        caption: model?.caption,
        tagIds: model?.tagIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getStoryByIdQuery: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IStoryByIdResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  isViewedStories: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IViewedStoryResponse>> => {
    return endpointService.Put<null, IViewedStoryResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/stories/${id}/viewed`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  reportPost: (
    token: string,
    postId: string,
    model: IReportPostRequest,
  ): Promise<ApiResponsePayload<IReportPostResponse>> => {
    const endpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/post-settings/posts/${postId}/report`;
    return endpointService.Post<IReportPostRequest, IReportPostResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/post-settings/posts/${postId}/report`,
      model,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  reportReasons: (
    token: string,
  ): Promise<ApiResponsePayload<IPostsResponse>> => {
    const endpoint = `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/post-settings/report-reasons/lov`;
    return endpointService.Get(
      endpoint,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getReportActions: (
    token: string,
  ): Promise<ApiResponsePayload<IPostsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/post-settings/report-actions/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getWardrobeAssets: (
    token: string,
    userId: string,
    assetType: 'WardrobeItem' | 'WardrobeOutfit',
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/timeline/v1/explore-wardrobe/wardrobe-assets?userId=${userId}&assetType=${assetType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};

export default timelineServices;
