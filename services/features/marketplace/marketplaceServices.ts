import { buildUrlWithParams } from "@helper/base-url-formater";
import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import {
  IMarketPlaceItemsResponse,
  IMarketPlaceItemsRequest,
  IAskSellerResponse,
  ITriftersResponse,
  IGetItemDetailsResponse,
  IBrandsResponse,
  ISellerProfileResponse,
  IUserItemsRequest,
  IUserItemsResponse,
  IReviewsRequest,
  IReviewsResponse,
  IMarketPlaceFavItemsRequest,
  ISellerSettingsResponse,
  IHolidayModeResponse,
  IHolidayModeRequest,
  IBundleDiscountRequest,
  IBuyerItemBundleRequest,
  IBuyerItemBundleResponse,
  IAskSellerItemBundleResponse,
  IMakeSellerItemBundleRequest,
  IMakeSellerItemBundleResponse,
  IItemOfferResponse,
  IItemOfferRequest,
  IAcceptOfferResponse,
  IBuyerAndSellerOfferRequest,
  ISellerReservationOfferRequest,
  IItemPurchaseResponse,
  ITransactionFeeResponse,
  IBundlePurchaseRequest,
  IItemPurchaseRequest,
} from "./models";

const marketplaceServiceBaseUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/marketplace`;

/**
 * Marketplace service containing methods for handling items, sellers, bundles,
 * offers, and other marketplace-related operations.
 */
const marketplaceServices = {
  /**
   * Retrieves marketplace items with advanced filtering and pagination support.
   * Allows searching and filtering items by multiple criteria including category,
   * size, color, condition, brand, material, and price range.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country for localized results
   * @param request - The request parameters containing filter and pagination details
   * @param request.PageQuery - General search query term
   * @param request.PageSize - Number of items to return per page
   * @param request.PageToken - Token for pagination to get specific page
   * @param request.Query - Specific query string for item search
   * @param request.CategoryId - Filter by specific category identifier
   * @param request.SizeIds - Array of size identifiers to filter by
   * @param request.ColourIds - Array of color identifiers to filter by
   * @param request.ConditionIds - Array of condition identifiers to filter by
   * @param request.BrandIds - Array of brand identifiers to filter by
   * @param request.MaterialIds - Array of material identifiers to filter by
   * @param request.price - Price range filter with Minimum and Maximum values
   * @param request.TrifterIds - Array of seller/trifter identifiers to filter by
   * 
   * @returns Promise resolving to paginated list of marketplace items with details
   * 
   * @example
   * ```typescript
   * const items = await marketplaceServices.marketPlaceItemsQuery(
   *   authToken,
   *   "country-123",
   *   {
   *     Query: "vintage dress",
   *     CategoryId: "cat-456",
   *     BrandIds: ["brand-1", "brand-2"],
   *     price: { Minimum: 10, Maximum: 100 },
   *     PageSize: 20,
   *     PageToken: "next_page"
   *   }
   * );
   * ```
   */
  marketPlaceItemsQuery: (
    token: string,
    countryId: string,
    {
      PageQuery,
      PageSize,
      PageToken,
      Query,
      CategoryId,
      SizeIds,
      ColourIds,
      ConditionIds,
      BrandIds,
      MaterialIds,
      price,
      TrifterIds,
    }: IMarketPlaceItemsRequest
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    let queries = {
      Query,
      ...(BrandIds?.length ? { BrandIds } : ""),
      ...(TrifterIds?.length ? { TrifterIds } : ""),
      CategoryId,
      ...(SizeIds?.length ? { SizeIds } : ""),
      ...(ColourIds?.length ? { ColourIds } : ""),
      ...(ConditionIds?.length ? { ConditionIds } : ""),
      ...(MaterialIds?.length ? { MaterialIds } : ""),
      price: {
        ...(price?.Minimum ? { Minimum: price?.Minimum } : ""),
        ...(price?.Maximum ? { Maximum: price?.Maximum } : ""),
      },

      PageQuery,
      PageSize,
      PageToken,
    };

    // Console log the full path plus params endpoint URL with all parameters
    const fullUrl = `${buildUrlWithParams(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items`,
      queries
    )}`;
    
    return endpointService.Get(
      fullUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  marketPlaceItemsQueryUpdated: (
    token: string,
    countryId: string,
    {
      PageQuery,
      PageSize,
      PageToken,
      Query,
      CategoryId,
      SizeIds,
      ColourIds,
      ConditionIds,
      BrandIds,
      MaterialIds,
      price,
      TrifterIds,
    }: IMarketPlaceItemsRequest
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    let queries = {
      Query,
      ...(BrandIds?.length ? { BrandIds } : ""),
      ...(TrifterIds?.length ? { TrifterIds } : ""),
      CategoryId,
      ...(SizeIds?.length ? { SizeIds } : ""),
      ...(ColourIds?.length ? { ColourIds } : ""),
      ...(ConditionIds?.length ? { ConditionIds } : ""),
      ...(MaterialIds?.length ? { MaterialIds } : ""),
      price: {
        ...(price?.Minimum ? { Minimum: price?.Minimum } : ""),
        ...(price?.Maximum ? { Maximum: price?.Maximum } : ""),
      },

      PageQuery,
      PageSize,
      PageToken,
    };

    // Console log the full path plus params endpoint URL with all parameters
    const fullUrl = `${buildUrlWithParams(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items`,
      queries
    )}`;
    
    return endpointService.Get(
      fullUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves the buyer's favorite/saved items with pagination support.
   * Returns a list of items that the authenticated buyer has marked as favorites.
   * 
   * @param token - Authentication bearer token
   * @param request - The request parameters containing pagination details
   * @param request.PageSize - Number of favorite items to return per page
   * @param request.PageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of favorite marketplace items
   * 
   * @example
   * ```typescript
   * const favorites = await marketplaceServices.marketPlaceFavItemsQuery(
   *   authToken,
   *   { PageSize: 10, PageToken: "next_page" }
   * );
   * ```
   */
  marketPlaceFavItemsQuery: (
    token: string,
    { PageSize, PageToken }: IMarketPlaceFavItemsRequest
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    return endpointService.GetWithParams(
      `${marketplaceServiceBaseUrl}/v1/buyer/favourite/items`,
      {
        PageSize,
        PageToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves information needed to initiate a conversation with the seller of a specific item.
   * This endpoint provides the necessary data to start a chat session with the item's seller.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the item
   * 
   * @returns Promise resolving to seller contact information and chat initialization data
   * 
   * @throws {Error} When the item is not found
   * @throws {Error} When the seller is unavailable
   * 
   * @example
   * ```typescript
   * const sellerInfo = await marketplaceServices.askSeller(
   *   authToken,
   *   "country-123",
   *   "item-456"
   * );
   * ```
   */
  askSeller: (
    token: string,
    countryId: string,
    itemId: string
  ): Promise<ApiResponsePayload<IAskSellerResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}/ask-seller`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Submits a price offer from a buyer to the seller for a specific item.
   * The buyer can propose an alternative price lower than the listed price.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the item to make an offer on
   * @param data - The offer request containing the proposed price
   * @param data.offerPrice - The price amount the buyer is offering
   * 
   * @returns Promise resolving to the created offer details including:
   *   - offerId: Unique identifier for the offer
   *   - offerPrice: The offered price
   *   - status: Current status of the offer
   *   - expiryDate: When the offer expires
   * 
   * @throws {Error} When the item is not available for offers
   * @throws {Error} When the offer price is invalid
   * 
   * @example
   * ```typescript
   * const offer = await marketplaceServices.makeSellerOffer(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   { offerPrice: 75.00 }
   * );
   * ```
   */
  makeSellerOffer: (
    token: string,
    countryId: string,
    itemId: string,
    data: IItemOfferRequest
  ): Promise<ApiResponsePayload<IItemOfferResponse>> => {
    return endpointService.Post<IItemOfferRequest, IItemOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}/make-offer`,
      {
        offerPrice: data?.offerPrice,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Creates an offer on behalf of both the buyer and seller.
   * This allows sellers to create offers for specific buyers, typically used
   * in scenarios where the seller wants to propose a deal to a particular buyer.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the item
   * @param data - The offer request containing price and buyer information
   * @param data.offerPrice - The price amount being offered
   * @param data.buyerId - The unique identifier of the buyer receiving the offer
   * 
   * @returns Promise resolving to the created offer details
   * 
   * @throws {Error} When the buyer or item is not found
   * @throws {Error} When the offer cannot be created
   * 
   * @example
   * ```typescript
   * const offer = await marketplaceServices.makeSellerAndBuyerOffer(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   { offerPrice: 80.00, buyerId: "buyer-789" }
   * );
   * ```
   */
  makeSellerAndBuyerOffer: (
    token: string,
    countryId: string,
    itemId: string,
    data: IBuyerAndSellerOfferRequest
  ): Promise<ApiResponsePayload<IItemOfferResponse>> => {
    return endpointService.Post<
      IBuyerAndSellerOfferRequest,
      IItemOfferResponse
    >(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}/offers`,
      {
        offerPrice: data?.offerPrice,
        buyerId: data?.buyerId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Creates a reservation offer for an item, temporarily holding it for a specific buyer.
   * This allows sellers to reserve items for particular buyers with an expiration date.
   * 
   * @param token - Authentication bearer token
   * @param data - The reservation request details
   * @param data.itemId - The unique identifier of the item to reserve
   * @param data.buyerId - The unique identifier of the buyer for whom to reserve
   * @param data.expiryDate - ISO date string indicating when the reservation expires
   * 
   * @returns Promise resolving to the reservation offer details including:
   *   - offerId: Unique identifier for the reservation offer
   *   - status: Current status of the reservation
   *   - expiryDate: When the reservation expires
   * 
   * @throws {Error} When the item is already reserved
   * @throws {Error} When the buyer or item is not found
   * 
   * @example
   * ```typescript
   * const reservation = await marketplaceServices.makeSellerReservationOffer(
   *   authToken,
   *   {
   *     itemId: "item-456",
   *     buyerId: "buyer-789",
   *     expiryDate: "2025-10-10T00:00:00Z"
   *   }
   * );
   * ```
   */
  makeSellerReservationOffer: (
    token: string,
    data: ISellerReservationOfferRequest
  ): Promise<ApiResponsePayload<IItemOfferResponse>> => {
    return endpointService.Post<
      ISellerReservationOfferRequest,
      IItemOfferResponse
    >(
      `${marketplaceServiceBaseUrl}/v1/seller/item-reservation`,
      {
        itemId: data?.itemId,
        buyerId: data?.buyerId,
        expiryDate: data?.expiryDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Creates a price offer for an item bundle from within a chat conversation.
   * Allows buyers to propose a price for a bundle of items during negotiations.
   * 
   * @param token - Authentication bearer token
   * @param bundleId - The unique identifier of the bundle to make an offer on
   * @param data - The offer request containing price and buyer information
   * @param data.offerPrice - The price amount being offered for the bundle
   * @param data.buyerId - The unique identifier of the buyer making the offer
   * 
   * @returns Promise resolving to the created bundle offer details
   * 
   * @throws {Error} When the bundle is not available
   * @throws {Error} When the offer price is invalid
   * 
   * @example
   * ```typescript
   * const bundleOffer = await marketplaceServices.makeChatBundleOffer(
   *   authToken,
   *   "bundle-123",
   *   { offerPrice: 150.00, buyerId: "buyer-456" }
   * );
   * ```
   */
  makeChatBundleOffer: (
    token: string,
    bundleId: string,
    data: IItemOfferRequest
  ): Promise<ApiResponsePayload<IItemOfferResponse>> => {
    return endpointService.Post<IItemOfferRequest, IItemOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/bundles/${bundleId}/offers`,
      {
        offerPrice: data?.offerPrice,
        buyerId: data?.buyerId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Searches for marketplace members (trifters/sellers) by query string with pagination.
   * Allows finding users who are selling items on the platform.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country to search within
   * @param Query - Search query string to find matching trifters
   * @param PageSize - Number of results to return per page
   * @param PageToken - Optional token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of trifters/sellers including:
   *   - userId: Unique identifier for the user
   *   - username: Display name of the trifter
   *   - profileImage: URL to profile picture
   *   - itemCount: Number of items listed by the trifter
   *   - rating: Average seller rating
   * 
   * @example
   * ```typescript
   * const trifters = await marketplaceServices.membersQuery(
   *   authToken,
   *   "country-123",
   *   "vintage seller",
   *   "20",
   *   "next_page"
   * );
   * ```
   */
  membersQuery: (
    token: string,
    countryId: string,
    Query: string,
    PageSize: string,
    PageToken?: string
  ): Promise<ApiResponsePayload<ITriftersResponse>> => {
    return endpointService.GetWithParams(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/trifters/search`,
      {
        ...(Query ? { Query } : ""),
        PageSize,
        PageToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Searches for brands in the marketplace with pagination support.
   * Allows users to find specific brands available on the platform.
   * 
   * @param token - Authentication bearer token
   * @param Query - Search query string to find matching brands
   * @param PageSize - Number of brand results to return per page
   * @param PageToken - Optional token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of brands including:
   *   - brandId: Unique identifier for the brand
   *   - name: Brand name
   *   - logo: URL to brand logo image
   *   - itemCount: Number of items listed under this brand
   * 
   * @example
   * ```typescript
   * const brands = await marketplaceServices.brandsSearch(
   *   authToken,
   *   "nike",
   *   "10",
   *   "next_page"
   * );
   * ```
   */
  brandsSearch: (
    token: string,
    Query: string,
    PageSize: string,
    PageToken?: string
  ): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.GetWithParams(
      `${marketplaceServiceBaseUrl}/v1/brands/search`,
      {
        ...(Query ? { Query } : ""),
        PageSize,
        PageToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves comprehensive details for a specific marketplace item.
   * Optionally includes offer-specific pricing and details when an offer ID is provided.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the item to retrieve
   * @param offer_id - Optional offer identifier to get offer-specific details
   * 
   * @returns Promise resolving to complete item details including:
   *   - itemId: Unique identifier
   *   - title: Item name/title
   *   - description: Detailed description
   *   - price: Listed price and currency
   *   - images: Array of item images
   *   - category: Category information
   *   - brand: Brand details
   *   - size: Size information
   *   - condition: Item condition
   *   - seller: Seller profile information
   *   - isLiked: Whether current user has favorited the item
   *   - offerDetails: Offer-specific information if offer_id provided
   * 
   * @throws {Error} When the item is not found
   * @throws {Error} When the offer is invalid
   * 
   * @example
   * ```typescript
   * const item = await marketplaceServices.getItemDetails(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "offer-789"
   * );
   * ```
   */
  getItemDetails: (
    token: string,
    countryId: string,
    itemId: string,
    offer_id?: string
  ): Promise<ApiResponsePayload<IGetItemDetailsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}?offerId=${offer_id || ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves transaction fee breakdown for an item purchase.
   * Provides detailed cost information including platform fees, taxes, and total amounts.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country for fee calculation
   * @param itemId - The unique identifier of the item
   * @param offerId - Optional offer identifier for offer-specific fee calculation
   * 
   * @returns Promise resolving to transaction fee details including:
   *   - itemPrice: Base price of the item
   *   - platformFee: Marketplace platform fee
   *   - processingFee: Payment processing fee
   *   - tax: Applicable taxes
   *   - totalAmount: Total payable amount
   *   - currency: Currency information
   * 
   * @throws {Error} When the item is not found
   * @throws {Error} When fees cannot be calculated
   * 
   * @example
   * ```typescript
   * const fees = await marketplaceServices.getItemTransactionFee(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "offer-789"
   * );
   * ```
   */
  getItemTransactionFee: (
    token: string,
    countryId: string,
    itemId: string,
    offerId?: string
  ): Promise<ApiResponsePayload<ITransactionFeeResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/checkout/items/${itemId}/transaction-fees?offerId=${
        offerId || ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves transaction fee breakdown for a bundle purchase.
   * Provides detailed cost information for purchasing multiple items as a bundle.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country for fee calculation
   * @param bundleId - The unique identifier of the bundle
   * @param offerId - Optional offer identifier for offer-specific fee calculation
   * 
   * @returns Promise resolving to bundle transaction fee details including:
   *   - bundlePrice: Combined price of all items in bundle
   *   - discount: Bundle discount amount if applicable
   *   - platformFee: Marketplace platform fee
   *   - processingFee: Payment processing fee
   *   - tax: Applicable taxes
   *   - totalAmount: Total payable amount
   *   - currency: Currency information
   * 
   * @throws {Error} When the bundle is not found
   * @throws {Error} When fees cannot be calculated
   * 
   * @example
   * ```typescript
   * const bundleFees = await marketplaceServices.getBundleTransactionFee(
   *   authToken,
   *   "country-123",
   *   "bundle-456",
   *   "offer-789"
   * );
   * ```
   */
  getBundleTransactionFee: (
    token: string,
    countryId: string,
    bundleId: string,
    offerId?: string
  ): Promise<ApiResponsePayload<ITransactionFeeResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/checkout/bundles/${bundleId}/transaction-fees?offerId=${
        offerId || ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves comprehensive details for a specific bundle.
   * Returns information about all items included in the bundle and bundle-specific pricing.
   * 
   * @param token - Authentication bearer token
   * @param itemId - The unique identifier of the bundle (bundle ID)
   * 
   * @returns Promise resolving to bundle details including:
   *   - bundleId: Unique identifier
   *   - items: Array of all items in the bundle
   *   - totalPrice: Combined price
   *   - discount: Bundle discount if applicable
   *   - seller: Seller information
   * 
   * @throws {Error} When the bundle is not found
   * 
   * @example
   * ```typescript
   * const bundle = await marketplaceServices.getBundleItemDetails(
   *   authToken,
   *   "bundle-123"
   * );
   * ```
   */
  getBundleItemDetails: (
    token: string,
    itemId: string
  ): Promise<ApiResponsePayload<IGetItemDetailsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/bundles/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves items related to a specific item based on similarity, category, or other criteria.
   * Useful for showing "You might also like" or "Similar items" sections.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the reference item
   * @param PageSize - Number of related items to return per page
   * @param PageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of related marketplace items
   * 
   * @example
   * ```typescript
   * const relatedItems = await marketplaceServices.getRelatedItems(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "10",
   *   "next_page"
   * );
   * ```
   */
  getRelatedItems: (
    token: string,
    countryId: string,
    itemId: string,
    PageSize: string,
    PageToken: string
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    return endpointService.GetWithParams(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}/related-items`,
      {
        PageSize,
        PageToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves comprehensive profile information for a specific seller/trifter.
   * Includes seller statistics, ratings, and profile details.
   * 
   * @param countryId - The unique identifier of the country
   * @param sellerId - The unique identifier of the seller
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to seller profile including:
   *   - userId: Unique identifier
   *   - username: Display name
   *   - bio: Profile biography
   *   - profileImage: Profile picture URL
   *   - rating: Average seller rating
   *   - reviewCount: Number of reviews
   *   - itemCount: Number of active listings
   *   - followers: Follower count
   *   - joinDate: When seller joined the platform
   * 
   * @throws {Error} When the seller is not found
   * 
   * @example
   * ```typescript
   * const profile = await marketplaceServices.sellerProfile(
   *   "country-123",
   *   "seller-456",
   *   authToken
   * );
   * ```
   */
  sellerProfile: (
    countryId: string,
    sellerId: string,
    token: string
  ): Promise<ApiResponsePayload<ISellerProfileResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/trifters/${sellerId}/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves all items listed by a specific trifter/seller with search and pagination.
   * Allows filtering the seller's listings with a search query.
   * 
   * @param countryId - The unique identifier of the country
   * @param trifterId - The unique identifier of the trifter/seller
   * @param request - The request parameters
   * @param request.token - Authentication bearer token
   * @param request.pageQuery - Search query to filter the seller's items
   * @param request.pageSize - Number of items to return per page
   * @param request.pageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of the user's listed items
   * 
   * @example
   * ```typescript
   * const listings = await marketplaceServices.userlistItemsQuery(
   *   "country-123",
   *   "trifter-456",
   *   {
   *     token: authToken,
   *     pageQuery: "dress",
   *     pageSize: "20",
   *     pageToken: "next_page"
   *   }
   * );
   * ```
   */
  userlistItemsQuery: (
    countryId: string,
    trifterId: string,
    { token, pageQuery, pageSize, pageToken }: IUserItemsRequest
  ): Promise<ApiResponsePayload<IUserItemsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/trifters/${trifterId}/listings?Query=${pageQuery}&PageSize=${pageSize}&PageToken=${pageToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves a curated list of featured brands for a specific country.
   * Returns popular or promoted brands to display on the homepage or brand discovery pages.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * 
   * @returns Promise resolving to list of featured brands including:
   *   - brandId: Unique identifier
   *   - name: Brand name
   *   - logo: Brand logo URL
   *   - itemCount: Number of items available
   * 
   * @example
   * ```typescript
   * const featuredBrands = await marketplaceServices.getFeaturedBrands(
   *   authToken,
   *   "country-123"
   * );
   * ```
   */
  getFeaturedBrands: (
    token: string,
    countryId: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/featured/brands?pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },












  /**
   * Retrieves reviews for a specific trifter/seller with pagination support.
   * Returns buyer feedback and ratings for the seller's transactions.
   * 
   * @param countryId - The unique identifier of the country
   * @param request - The request parameters
   * @param request.token - Authentication bearer token
   * @param request.trifterId - The unique identifier of the trifter/seller
   * @param request.pageSize - Number of reviews to return per page
   * @param request.pageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of reviews including:
   *   - reviewId: Unique identifier
   *   - rating: Star rating (1-5)
   *   - comment: Review text
   *   - reviewerName: Name of the reviewer
   *   - reviewDate: When the review was posted
   *   - itemDetails: Information about the reviewed item
   * 
   * @example
   * ```typescript
   * const reviews = await marketplaceServices.userReviewsQuery(
   *   "country-123",
   *   {
   *     token: authToken,
   *     trifterId: "seller-456",
   *     pageSize: "10",
   *     pageToken: "next_page"
   *   }
   * );
   * ```
   */
  userReviewsQuery: (
    countryId: string,
    { token, trifterId, pageSize, pageToken }: IReviewsRequest
  ): Promise<ApiResponsePayload<IReviewsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/trifters/${trifterId}/reviews?PageSize=${pageSize}&PageToken=${pageToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves personalized item recommendations for the authenticated buyer.
   * Uses buyer's browsing history, favorites, and purchase patterns to suggest relevant items.
   * 
   * @param token - Authentication bearer token
   * @param request - The request parameters containing pagination details
   * @param request.PageSize - Number of recommended items to return per page
   * @param request.PageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of recommended marketplace items
   * 
   * @example
   * ```typescript
   * const recommendations = await marketplaceServices.recommendationPlaceItemsQuery(
   *   authToken,
   *   { PageSize: "20", PageToken: "next_page" }
   * );
   * ```
   */
  recommendationPlaceItemsQuery: (
    token: string,
    { PageSize, PageToken }: IMarketPlaceItemsRequest
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    let queries = {
      PageSize,
      PageToken,
    };

    return endpointService.Get(
      `${buildUrlWithParams(
        `${marketplaceServiceBaseUrl}/v1/buyer/recommendations`,
        queries
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves curated outfit collections from the marketplace.
   * Returns styled outfit combinations featuring multiple items that work together.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param request - The request parameters containing pagination details
   * @param request.PageSize - Number of outfits to return per page
   * @param request.PageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of outfit collections
   * 
   * @example
   * ```typescript
   * const outfits = await marketplaceServices.outfitsMarketPlaceItemsQuery(
   *   authToken,
   *   "country-123",
   *   { PageSize: "10", PageToken: "next_page" }
   * );
   * ```
   */
  outfitsMarketPlaceItemsQuery: (
    token: string,
    countryId: string,
    { PageSize, PageToken }: IMarketPlaceItemsRequest
  ): Promise<ApiResponsePayload<IMarketPlaceItemsResponse>> => {
    let queries = {
      PageSize,
      PageToken,
    };

    return endpointService.Get(
      `${buildUrlWithParams(
        `${marketplaceServiceBaseUrl}/v1/${countryId}/outfits`,
        queries
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves the social profile for the currently authenticated trifter/user.
   * Returns the user's own profile information including social stats and settings.
   * 
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to the user's profile including:
   *   - userId: Unique identifier
   *   - username: Display name
   *   - bio: Profile biography
   *   - profileImage: Profile picture URL
   *   - followers: Follower count
   *   - following: Following count
   *   - itemCount: Number of listed items
   * 
   * @example
   * ```typescript
   * const myProfile = await marketplaceServices.userSocialProfile(authToken);
   * ```
   */
  userSocialProfile: (
    token: string
  ): Promise<ApiResponsePayload<ISellerProfileResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/trifter/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves the seller settings and preferences for the authenticated seller.
   * Returns configuration options including holiday mode, bundle discounts, and other seller-specific settings.
   * 
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to seller settings including:
   *   - holidayMode: Holiday mode status and configuration
   *   - bundleDiscount: Bundle discount settings
   *   - shippingPreferences: Shipping configuration
   *   - notificationPreferences: Notification settings
   * 
   * @example
   * ```typescript
   * const settings = await marketplaceServices.getSellerSettings(authToken);
   * ```
   */
  getSellerSettings: (
    token: string
  ): Promise<ApiResponsePayload<ISellerSettingsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/seller/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Toggles the seller's holiday mode status between active and inactive.
   * When holiday mode is enabled, the seller's items are temporarily hidden from marketplace.
   * 
   * @param model - The holiday mode request details
   * @param model.reason - Optional reason for enabling/disabling holiday mode
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to the updated holiday mode status including:
   *   - isActive: Whether holiday mode is now active
   *   - reason: The reason provided for the status
   *   - activatedDate: When holiday mode was activated (if active)
   * 
   * @throws {Error} When the seller settings cannot be updated
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.toggleHolidayMode(
   *   { reason: "On vacation until end of month" },
   *   authToken
   * );
   * ```
   */
  toggleHolidayMode: (
    model: IHolidayModeRequest,
    token: string
  ): Promise<ApiResponsePayload<IHolidayModeResponse>> => {
    return endpointService.Put<IHolidayModeRequest, IHolidayModeResponse>(
      `${marketplaceServiceBaseUrl}/v1/seller/settings/holiday-mode/toggle-status`,
      {
        reason: model?.reason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Updates the seller's bundle discount settings.
   * Configures automatic discounts when buyers purchase multiple items together.
   * 
   * @param model - The bundle discount configuration
   * @param model.isDiscountBundleEnabled - Whether bundle discounts are enabled
   * @param model.settings - Discount rules and percentages for different bundle sizes
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to the updated bundle discount settings
   * 
   * @throws {Error} When the settings are invalid
   * @throws {Error} When the update fails
   * 
   * @example
   * ```typescript
   * const settings = await marketplaceServices.bundleDiscount(
   *   {
   *     isDiscountBundleEnabled: true,
   *     settings: [
   *       { itemCount: 2, discountPercentage: 5 },
   *       { itemCount: 3, discountPercentage: 10 }
   *     ]
   *   },
   *   authToken
   * );
   * ```
   */
  bundleDiscount: (
    model: IBundleDiscountRequest,
    token: string
  ): Promise<ApiResponsePayload<IHolidayModeResponse>> => {
    return endpointService.Put<IBundleDiscountRequest, IHolidayModeResponse>(
      `${marketplaceServiceBaseUrl}/v1/seller/settings/bundle-discount`,
      {
        isDiscountBundleEnabled: model?.isDiscountBundleEnabled,
        settings: model?.settings,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves bundle-specific settings for a particular seller.
   * Returns the seller's bundle discount configuration and availability.
   * 
   * @param sellerId - The unique identifier of the seller
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to seller's bundle settings including:
   *   - isBundleEnabled: Whether the seller offers bundle discounts
   *   - discountRules: Array of discount rules by item count
   *   - minimumItems: Minimum items required for bundle discount
   * 
   * @throws {Error} When the seller is not found
   * 
   * @example
   * ```typescript
   * const bundleSettings = await marketplaceServices.sellerBundleSettings(
   *   "seller-123",
   *   authToken
   * );
   * ```
   */
  sellerBundleSettings: (
    sellerId: string,
    token: string
  ): Promise<ApiResponsePayload<ISellerSettingsResponse>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/bundles/sellers/${sellerId}/settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Initiates a bundle purchase request for multiple items from the same seller.
   * Creates a bundle offer that combines selected items with potential bundle discount.
   * 
   * @param model - The bundle purchase request details
   * @param model.sellerUserId - The unique identifier of the seller
   * @param model.itemIds - Array of item IDs to include in the bundle
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to bundle purchase details including:
   *   - bundleId: Unique identifier for the created bundle
   *   - totalPrice: Combined price with any applicable discounts
   *   - discount: Discount amount applied
   *   - items: Array of items in the bundle
   *   - expiryDate: When the bundle offer expires
   * 
   * @throws {Error} When items are from different sellers
   * @throws {Error} When items are not available
   * 
   * @example
   * ```typescript
   * const bundle = await marketplaceServices.buyItemBundle(
   *   {
   *     sellerUserId: "seller-123",
   *     itemIds: ["item-1", "item-2", "item-3"]
   *   },
   *   authToken
   * );
   * ```
   */
  buyItemBundle: (
    model: IBuyerItemBundleRequest,
    token: string
  ): Promise<ApiResponsePayload<IBuyerItemBundleResponse>> => {
    return endpointService.Post<
      IBuyerItemBundleRequest,
      IBuyerItemBundleResponse
    >(
      `${marketplaceServiceBaseUrl}/v1/bundles/buy`,
      {
        sellerUserId: model?.sellerUserId,
        itemIds: model?.itemIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Initiates a conversation with the seller about a potential bundle purchase.
   * Provides the necessary information to start a chat about bundling items together.
   * 
   * @param model - The bundle inquiry request details
   * @param model.sellerUserId - The unique identifier of the seller
   * @param model.itemIds - Array of item IDs to inquire about bundling
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to chat initialization data including:
   *   - chatId: Unique identifier for the conversation
   *   - sellerInfo: Seller contact information
   *   - bundlePreview: Preview of potential bundle with pricing
   * 
   * @throws {Error} When items are from different sellers
   * @throws {Error} When seller is unavailable
   * 
   * @example
   * ```typescript
   * const chatInfo = await marketplaceServices.askSellerItemBundle(
   *   {
   *     sellerUserId: "seller-123",
   *     itemIds: ["item-1", "item-2"]
   *   },
   *   authToken
   * );
   * ```
   */
  askSellerItemBundle: (
    model: IBuyerItemBundleRequest,
    token: string
  ): Promise<ApiResponsePayload<IAskSellerItemBundleResponse>> => {
    return endpointService.Post<
      IBuyerItemBundleRequest,
      IAskSellerItemBundleResponse
    >(
      `${marketplaceServiceBaseUrl}/v1/bundles/ask-seller`,
      {
        sellerUserId: model?.sellerUserId,
        itemIds: model?.itemIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Creates a price offer for a bundle of items.
   * Allows buyers to propose a lower price for multiple items purchased together.
   * 
   * @param model - The bundle offer request details
   * @param model.sellerUserId - The unique identifier of the seller
   * @param model.itemIds - Array of item IDs to include in the offer
   * @param model.offerPrice - The total price offered for all items in the bundle
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to the created bundle offer including:
   *   - offerId: Unique identifier for the offer
   *   - bundleId: Associated bundle identifier
   *   - offerPrice: The offered price
   *   - status: Current offer status
   *   - expiryDate: When the offer expires
   * 
   * @throws {Error} When the offer price is invalid
   * @throws {Error} When items are not available for bundling
   * 
   * @example
   * ```typescript
   * const offer = await marketplaceServices.makeSellerOfferItemBundle(
   *   {
   *     sellerUserId: "seller-123",
   *     itemIds: ["item-1", "item-2", "item-3"],
   *     offerPrice: 120.00
   *   },
   *   authToken
   * );
   * ```
   */
  makeSellerOfferItemBundle: (
    model: IMakeSellerItemBundleRequest,
    token: string
  ): Promise<ApiResponsePayload<IMakeSellerItemBundleResponse>> => {
    return endpointService.Post<
      IMakeSellerItemBundleRequest,
      IMakeSellerItemBundleResponse
    >(
      `${marketplaceServiceBaseUrl}/v1/bundles/make-offer`,
      {
        sellerUserId: model?.sellerUserId,
        itemIds: model?.itemIds,
        offerPrice: model?.offerPrice,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Toggles the bundle discount feature on or off for the seller.
   * Quickly enables or disables bundle discount offerings without changing settings.
   * 
   * @param token - Authentication bearer token
   * 
   * @returns Promise resolving to the updated bundle discount status including:
   *   - isEnabled: Whether bundle discounts are now enabled
   *   - settings: Current discount configuration (preserved)
   * 
   * @throws {Error} When the toggle operation fails
   * 
   * @example
   * ```typescript
   * const status = await marketplaceServices.toggleBundleDiscount(authToken);
   * console.log(status.data.isEnabled); // true or false
   * ```
   */
  toggleBundleDiscount: (
    token: string
  ): Promise<ApiResponsePayload<IHolidayModeResponse>> => {
    return endpointService.Put<null, IHolidayModeResponse>(
      `${marketplaceServiceBaseUrl}/v1/seller/settings/bundle-discount/toggle-status`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Accepts a buyer's offer on an item as the seller.
   * Confirms the sale at the offered price, making the item unavailable to other buyers.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param productId - The unique identifier of the item
   * @param offerId - The unique identifier of the offer to accept
   * 
   * @returns Promise resolving to the accepted offer details including:
   *   - offerId: The accepted offer identifier
   *   - status: Updated status (typically "Accepted")
   *   - purchaseId: Identifier for the resulting purchase/order
   *   - paymentDeadline: When the buyer must complete payment
   * 
   * @throws {Error} When the offer is no longer valid
   * @throws {Error} When the item is no longer available
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.acceptOffer(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "offer-789"
   * );
   * ```
   */
  acceptOffer: (
    token: string,
    countryId: string,
    productId: string,
    offerId: string
  ): Promise<ApiResponsePayload<IAcceptOfferResponse>> => {
    return endpointService.Put<null, IAcceptOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${productId}/offers/${offerId}/accept`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Accepts a buyer's offer on a bundle as the seller.
   * Confirms the bundle sale at the offered price.
   * 
   * @param token - Authentication bearer token
   * @param productId - The unique identifier of the bundle
   * @param offerId - The unique identifier of the offer to accept
   * 
   * @returns Promise resolving to the accepted bundle offer details
   * 
   * @throws {Error} When the offer is no longer valid
   * @throws {Error} When the bundle items are no longer available
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.acceptBundleOffer(
   *   authToken,
   *   "bundle-123",
   *   "offer-456"
   * );
   * ```
   */
  acceptBundleOffer: (
    token: string,
    productId: string,
    offerId: string
  ): Promise<ApiResponsePayload<IAcceptOfferResponse>> => {
    return endpointService.Put<null, IAcceptOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/bundles/${productId}/offers/${offerId}/accept`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Declines/rejects a buyer's offer on an item as the seller.
   * The offer is marked as rejected and the item remains available for other offers.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param productId - The unique identifier of the item
   * @param offerId - The unique identifier of the offer to decline
   * 
   * @returns Promise resolving to the rejected offer details including:
   *   - offerId: The rejected offer identifier
   *   - status: Updated status (typically "Rejected")
   * 
   * @throws {Error} When the offer is not found
   * @throws {Error} When the offer cannot be declined
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.declineOffer(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "offer-789"
   * );
   * ```
   */
  declineOffer: (
    token: string,
    countryId: string,
    productId: string,
    offerId: string
  ): Promise<ApiResponsePayload<IAcceptOfferResponse>> => {
    return endpointService.Put<null, IAcceptOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${productId}/offers/${offerId}/reject`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Declines/rejects a buyer's offer on a bundle as the seller.
   * The bundle offer is marked as rejected and the bundle remains available.
   * 
   * @param token - Authentication bearer token
   * @param productId - The unique identifier of the bundle
   * @param offerId - The unique identifier of the offer to decline
   * 
   * @returns Promise resolving to the rejected bundle offer details
   * 
   * @throws {Error} When the offer is not found
   * @throws {Error} When the offer cannot be declined
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.declineBundleOffer(
   *   authToken,
   *   "bundle-123",
   *   "offer-456"
   * );
   * ```
   */
  declineBundleOffer: (
    token: string,
    productId: string,
    offerId: string
  ): Promise<ApiResponsePayload<IAcceptOfferResponse>> => {
    return endpointService.Put<null, IAcceptOfferResponse>(
      `${marketplaceServiceBaseUrl}/v1/bundles/${productId}/offers/${offerId}/reject`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Initiates a purchase for a specific item with shipping and buyer details.
   * Creates an order and initiates the checkout process for the buyer with complete delivery information.
   * 
   * @param token - Authentication bearer token
   * @param countryId - The unique identifier of the country
   * @param itemId - The unique identifier of the item to purchase
   * @param offerId - The unique identifier of the offer (if purchasing based on an accepted offer)
   * @param data - The item purchase request details
   * @param data.shippingProviderId - The unique identifier of the shipping provider
   * @param data.shippingServiceTypeId - The shipping service type (e.g., "OfflineShipping")
   * @param data.buyerAddressId - The unique identifier of the buyer's delivery address
   * @param data.buyerContactNumber - The buyer's contact phone number
   * 
   * @returns Promise resolving to purchase details including:
   *   - purchaseId: Unique identifier for the purchase/order
   *   - orderId: Associated order identifier
   *   - totalAmount: Total amount to be paid
   *   - paymentUrl: URL to complete payment
   *   - expiryDate: When the purchase reservation expires
   *   - shippingDetails: Shipping and delivery information
   * 
   * @throws {Error} When the item is no longer available
   * @throws {Error} When the offer is invalid or expired
   * @throws {Error} When shipping or address information is invalid
   * @throws {Error} When the purchase cannot be initiated
   * 
   * @example
   * ```typescript
   * const purchase = await marketplaceServices.makeItemPurchase(
   *   authToken,
   *   "country-123",
   *   "item-456",
   *   "offer-789",
   *   {
   *     shippingProviderId: "provider-123",
   *     shippingServiceTypeId: "OfflineShipping",
   *     buyerAddressId: "address-456",
   *     buyerContactNumber: "+1234567890"
   *   }
   * );
   * // Redirect user to purchase.data.paymentUrl
   * ```
   */
  makeItemPurchase: (
    token: string,
    countryId: string,
    itemId: string,
    offerId: string,
    data: IItemPurchaseRequest
  ): Promise<ApiResponsePayload<IItemPurchaseResponse>> => {
    return endpointService.Post<IItemPurchaseRequest, IItemPurchaseResponse>(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/items/${itemId}/buy`,
      {
        shippingProviderId: data.shippingProviderId,
        shippingServiceTypeId: data.shippingServiceTypeId,
        buyerAddressId: data.buyerAddressId,
        buyerContactNumber: data.buyerContactNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          offerId,
        },
      }
    );
  },

  /**
   * Initiates a purchase for an entire item bundle with shipping and buyer details.
   * Creates an order for all items in the bundle and initiates checkout with complete delivery information.
   * 
   * @param token - Authentication bearer token
   * @param bundleId - The unique identifier of the bundle to purchase
   * @param data - The bundle purchase request details
   * @param data.sellerUserId - The unique identifier of the seller
   * @param data.itemIds - Array of item IDs included in the bundle
   * @param data.shippingProviderId - The unique identifier of the shipping provider
   * @param data.shippingServiceTypeId - The shipping service type (e.g., "OfflineShipping")
   * @param data.buyerAddressId - The unique identifier of the buyer's delivery address
   * @param data.buyerContactNumber - The buyer's contact phone number
   * 
   * @returns Promise resolving to bundle purchase details including:
   *   - purchaseId: Unique identifier for the purchase
   *   - orderId: Associated order identifier
   *   - totalAmount: Total amount including any bundle discounts
   *   - paymentUrl: URL to complete payment
   *   - items: Array of items included in the purchase
   *   - shippingDetails: Shipping and delivery information
   * 
   * @throws {Error} When the bundle is no longer available
   * @throws {Error} When one or more items in the bundle are unavailable
   * @throws {Error} When shipping or address information is invalid
   * @throws {Error} When the purchase cannot be initiated
   * 
   * @example
   * ```typescript
   * const bundlePurchase = await marketplaceServices.makeBundleItemPurchase(
   *   authToken,
   *   "bundle-123",
   *   {
   *     sellerUserId: "seller-456",
   *     itemIds: ["item-1", "item-2", "item-3"],
   *     shippingProviderId: "provider-789",
   *     shippingServiceTypeId: "OfflineShipping",
   *     buyerAddressId: "address-abc",
   *     buyerContactNumber: "+1234567890"
   *   }
   * );
   * // Redirect user to bundlePurchase.data.paymentUrl
   * ```
   */
  makeBundleItemPurchase: (
    token: string,
    bundleId: string,
    data: IBundlePurchaseRequest
  ): Promise<ApiResponsePayload<IItemPurchaseResponse>> => {
    return endpointService.Post<IBundlePurchaseRequest, IItemPurchaseResponse>(
      `${marketplaceServiceBaseUrl}/v1/bundles/${bundleId}/buy`,
      {
        sellerUserId: data.sellerUserId,
        itemIds: data.itemIds,
        shippingProviderId: data.shippingProviderId,
        shippingServiceTypeId: data.shippingServiceTypeId,
        buyerAddressId: data.buyerAddressId,
        buyerContactNumber: data.buyerContactNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Adds a new brand to the platform's brand database.
   * Allows users to request adding brands that are not currently in the system.
   * 
   * @param token - Authentication bearer token
   * @param brandName - The name of the brand to add
   * 
   * @returns Promise resolving to the brand creation result including:
   *   - brandId: Unique identifier for the newly added brand (if immediately approved)
   *   - name: The brand name
   *   - status: Status of the brand request (e.g., "Pending", "Approved")
   *   - requestId: Identifier for tracking the brand addition request
   * 
   * @throws {Error} When the brand name is invalid or already exists
   * @throws {Error} When the brand creation fails
   * 
   * @example
   * ```typescript
   * const result = await marketplaceServices.addBrands(
   *   authToken,
   *   "Vintage Collection Co."
   * );
   * console.log(result.data.status); // "Pending" or "Approved"
   * ```
   */
  addBrands: (
    token: string,
    brandName: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Post<{ name: string; requestId: any }, any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/brands/users`,
      {
        name: brandName,
        requestId: null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
      }
    );
  },






  /**
   * Fetches platform features and configuration settings.
   * Returns shipping settings, banners, brands, and categories configuration.
   * 
   * @param countryId - The unique identifier of the country for localized features
   * 
   * @returns Promise resolving to features configuration including:
   *   - shippingSettings: Shipping configuration with offline shipping support
   *   - banners: Banner configuration
   *   - brands: Available brands
   *   - categories: Item categories hierarchy
   * 
   * @example
   * ```typescript
   * const features = await marketplaceServices.features("country-123");
   * const isOfflineShipping = features.data.shippingSettings.supportsOfflineShipping;
   * ```
   */
  features: (
    countryId: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get(
      `${marketplaceServiceBaseUrl}/v1/${countryId}/features`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
  },

};
export default marketplaceServices;
