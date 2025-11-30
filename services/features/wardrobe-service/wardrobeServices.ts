import ApiResponsePayload from '../../http-client/abstractions/models/ApiResponsePayload';
import endpointService from '../../http-client/endpoints/public/endpointClientService';
import {
  IAddItemToWardrobeRequest,
  IAddItemToWardrobeResponse,
  IBrandsResponse,
  IItemsResponse,
  ICategorySizeRequest,
  ICategorySizeResponse,
  IChangeUsernameRequest,
  IChangeUsernameResponse,
  ICreateUserItemRequest,
  ICreateUserItemResponse,
  ICreateUserOutfitRequest,
  ICreateUserOutfitResponse,
  ICreateUserPlanRequest,
  ICreateUserPlanResponse,
  IDeleteUserListItemResponse,
  IFavouriteItemRequest,
  IFavouriteItemResponse,
  IFollowBrandRequest,
  ILeaveReviewRequest,
  ILeaveReviewResponse,
  IFollowBrandsResponse,
  IListItemsRequest,
  IMarkItemAsSoldResponse,
  IOutfitResponse,
  IPersonalizationCategoryResponse,
  IRemoveTrifterResponse,
  IReviewsRequest,
  IReviewsResponse,
  IUserFavRequest,
  IUserSocialsResponse,
  ICreateCollectionRequest,
  ICreateCollectionResponse,
  IAddOutfitsToCollectionRequest,
  IAddOutfitsToCollectionResponse,
  IGetCollectionsResponse,
  IGetCollectionOutfitsResponse,
  IUpdateCollectionRequest,
  IUpdateCollectionResponse,
  IDeleteCollectionResponse,
  IRemoveOutfitFromCollectionResponse,
} from './models';

