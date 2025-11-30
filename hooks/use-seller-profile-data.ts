import { useCallback } from "react";
import { usePagination, UsePaginationReturn } from "./use-pagination";
import { useAppSelector } from "@redux/store";
import marketPlaceServices from '@services/features/marketplace/marketplaceServices';
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { PaginationRequest, PaginationResponse } from "@constants/PaginationConfig";
import {
  IListItemsRequest,
  IReviewsRequest,
} from "@services/features/wardrobe-service/models";

// Types for different data types in SellerProfile
export interface SellerItem {
  id: string;
  brand: string;
  size: string;
  amount: string;
  image: string;
  price: string;
  brandName: string;
  defaultImageUrl: string;
  isUserFavorite: boolean;
  favouriteCount: number;
  currencySymbol: string;
}

export interface SellerReview {
  id: string;
  createdBy: string;
  trifterImageUrl: string;
  review: string;
  ratings: number;
}

export interface SellerPost {
  id: string;
  userId: string;
  username: string;
  userRatings: number;
  userImageUrl: string;
  caption: string;
  defaultImageUrl: string;
  type: string;
  hasTag: boolean;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  isEditable: boolean;
  isFollowing: boolean;
  createdOn: string;
  title?: string;
  sellerUsername?: string;
  posterUsername?: string;
  sellerId?: string;
}

export interface UseSellerProfileDataConfig {
  sellerId: string;
  token: string;
  countryId: string;
  profileCountryId?: string;
}

export interface UseSellerProfileDataReturn {
  // Items pagination (tab 2)
  items: UsePaginationReturn<SellerItem>;
  
  // Reviews pagination (tab 3) 
  reviews: UsePaginationReturn<SellerReview>;
  
  // Posts are handled by StoryLine component internally
}

/**
 * Specialized hook for SellerProfile data management
 * Handles all three tabs with consistent pagination
 */
export function useSellerProfileData(
  config: UseSellerProfileDataConfig
): UseSellerProfileDataReturn {
  const { sellerId, token, countryId, profileCountryId } = config;

  // Items API call and response mapper
  const itemsApiCall = useCallback(async (params: PaginationRequest) => {
    const data: IListItemsRequest = {
      token: token || "",
      pageQuery: "",
      pageSize: params.pageSize.toString(),
      pageToken: params.pageToken || "",
    };

    return marketPlaceServices.userlistItemsQuery(
      countryId || profileCountryId || "",
      sellerId,
      data
    );
  }, [token, countryId, profileCountryId, sellerId]);

  const itemsResponseMapper = useCallback((response: any): PaginationResponse<SellerItem> => {
    const dataset = response?.data?.dataset || [];
    const mappedData = dataset.map((item: any) => ({
      id: item?.id,
      brand: `${item?.brandName}`,
      size: item?.size,
      amount: item?.price,
      image: item?.defaultImageUrl,
      price: item?.price,
      brandName: item?.brandName,
      defaultImageUrl: item?.defaultImageUrl,
      isUserFavorite: item?.isUserFavorite,
      favouriteCount: item?.favouriteCount,
      currencySymbol: item?.currencySymbol,
      ...item,
    }));

    return {
      data: mappedData,
      hasNextPage: !!response?.data?.pageToken,
      pageToken: response?.data?.pageToken,
      totalCount: response?.data?.pageItemCount,
    };
  }, []);

  // Reviews API call and response mapper
  const reviewsApiCall = useCallback(async (params: PaginationRequest) => {
    const data: IReviewsRequest = {
      token: token || "",
      trifterId: sellerId,
      pageSize: params.pageSize.toString(),
      pageToken: params.pageToken || "",
    };

    return marketPlaceServices.userReviewsQuery(
      countryId || profileCountryId || "",
      data
    );
  }, [token, sellerId, countryId, profileCountryId]);

  const reviewsResponseMapper = useCallback((response: any): PaginationResponse<SellerReview> => {
    const dataset = response?.data?.dataset || [];
    
    return {
      data: dataset,
      hasNextPage: !!response?.data?.pageToken,
      pageToken: response?.data?.pageToken,
      totalCount: dataset.length,
    };
  }, []);

  // Posts are handled by StoryLine component internally - removed from here

  // Error mapper for authentication handling
  const errorMapper = useCallback((error: any): string => {
    if (error?.responseCode === "401" || error?.responseCode === 401) {
      // Handle auth error - could dispatch navigation to login
      return "Authentication required. Please log in again.";
    }
    if (error?.responseCode === "400" || error?.responseCode === 400) {
      return "Invalid request. Please try again.";
    }
    return error?.message || error?.detail || "An unexpected error occurred";
  }, []);

  // Initialize pagination hooks
  const items = usePagination<SellerItem>({
    contentType: "MARKETPLACE_ITEMS",
    apiCall: itemsApiCall,
    responseMapper: itemsResponseMapper,
    errorMapper,
    enableCache: true,
    autoLoad: false, // Manual control
    dependencies: [sellerId, token, countryId],
  });

  const reviews = usePagination<SellerReview>({
    contentType: "USER_REVIEWS", 
    apiCall: reviewsApiCall,
    responseMapper: reviewsResponseMapper,
    errorMapper,
    enableCache: true,
    autoLoad: false, // Manual control
    dependencies: [sellerId, token, countryId],
  });

  // Posts pagination removed - handled by StoryLine component

  return {
    items,
    reviews,
  };
}
