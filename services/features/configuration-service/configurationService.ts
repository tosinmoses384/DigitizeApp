import ApiResponsePayload from '../../http-client/abstractions/models/ApiResponsePayload';
import endpointService from '../../http-client/endpoints/public/endpointClientService';
import {
  IBrandsResponse,
  ICountryLocationResponse,
  ICountryResponse,
  ICountrySeasonResponse,
  IGenderResponse,
  IIitemConditionsResponse,
  IItemCategoriesResponse,
  IItemCategorySizeByIdResponse,
  IItemColorResponse,
  IItemMaterialsResponse,
  IitemSizeResponse,
  ILanguagesResponse,
  IPercelSizeResponse,
  ISeasonsResponse,
} from './models';

const configurationServices = {
  itemCategories: (
    token: string,
  ): Promise<ApiResponsePayload<IItemCategoriesResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-categories/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  countryLocation: (
    token: string,
    countryId: string,
  ): Promise<ApiResponsePayload<ICountryLocationResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/countries/${countryId}/locations/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  itemColor: (
    token: string,
  ): Promise<ApiResponsePayload<IItemColorResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-colours/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  countrySeasons: (
    countryId: string,
    token: string,
  ): Promise<ApiResponsePayload<ICountrySeasonResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/countries/${countryId}/seasons`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  countrySeasonsActive: (
    countryId: string,
    token: string,
  ): Promise<ApiResponsePayload<ICountrySeasonResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/countries/${countryId}/season/active`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  itemMaterials: (
    token: string,
  ): Promise<ApiResponsePayload<IItemMaterialsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-materials/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  itemConditions: (
    token: string,
  ): Promise<ApiResponsePayload<IIitemConditionsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-conditions/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  itemSize: (token: string): Promise<ApiResponsePayload<IitemSizeResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-category-sizes/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  brands: (token: string): Promise<ApiResponsePayload<IBrandsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/brands/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
  languages: (
    token: string,
  ): Promise<ApiResponsePayload<ILanguagesResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/languages/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  percelSize: (
    token: string,
  ): Promise<ApiResponsePayload<IPercelSizeResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/parcel-sizes/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  gender: (token: string): Promise<ApiResponsePayload<IGenderResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/genders/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  itemCategoriesById: (
    token: string,
    id: string,
  ): Promise<ApiResponsePayload<IItemCategoriesResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-categories/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  itemCategoriesSizeById: (
    token: string,
    id: string,
    query: string,
    pageSize: string,
    pageToken: string,
    categoryId: string,
  ): Promise<ApiResponsePayload<IItemCategorySizeByIdResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-category-sizes/${id}/sizes?Query=${query}&PageSize=${pageSize}&PageToken=${pageToken}&CategoryId=${categoryId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getSizesByCategory: (
    token: string,
    categoryId: string,
    query?: string,
  ): Promise<ApiResponsePayload<IItemCategorySizeByIdResponse>> => {
    const queryParam = query ? `?query=${encodeURIComponent(query)}&categoryId=${categoryId}` : `?categoryId=${categoryId}`;
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-category-sizes${queryParam}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  countries: (token: string): Promise<ApiResponsePayload<ICountryResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/countries/lov`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  addBrand: (
    token: string,
    brandName: string,
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Post<{name: string}, any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/brands/users'`,
      {
        name: brandName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getCategories: (
    token: string,
  ): Promise<ApiResponsePayload<IItemCategoriesResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/item-categories`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  getBrands: (token: string): Promise<ApiResponsePayload<IGenderResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/brands`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },

  seasons: (
    token: string,
    countryId: string,
  ): Promise<ApiResponsePayload<ISeasonsResponse>> => {
    return endpointService.Get(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/configuration/v1/countries/${countryId}/season/active`,

      {
        headers: {
          Authorization: `Bearer ${token}`, //Change value
        },
      },
    );
  },
};
export default configurationServices;
