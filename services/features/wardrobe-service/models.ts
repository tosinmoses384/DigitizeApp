export interface IBrandsResponse {
  data: [
    {
      id: string;
      name: string;
      logoImageUrl: string;
      status?: string;
      createdOn?: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface IOutfitResponse {
  data: {
      id: string;
      requestId?: string;
      title: string;
      description: string;
    imageUrl: string;
    status: string;
    items?: {
      id: string;
      name: string;
      imageUrl: string;
    }[];
    metadata?: Record<string, string>;
    createdOn?: string;
  };
  message: string;
  responseCode: string;
}

export interface IItemsResponse {
  dataset: {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    defaultImageUrl?: string;
    brand?: string;
    amount?: number;
    price?: number;
    status?: string | number;
    createdOn?: string;
  }[];
  pageSize?: number;
  pageItemCount?: number;
  pageToken?: string | null;
  hasNextPage?: boolean;
  custom?: any;
}

export interface IAddItemToWardrobeRequest {
  requestId: string;
  brandId: string;
  sizeId: string;
  colourIds: [string];
  categoryId: string;
}

export interface IAddItemToWardrobeResponse {
  data: {
    id: string;
    brandId: string;
    brandName: string;
    itemImageUrls: [string];
    colours: [string];
    sizeId: string;
    createdOn: string;
    status: number;
  };
  message: string;
  responseCode: string;
}

export interface ICreateUserItemRequest {
  // Core item information (always required)
  existingItemId?: string;
  requestId?: string;
  title: string;
  description: string;
  defaultImageUrl: string;
  price: number;
  categoryId: string;
  brandId: string;
  sizeId: string;
  conditionId: string;
  colourIds: string[];
  materialIds: string[];
  seasonId: string;
  
  // Shipping fields (conditionally required)
  offlineShippingPrice?: number;  // Required when offline shipping is enabled
  parcelSizeId?: string;         // Required when standard shipping is used
}

export interface ICreateUserOutfitRequest {
  requestId: string | null;
  title: string;
  description: string;
  itemIds: string[] | null;
  isPrivate: boolean;
  metadata?: Record<string, string>;
}

export interface ICreateUserOutfitResponse {
  data: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    status: any;
    createdOn: string;
  };
  message: string;
  responseCode: string;
}

export interface ICreateUserPlanRequest {
  planDate: string;
  title?: string;
  description: string;
  wardrobeAssetIds: string[];
}

export interface ICreateUserPlanResponse {
  data: {
    id: string;
    planDate: string;
    description: string;
    wardrobeAssets: [
      {
        id: string;
        name: string;
        description: string;
        type: string;
        imageUrl: string;
      },
    ];
    createdOn: string;
  };
  message: string;
  responseCode: string;
}

export interface IDeleteUserListItemResponse {
  data: {
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
}

export interface IMarkItemAsSoldResponse {
  data: {
    id: string;
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface ICreateUserItemResponse {
  data: {
    id: string;
    title: string;
    description: string;
    defaultImageUrl: string;
    imageUrls: [string];
    price: 0;
    categoryId: string;
    category: string;
    brandId: string;
    brand: string;
    sizeId: string;
    size: string;
    colours: [string];
    createdOn: string;
    status: number;
    itemMaterials: [string];
    conditionId: string;
    condition: string;
  };
  message: string;
  responseCode: string;
}
export interface IUserSocialsResponse {
  data: {
    trifterUserId: string;
    followingTriftersCount: number;
    followingBrandsCount: number;
    followerCount: number;
    trifterProfileImageUrl: string;
    trifterName: string;
  };
  message: string;
  responseCode: string;
}

export interface IListItemsRequest {
  token: string;
  pageQuery?: string;
  pageSize: string;
  pageToken: string;
}

export interface IReviewsResponse {
  data: [
    {
      id: string;
      trifterId: string;
      trifterName: string;
      ratings: number;
      review: string;
      createdBy: string;
      createdOn: string;
    },
  ];
  message: string;
  responseCode: string;
}
export interface IReviewsRequest {
  token: string;
  trifterId: string;
  pageSize: string;
  pageToken: string;
}

export interface ILeaveReviewRequest {
  ratings: number;
  review: string;
}

export interface ILeaveReviewResponse {
  id: string;
  trifterId: string;
  ratings: number;
  review: string;
  createdBy: string;
  createdOn: string;
  message: string;
  responseCode: string;
}

export interface IPersonalizationCategoryResponse {
  data: [
    {
      categoryId: string;
      categoryName: string;
      preferences: string;
    },
  ];
  message: string;
  responseCode: string;
}

export interface ICategorySizeRequest {
  categoryId: string;
  sizeId: string;
}

export interface ICategorySizeResponse {
  data: {
    categoryId: string;
    categoryName: string;
    sizeId: string;
    size: string;
  };
  message: string;
  responseCode: string;
}

export interface IFollowBrandsResponse {
  data: {
    id: string;
    name: string;
    imageUrl: string;
  };
  message: string;
  responseCode: string;
}

export interface IRemoveTrifterResponse {
  data: {
    trifterUserId: string;
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
}

export interface IFollowBrandRequest {
  brandId: string;
}

export interface IFavouriteItemRequest {
  itemId: string;
}

export interface IFavouriteItemResponse {
  data: {
    userId: string;
    itemId: string;
  };
  message: string;
  responseCode: string;
}

export interface IUserFavRequest {
  PageSize: string;
  PageToken: string;
}

export interface IChangeUsernameRequest {
  username: string;
}

export interface IChangeUsernameResponse {
  data: {
    data: {
      id: string;
      username: string;
      name: string;
      profileImageUrl: string;
      countryId: string;
      countryName: string;
    };
    message: string;
    responseCode: string;
  };
}

export interface ICreateCollectionRequest {
  name: string;
  description: string;
}

export interface ICreateCollectionResponse {
  data: {
    id: string;
    title: string;
    description: string;
    createdOn: string;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IAddOutfitsToCollectionRequest {
  outfitIds: string[];
  collectionId: string;
}

export interface IAddOutfitsToCollectionResponse {
  data: {
    collectionId: string;
    addedOutfitIds: string[];
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
}

export interface IGetCollectionsResponse {
  data: {
    dataset: {
      id: string;
      name: string; // API returns "name", not "title"
      description: string;
      createdOn: string;
      recentOutfits: {
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        status: string; // "Public" or "Private"
        createdOn: string;
      }[];
    }[];
    pageSize: number;
    pageItemCount: number;
    pageToken: string | null;
    hasNextPage: boolean;
    custom: any;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IGetCollectionOutfitsResponse {
  data: {
    dataset: {
      id: string;
      title: string;
      imageUrl: string;
      description: string;
      status: string; // "Public" or "Private"
      createdOn: string;
    }[];
    pageSize: number;
    pageItemCount: number;
    pageToken: string | null;
    hasNextPage: boolean;
    custom: any;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IUpdateCollectionRequest {
  name: string;
  description: string;
}

export interface IUpdateCollectionResponse {
  data: {
    id: string;
    title: string;
    description: string;
    updatedOn: string;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IDeleteCollectionResponse {
  data: {
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IRemoveOutfitFromCollectionResponse {
  data: {
    succeeded: boolean;
  };
  message: string;
  responseCode: string;
  status: number;
}
