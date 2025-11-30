export interface WardrobeItem {
  id: string;
  brandName: string;
  brand?: string;
  name?: string;
  itemDefaultImageUrl: string;
  itemDefaultTransparentImageUrl?: string;
  defaultImageUrl?: string;
  itemImageUrls?: string[];
  amount?: number;
  currencySymbol?: string;
  type?: 'item' | 'outfit';
  requestId?: string;
  categoryId?: string;
  sizeId?: string;
  colourIds?: string[];
  createdOn?: string;
  isForSale?: boolean;
  status?: string;
}

export interface OutfitItem {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  itemIds?: string[];
  isPrivate?: boolean;
  type?: 'item' | 'outfit';
}

export interface TagItemsParams {
  query: string;
  pageSize: number;
  pageToken?: string | null;
  filterByStatus?: string;
  trifterId?: string;
}

export interface TagItemsResponse {
  dataset: WardrobeItem[] | OutfitItem[];
  hasNextPage: boolean;
  pageToken: string | null;
  pageSize: number;
  totalCount?: number;
}

export interface ICreateCollectionResponse {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface TaggedItem {
  id: string;
  name: string;
  imageUrl: string;
  amount?: number;
  currencySymbol?: string;
  type: 'item' | 'outfit';
}
