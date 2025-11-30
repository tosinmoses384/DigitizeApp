export interface IMarketPlaceItemsRequest {
  Query: string;
  PageQuery: string;
  PageSize: string;
  PageToken: string;
  CategoryId: string;
  TrifterIds: [];
  SizeIds: [];
  ConditionIds: [];
  BrandIds: [];
  ColourIds: [];
  MaterialIds: [];
  price: {
    Minimum: string;
    Maximum: string;
  };
}

export interface IMarketPlaceFavItemsRequest {
  PageSize: string;
  PageToken: string;
}

export interface IMarketPlaceItemsResponse {
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

export interface IAskSellerResponse {
  data: {
    conversationId: string;
    userId: string;
    sellerId: string;
    itemId: string;
    itemName: string;
    itemImageUrl: string;
  };
  message: string;
  responseCode: string;
}

export interface ITriftersResponse {
  data: [
    {
      id: string;
      name: string;
      imageUrl: string;
      location: string;
      ratings: number;
    }
  ];
  message: string;
  responseCode: string;
}

export interface IBrandsResponse {
  data: [
    {
      id: string;
      name: string;
      imageUrl: string;
    }
  ];
  message: string;
  responseCode: string;
}

export interface IGetItemDetailsResponse {
  itemId: string;
  itemName: string;
  itemDescription: string;
  itemDefaultImageUrl: string;
  itemImageUrls: string[];
  itemSize: string;
  itemPrice: number;
  itemOffer?: {
    offerId: string;
    offeredPrice: number;
    status: "Pending" | "Accepted" | "Rejected" | "Expired";
  };
  currencySymbol: string;
  currencyCode: string;
  itemSizeId: string;
  itemConditionId: string;
  itemCondition: string;
  itemCategory: string;
  itemCategoryId: string;
  itemBrand: string;
  itemBrandId: string;
  itemParcelSizeId: string;
  itemParcelBoxDescription: string;
  itemParcelBox: "None" | "Small" | "Medium" | "Large";
  isItemFavourited: boolean;
  isItemReserved: boolean;
  itemSellerId: string;
  sellerInfo: {
    id: string;
    name: string;
    countryId: string;
    location: string;
    profileImageUrl: string;
    isSeller: boolean;
    followersCount: number;
    followingBrandsCount: number;
    followingTriftersCount: number;
    itemsAvailableCount: number;
    itemsListingCount: number;
    itemsSoldCount: number;
    itemsUploadedCount: number;
    reviewsGivenCount: number;
    reviewsReceivedCount: number;
    ratings: number;
  };
  isSellerHolidayModeActivated: boolean;
  isSellerBundleDiscountAvailable: boolean;
  sellerBundleDiscountMessage: string;
  isFollowingSeller: boolean;
  buyerConversation: {
    id: string;
    sellerUserId: string;
    buyerUserId: string;
    metadata: Record<string, string>;
  };
  itemColours: Array<{
    itemColourId: string;
    itemColour: string;
  }>;
  status: "Available" | "Unavailable";
  relatedItems: {
    payload: Array<{
      id: string;
      title: string;
      description: string;
      sellerId: string;
      sellerName: string;
      sellerImageUrl: string;
      brandId: string;
      brandName: string;
      defaultImageUrl: string;
      categoryId: string;
      categoryName: string;
      isUserFavorite: boolean;
      favouriteCount: number;
      currencySymbol: string;
      price: number;
      sizeId: string;
      size: string;
    }>;
    metadata: {
      custom: Record<string, string>;
      hasNextPage: boolean;
      pageToken: string;
      pageSize: number;
      pageItemCount: number;
    };
  };
  userCheckoutSession?: {
    checkoutMetadata: Record<string, string>;
  };
}

export interface ISellerProfileResponse {
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

export interface ITransactionFeeResponse {
  data: {
    currency: {
      countryId: string;
      currencyId: string;
      currencySymbol: string;
      currencyName: string;
      currencyCode: string;
    };
    fees: [
      {
        description: string;
        fee: 0;
      }
    ];
  };
  message: string;
  responseCode: string;
  status: 0;
}

export interface IUserItemsRequest {
  token: string;
  pageQuery?: string;
  pageSize: string;
  pageToken: string;
}

export interface IUserItemsResponse {
  data: [
    {
      id: string;
      title: string;
      description: string;
      defaultImageUrl: string;
      imageUrls: [];
      price: number;
      categoryId: string;
      category: string;
      brandId: string;
      brand: string;
      sizeId: string;
      size: string;
    }
  ];
  message: string;
  responseCode: string;
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
    }
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

export interface ISellerSettingsResponse {
  data: {
    holidayModeReason: string;
    holidayModeStatus: string;
    isDiscountBundleEnabled: boolean;
    discountBundles: [
      {
        itemQuantity: number;
        discountPercentage: number;
      }
    ];
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IHolidayModeRequest {
  reason: string;
}

export interface IHolidayModeResponse {
  data: {
    reason: string;
    status: string;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IBundleDiscountRequest {
  isDiscountBundleEnabled: boolean;
  settings: any;
}

export interface IBuyerItemBundleRequest {
  sellerUserId: string;
  itemIds: [];
}

export interface IBundlePurchaseRequest {
  sellerUserId: string;
  itemIds: string[];
  shippingProviderId: string;
  shippingServiceTypeId: string;
  buyerAddressId: string;
  buyerContactNumber: string;
}

export interface IItemPurchaseRequest {
  shippingProviderId: string;
  shippingServiceTypeId: string;
  buyerAddressId: string;
  buyerContactNumber: string;
}

export interface IBuyerItemBundleResponse {
  data: {
    id: string;
    buyerUserId: string;
    sellerUserId: string;
    bundleAmount: number;
    bundleDiscount: number;
  };
  message: string;
  responseCode: string;
  status: number;
}
export interface IAskSellerItemBundleResponse {
  data: {
    id: string;
    buyerUserId: string;
    sellerUserId: string;
    conversationId: string;
    bundleAmount: number;
    bundleDiscount: number;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IMakeSellerItemBundleRequest {
  sellerUserId: string;
  itemIds: [];
  offerPrice: string;
}

export interface IMakeSellerItemBundleResponse {
  data: {
    id: string;
    buyerUserId: string;
    sellerUserId: string;
    conversationId: string;
    bundleAmount: number;
    bundleDiscount: number;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IItemOfferResponse {
  data: {
    conversationId: string;
    userId: string;
    sellerId: string;
    itemId: string;
    itemImageUrl: string;
    itemName: string;
    itemDescription: string;
    metadata: {
      additionalProp1: string;
      additionalProp2: string;
      additionalProp3: string;
    };
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IItemOfferRequest {
  offerPrice: number;
  buyerId?: string;
}
export interface IBuyerAndSellerOfferRequest {
  offerPrice: number;
  buyerId: string;
}

export interface ISellerReservationOfferRequest {
  itemId: string;
  buyerId: string;
  expiryDate: any;
}

export interface IAcceptOfferResponse {
  data: {
    bundleId: string;
    id: string;
    updatedBundleAmount: number;
    lastUpdatedOn: any;
  };
  message: string;
  responseCode: string;
  status: number;
}

export interface IItemPurchaseResponse {
  data: {
    conversationId: string;
    userId: string;
    sellerId: string;
    itemId: string;
    itemImageUrl: string;
    itemName: string;
    itemDescription: string;
    metadata: {
      additionalProp1: string;
      additionalProp2: string;
      additionalProp3: string;
    };
    checkoutProvider: string;
    checkoutMetadata: {
      additionalProp1: string;
      additionalProp2: string;
      additionalProp3: string;
    };
  };
  message: string;
  responseCode: string;
  status: number;
}
