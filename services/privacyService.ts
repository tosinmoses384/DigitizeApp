import ApiResponsePayload from "./http-client/abstractions/models/ApiResponsePayload";
import endpointService from "./http-client/endpoints/public/endpointClientService";

export interface IPrivacySettings {
  outfitsVisibility: boolean;
  itemsVisibility: boolean;
  allowDrobbersSeeWardRobeOutfits: boolean;
  allowDrobbersSeeWardRobeItems: boolean;
}

const privacyService = {
  getPrivacySettings: async (
    token: string
  ): Promise<ApiResponsePayload<IPrivacySettings>> => {
    const response = await endpointService.Get<IPrivacySettings>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/privacy-settings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      // Map the API response to our interface
      response.data = {
        ...response.data,
        outfitsVisibility: response.data.allowDrobbersSeeWardRobeOutfits,
        itemsVisibility: response.data.allowDrobbersSeeWardRobeItems
      };
    }

    return response;
  },

  toggleOutfitsVisibility: (
    token: string,
    isVisible: boolean = true
  ): Promise<ApiResponsePayload<IPrivacySettings>> => {
    return endpointService.Put<{ isVisible: boolean }, IPrivacySettings>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/privacy-settings/toggle-outfits-posts/`,
      { isVisible },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  toggleItemsVisibility: (
    token: string,
    isVisible: boolean = true
  ): Promise<ApiResponsePayload<IPrivacySettings>> => {
    return endpointService.Put<{ isVisible: boolean }, IPrivacySettings>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/identity/v1/account/privacy-settings/toggle-items-posts/`,
      { isVisible },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};

export default privacyService;
