import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@redux/store';
import configurationServices from '@services/features/configuration-service/configurationService';
import helpCenterServices from '@services/features/help-center-service/helpCenterService';
import { capitalizeFirstLetter } from '@helper/capiterlize-first-letter';

const CONFIGURATION_GC_TIME = 1000 * 60 * 60; // 60 minutes
const CONFIGURATION_STALE_TIME = 1000 * 60 * 30; // 30 minutes

/**
 * Centralized Configuration Data Hook
 * Uses React Query's useQueries for optimal parallelization
 * Prevents duplicate API calls and provides automatic cache invalidation
 * 
 * OPTIMIZATION: Migrated to useQueries() for explicit parallel execution
 * and better error handling per query
 */
export const useConfigurationData = () => {
  const queryClient = useQueryClient();
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);

  // Use useQueries for optimal parallelization and individual query control
  const configQueries = useQueries({
    queries: [
      // Critical configuration data (high priority - needed for core app functionality)
      {
        queryKey: ['configuration', 'categories'],
        queryFn: async () => {
          const res = await configurationServices.itemCategories(token);
          return res?.data;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'countries'],
        queryFn: async () => {
          const res = await configurationServices.countries(token);
          const data: unknown = res?.data;
          const countries = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return countries;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      // Standard configuration data
      {
        queryKey: ['configuration', 'brands'],
        queryFn: async () => {
          const res = await configurationServices.brands(token);
          const data: unknown = res?.data;
          const brands = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return brands;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'itemSizes'],
        queryFn: async () => {
          const res = await configurationServices.itemSize(token);
          const data: unknown = res?.data;
          const sizes = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: `${capitalizeFirstLetter(list?.size)} - ${capitalizeFirstLetter(list?.categoryName)}`,
            ...list,
          })) : [];
          return sizes;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'itemConditions'],
        queryFn: async () => {
          const res = await configurationServices.itemConditions(token);
          const data: unknown = res?.data;
          const conditions = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return conditions;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'materials'],
        queryFn: async () => {
          const res = await configurationServices.itemMaterials(token);
          const data: unknown = res?.data;
          const materials = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return materials;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'colors'],
        queryFn: async () => {
          const res = await configurationServices.itemColor(token);
          const data: unknown = res?.data;
          const colors = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.colour),
            ...list,
          })) : [];
          return colors;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'languages'],
        queryFn: async () => {
          const res = await configurationServices.languages(token);
          const data: unknown = res?.data;
          const languages = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return languages;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'helpCenterCategories'],
        queryFn: async () => {
          const languageCode = '';
          const res = await helpCenterServices.helpCenterCategories?.(languageCode);
          return res?.data || [];
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'parcelSizes'],
        queryFn: async () => {
          const res = await configurationServices.percelSize(token);
          const data: unknown = res?.data;
          const sizes = Array.isArray(data) ? data.map((list: any) => ({
            value: list?.id,
            label: capitalizeFirstLetter(list?.name),
            ...list,
          })) : [];
          return sizes;
        },
        enabled: !!token,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'countrySeasons', profile?.countryId],
        queryFn: async () => {
          const res = await configurationServices.countrySeasons(profile?.countryId, token);
          const data: unknown = res?.data;
          const seasons = (data as any)?.seasons || [];
          return seasons;
        },
        enabled: !!token && !!profile?.countryId,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
      {
        queryKey: ['configuration', 'countrySeasonsActive', profile?.countryId],
        queryFn: async () => {
          const res = await configurationServices.countrySeasonsActive(profile?.countryId, token);
          const data: unknown = res?.data;
          const seasons = (data as any)?.seasons || [];
          return seasons;
        },
        enabled: !!token && !!profile?.countryId,
        staleTime: CONFIGURATION_STALE_TIME,
        gcTime: CONFIGURATION_GC_TIME,
      },
    ],
  });

  // Destructure query results in order
  const [
    categoriesQuery,
    countriesQuery,
    brandsQuery,
    itemSizesQuery,
    itemConditionsQuery,
    materialsQuery,
    colorsQuery,
    languagesQuery,
    helpCenterCategoriesQuery,
    parcelSizesQuery,
    countrySeasonsQuery,
    countrySeasonsActiveQuery,
  ] = configQueries;

  // Clear all configuration cache (called on logout)
  const clearConfigurationCache = () => {
    queryClient.removeQueries({ queryKey: ['configuration'] });
  };

  // Aggregate loading and error states
  const isLoading = configQueries.some(q => q.isLoading);
  const hasError = configQueries.some(q => q.isError);
  const hasData = configQueries.some(q => q.data);

  return {
    // Loading states
    isLoading,
    hasError,
    hasData,

    // Individual query states (for granular control)
    queries: {
      categories: categoriesQuery,
      brands: brandsQuery,
      itemSizes: itemSizesQuery,
      itemConditions: itemConditionsQuery,
      materials: materialsQuery,
      colors: colorsQuery,
      countries: countriesQuery,
      languages: languagesQuery,
      helpCenterCategories: helpCenterCategoriesQuery,
      parcelSizes: parcelSizesQuery,
      countrySeasons: countrySeasonsQuery,
      countrySeasonsActive: countrySeasonsActiveQuery,
    },

    // Convenience data object for direct access
    data: {
      categories: categoriesQuery.data,
      brands: brandsQuery.data,
      itemSizes: itemSizesQuery.data,
      itemConditions: itemConditionsQuery.data,
      materials: materialsQuery.data,
      colors: colorsQuery.data,
      countries: countriesQuery.data,
      languages: languagesQuery.data,
      helpCenterCategories: helpCenterCategoriesQuery.data,
      parcelSizes: parcelSizesQuery.data,
      countrySeasons: countrySeasonsQuery.data,
      countrySeasonsActive: countrySeasonsActiveQuery.data,
    },

    // Cache management
    clearConfigurationCache,
  };
};

