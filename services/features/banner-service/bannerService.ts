import ApiResponsePayload from '../../http-client/abstractions/models/ApiResponsePayload';
import endpointService from '../../http-client/endpoints/public/endpointClientService';
import {IBannerResponse} from './models';

const bannerServices = {
  /**
   * Fetch banners for a specific country and platform
   * @param token - Authentication token
   * @param countryId - Country ID (e.g., "Nigeria")
   * @param devicePlatform - Platform type ("Mobile" or "Web")
   */
  getBanners: (
    token: string,
    countryId: string,
    devicePlatform: 'Mobile' | 'Web' = 'Mobile',
  ): Promise<ApiResponsePayload<IBannerResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/marketplace/v1/${countryId}/features`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-device-platform': devicePlatform,
        },
      },
    );
  },
};

export default bannerServices;