const wardrobeServices = {
  brandQuery: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/trifter/followers?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  brandQueryFollow: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
    followingBrands?: number,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-brands?Query=${query}&FollowingBrands=${followingBrands}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  sellerBrandQueryFollow: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
    userId?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/trifters/${userId}/socials/following-brands?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  triftersQuery: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
    followingStatus?: number,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-trifters?Query=${query}&FollowingTrifters=${followingStatus}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  triftersUserFollowingQuery: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
    userId?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-trifters?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}&userId=${userId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  triftersFollowersQuery: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/followers?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  sellerFollowersQuery: (
    token: string,
    query: string,
    pageSize: string,
    pageToken?: string,
    userId?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/trifters/${userId}/socials/followers?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  additemToWardrobe: (
    model: IAddItemToWardrobeRequest,
    token: string,
  ): Promise<ApiResponsePayload<IAddItemToWardrobeResponse>> => {
    return endpointService.Post<
      IAddItemToWardrobeRequest,
      IAddItemToWardrobeResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items`,
      {
        requestId: model?.requestId,
        brandId: model?.brandId,
        sizeId: model?.sizeId,
        colourIds: model?.colourIds,
        categoryId: model?.categoryId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  addMultipleItemToWardrobe: (
    model: IAddItemToWardrobeRequest,
    token: string,
  ): Promise<ApiResponsePayload<IAddItemToWardrobeResponse>> => {
    return endpointService.Post<
      IAddItemToWardrobeRequest,
      IAddItemToWardrobeResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/multiple`,

      {
        requestId: model?.requestId,
        brandId: model?.brandId,
        sizeId: model?.sizeId,
        colourIds: model?.colourIds,
        categoryId: model?.categoryId,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  // Submit multiple items with minimal payload (just request IDs)
  submitMultipleItems: (
    items: {
      requestId: string | null;
      brandId?: string | null;
      categoryId?: string | null;
      sizeId?: string | null;
      colourIds?: string[] | null;
      seasonId?: string | null;
    }[],
    token: string,
  ): Promise<ApiResponsePayload<any>> => {
    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items/multiple`;

    return endpointService.Post<any, any>(url, items, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 90000,
    });
  },
  itemsQuery: (
    token: string,
    query: string,
    pageSize: string,
    userId: string,
    pageToken?: string,
    status?: any,
  ): Promise<ApiResponsePayload<IItemsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items?Query=${query}&Status=${status || ''}&PageSize=${pageSize}&PageToken=${pageToken || ''}&userId=${userId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getAllWardrobeItems: (
    token: string,
    pageSize: string,
    pageToken: string | undefined,
    userId: string,
  ): Promise<ApiResponsePayload<IItemsResponse>> => {
    let url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items?pageSize=${pageSize}&userId=${userId}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  outfitsQuery: (
    token: string,
    trifterId: string,
    query: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IOutfitResponse>> => {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    const encodedQuery = encodeURIComponent(query || '');
    const fullUrl = `${baseUrl}/wardrobe/v1/outfits?Query=${encodedQuery}&TrifterId=${trifterId}&PageSize=${pageSize}&PageToken=${pageToken || ''}`;

    return endpointService.Get(
      fullUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getAllWardrobeOutfits: (
    token: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IOutfitResponse>> => {
    let url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits?pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  createUserItem: (
    model: ICreateUserItemRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreateUserItemResponse>> => {
    return endpointService.Post<
      ICreateUserItemRequest,
      ICreateUserItemResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings`,
      {
        ...(model?.existingItemId
          ? { existingItemId: model?.existingItemId }
          : {}),
        ...(model?.requestId ? { requestId: model?.requestId } : {}),
        title: model?.title,
        description: model?.description,
        defaultImageUrl: model?.defaultImageUrl,
        price: model?.price,
        categoryId: model?.categoryId,
        brandId: model?.brandId,
        sizeId: model?.sizeId,
        conditionId: model?.conditionId,
        colourIds: model?.colourIds,
        materialIds: model?.materialIds,
        seasonId: model?.seasonId,
        // Conditional shipping fields - only send if they exist
        ...(model?.parcelSizeId ? { parcelSizeId: model?.parcelSizeId } : {}),
        ...(model?.offlineShippingPrice ? { offlineShippingPrice: model?.offlineShippingPrice } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  editUserItem: (
    model: ICreateUserItemRequest,
    token: string,
    itemId: string,
  ): Promise<ApiResponsePayload<ICreateUserItemResponse>> => {
    return endpointService.Put<ICreateUserItemRequest, ICreateUserItemResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings/${itemId}`,
      {
        requestId: model?.requestId,
        title: model?.title,
        description: model?.description,
        defaultImageUrl: model?.defaultImageUrl,
        price: model?.price,
        categoryId: model?.categoryId,
        brandId: model?.brandId,
        sizeId: model?.sizeId,
        conditionId: model?.conditionId,
        colourIds: model?.colourIds,
        materialIds: model?.materialIds,
        seasonId: model?.seasonId,
        // Conditional shipping fields - only send if they exist
        ...(model?.parcelSizeId ? { parcelSizeId: model?.parcelSizeId } : {}),
        ...(model?.offlineShippingPrice ? { offlineShippingPrice: model?.offlineShippingPrice } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  updateItem: (
    requestId: string,
    brandId: string,
    sizeId: string,
    colourIds: string[],
    token: string,
    itemId: string,
    seasonId?: string,
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Put(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items/${itemId}`,
      {
        requestId,
        brandId,
        sizeId,
        colourIds,
        seasonId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  listItemById: (
    token: string,
    listId: string,
  ): Promise<ApiResponsePayload<ICreateUserItemResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings/${listId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  createUserOutfit: (
    model: ICreateUserOutfitRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreateUserOutfitResponse>> => {
    return endpointService.Post<
      ICreateUserOutfitRequest,
      ICreateUserOutfitResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits`,
      {
        requestId: model?.requestId,
        title: model?.title,
        description: model?.description,
        itemIds: model?.itemIds,
        isPrivate: model?.isPrivate,
        metadata: model?.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  editUserOutfit: (
    model: ICreateUserOutfitRequest,
    token: string,
    outFitId: string,
  ): Promise<ApiResponsePayload<ICreateUserOutfitResponse>> => {
    return endpointService.Put<
      ICreateUserOutfitRequest,
      ICreateUserOutfitResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits/${outFitId}`,
      {
        requestId: model?.requestId,
        title: model?.title,
        description: model?.description,
        itemIds: model?.itemIds,
        isPrivate: model?.isPrivate,
        metadata: model?.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  postUserPlans: (
    model: ICreateUserPlanRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreateUserPlanResponse>> => {
    return endpointService.Post<
      ICreateUserPlanRequest,
      ICreateUserPlanResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans`,
      {
        planDate: model?.planDate,
        title: model?.title,
        description: model?.description,
        wardrobeAssetIds: model?.wardrobeAssetIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  postUserPlanAssets: (
    model: ICreateUserPlanRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreateUserPlanResponse>> => {
    const payload: {
      planDate: string;
      wardrobeAssetIds: string[];
      title?: string;
      description?: string;
    } = {
      planDate: model.planDate,
      wardrobeAssetIds: model.wardrobeAssetIds,
    };

    if (model.title) {
      payload.title = model.title;
    }

    if (model.description) {
      payload.description = model.description;
    }

    return endpointService.Post<
      typeof payload,
      ICreateUserPlanResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans/assets`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  editUserPlans: (
    model: ICreateUserPlanRequest,
    token: string,
    planId: string,
  ): Promise<ApiResponsePayload<ICreateUserPlanResponse>> => {
    return endpointService.Put<ICreateUserPlanRequest, ICreateUserPlanResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans/${planId}`,
      {
        planDate: model?.planDate,
        title: model?.title,
        description: model?.description,
        wardrobeAssetIds: model?.wardrobeAssetIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  deleteUserOutfit: (
    token: string,
    outFitId: string,
  ): Promise<ApiResponsePayload<ICreateUserOutfitResponse>> => {
    return endpointService.Delete<ICreateUserOutfitResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits/${outFitId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  deleteUserPlan: (
    token: string,
    planId: string,
  ): Promise<ApiResponsePayload<ICreateUserPlanResponse>> => {
    return endpointService.Delete<ICreateUserPlanResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans/${planId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  deleteUserItem: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<ICreateUserOutfitResponse>> => {
    return endpointService.Delete<ICreateUserOutfitResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  deleteUserListItem: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IDeleteUserListItemResponse>> => {
    return endpointService.Delete<IDeleteUserListItemResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  userSocial: (
    token: string,
  ): Promise<ApiResponsePayload<IUserSocialsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  listItemsQuery: (
    { token, pageQuery, pageSize, pageToken }: IListItemsRequest,
    FilterByStatus?: string,
  ): Promise<ApiResponsePayload<IReviewsResponse>> => {
    return endpointService.Get(
      `${
        process.env.EXPO_PUBLIC_API_BASE_URL
      }/wardrobe/v1/user-listings?Query=${pageQuery}&FilterByStatus=${
        FilterByStatus || ''
      }&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  reviewsQuery: ({
    token,
    trifterId,
    pageSize,
    pageToken,
  }: IReviewsRequest): Promise<ApiResponsePayload<IReviewsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/trifter-reviews?TrifterId=${trifterId}&PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  submitReview: (
    trifterId: string,
    model: ILeaveReviewRequest,
    token: string
  ): Promise<ApiResponsePayload<ILeaveReviewResponse>> => {
    return endpointService.Post<ILeaveReviewRequest, ILeaveReviewResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/trifter-reviews/${trifterId}/reviews`,
      {
        ratings: model.ratings,
        review: model.review,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  categoryQuery: (
    token: string,
  ): Promise<ApiResponsePayload<IPersonalizationCategoryResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-preferences/sizes`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getOutfit: (
    token: string,
    outfitId: string,
  ): Promise<ApiResponsePayload<IOutfitResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits/${outfitId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getItemById: (
    token: string,
    itemId: string,
  ): Promise<ApiResponsePayload<IOutfitResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getItemByIdUpdated: (
    token: string,
    itemId: string,
  ): Promise<ApiResponsePayload<IOutfitResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/items/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  updateItemCategoriesSizeById: (
    model: ICategorySizeRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICategorySizeResponse>> => {
    return endpointService.Post<ICategorySizeRequest, ICategorySizeResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-preferences/sizes`,
      {
        categoryId: model?.categoryId,
        sizeId: model?.sizeId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  removeItemCategoriesSizeById: (
    preferenceId: string,
    token: string,
  ): Promise<ApiResponsePayload<ICategorySizeResponse>> => {
    return endpointService.Delete<ICategorySizeResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-preferences/sizes/${preferenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  unfollowBrands: (
    model: IFollowBrandRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFollowBrandsResponse>> => {
    return endpointService.PutWithoutRequestBody<IFollowBrandsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-brands/${model?.brandId}/unfollow`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  followBrands: (
    model: IFollowBrandRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFollowBrandsResponse>> => {
    return endpointService.PostWihtoutRequestBody<IFollowBrandsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-brands/${model?.brandId}/follow`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  followTrifters: (
    model: IFollowBrandRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFollowBrandsResponse>> => {
    return endpointService.PostWihtoutRequestBody<IFollowBrandsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-trifters/${model?.brandId}/follow`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  unfollowTrifters: (
    model: IFollowBrandRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFollowBrandsResponse>> => {
    return endpointService.PutWithoutRequestBody<IFollowBrandsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/following-trifters/${model?.brandId}/unfollow`,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  removeTrifter: (
    trifterId: string,
    token: string,
  ): Promise<ApiResponsePayload<IRemoveTrifterResponse>> => {
    return endpointService.PutWithoutRequestBody<IRemoveTrifterResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-socials/followers/${trifterId}/remove`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  favouriteItem: (
    model: IFavouriteItemRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFavouriteItemResponse>> => {
    return endpointService.Post<IFavouriteItemRequest, IFavouriteItemResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-favourites/items`,
      {
        itemId: model?.itemId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  removeFavouriteItem: (
    model: IFavouriteItemRequest,
    token: string,
  ): Promise<ApiResponsePayload<IFavouriteItemResponse>> => {
    return endpointService.DeleteWithRequestBody<
      IFavouriteItemRequest,
      IFavouriteItemResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-favourites/items`,
      {
        itemId: model?.itemId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  userFavourites: (
    token: string,
    { PageSize, PageToken }: IUserFavRequest,
  ): Promise<ApiResponsePayload<IReviewsResponse>> => {
    return endpointService.GetWithParams(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-favourites/items`,
      {
        PageSize,
        PageToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  changeUsername: (
    model: IChangeUsernameRequest,
    token: string,
  ): Promise<ApiResponsePayload<IChangeUsernameResponse>> => {
    return endpointService.Put<IChangeUsernameRequest, IChangeUsernameResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-preferences/change-username`,
      {
        username: model?.username,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  markItemAsSoldListItem: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IMarkItemAsSoldResponse>> => {
    return endpointService.Put<null, IMarkItemAsSoldResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-listings/${id}/sold`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  userUpcomingEvents: (
    token: string,
    pageSize: string,
    pageToken?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans/upcoming-events?PageSize=${pageSize}&PageToken=${pageToken}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  userUserPlans: (
    token: string,
    pageSize: string,
    pageToken?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/user-plans?PageSize=${pageSize}&PageToken=${pageToken}&startDate=${startDate}&endDate=${endDate}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  createOutfitCollection: (
    model: ICreateCollectionRequest,
    token: string,
  ): Promise<ApiResponsePayload<ICreateCollectionResponse>> => {
    return endpointService.Post<
      ICreateCollectionRequest,
      ICreateCollectionResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections`,
      model,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  addOutfitsToCollection: (
    model: IAddOutfitsToCollectionRequest,
    token: string,
  ): Promise<ApiResponsePayload<IAddOutfitsToCollectionResponse>> => {
    return endpointService.Post<
      IAddOutfitsToCollectionRequest,
      IAddOutfitsToCollectionResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/add-outfit`,
      model,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getOutfitCollections: (
    token: string,
    pageSize: string = '20',
    pageToken: string = '',
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get<any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections?pageSize=${pageSize}&pageToken=${pageToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getOutfitsInCollection: (
    collectionId: string,
    token: string,
    pageSize: string = '20',
    pageToken: string = '',
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get<any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}/outfits?pageSize=${pageSize}&pageToken=${pageToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  updateOutfitCollection: (
    collectionId: string,
    model: { name: string; description: string },
    token: string,
  ): Promise<ApiResponsePayload<ICreateCollectionResponse>> => {
    return endpointService.Put<
      { name: string; description: string },
      ICreateCollectionResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}`,
      model,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  deleteOutfitCollection: (
    collectionId: string,
    token: string,
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Delete<any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getCollections: (
    token: string,
    pageSize: string = '12',
    pageToken?: string,
  ): Promise<ApiResponsePayload<IGetCollectionsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections?PageSize=${pageSize}&PageToken=${pageToken || ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getCollectionOutfits: (
    collectionId: string,
    token: string,
    pageSize: string = '12',
    pageToken?: string,
  ): Promise<ApiResponsePayload<IGetCollectionOutfitsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}/outfits?PageSize=${pageSize}&PageToken=${pageToken || ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  updateCollection: (
    collectionId: string,
    model: IUpdateCollectionRequest,
    token: string,
  ): Promise<ApiResponsePayload<IUpdateCollectionResponse>> => {
    return endpointService.Put<
      IUpdateCollectionRequest,
      IUpdateCollectionResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}`,
      model,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  deleteCollection: (
    collectionId: string,
    token: string,
  ): Promise<ApiResponsePayload<IDeleteCollectionResponse>> => {
    return endpointService.Delete<IDeleteCollectionResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/${collectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  removeOutfitFromCollection: (
    collectionId: string,
    outfitId: string,
    token: string,
  ): Promise<ApiResponsePayload<IRemoveOutfitFromCollectionResponse>> => {
    return endpointService.Delete<IRemoveOutfitFromCollectionResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wardrobe/v1/outfits-collections/remove-outfit/${collectionId}/${outfitId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
export default wardrobeServices;
