export interface IBanner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  actionUrl?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
}

export interface IBannerResponse {
  data: IBanner[];
  hasNextPage: boolean;
  pageToken?: string;
}

export interface IBannerRequest {
  countryId: string;
  devicePlatform: 'Mobile' | 'Web';
}
