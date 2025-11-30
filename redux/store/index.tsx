import { configureStore } from '@reduxjs/toolkit';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';

import profileReducer from '../slice/profile/profileSlice';
import temporaryRouteReducer from '../slice/temporary-route/temporaryRouteSlice';
import categoriesReducer from '../slice/categories/categoriesSlice';
import brandsReducer from '../slice/brands/itemBrandsSlice';
import itemSizeReducer from '../slice/item-size/itemSizeSlice';
import itemConditionsReducer from '../slice/item-conditions/itemConditionsSlice';
import itemMaterialsReducer from '../slice/item-materials/itemMaterialsSlice';
import colorReducer from '../slice/colors/colorSlice';
import temporaryAddItemToOutfitReducer from '../slice/temporary-add-item-to-outfit/temporaryAddItemtoOutfitSlice';
import outfitEditDetailsReducer from '../slice/outfit-edit-details/outfitEditDetailsSlice';
import countriesReducer from '../slice/countries/countriesSlice';
import userCountryIdReducer from '../slice/user-country-id/userCountryIdSlice';
import filterReducer from '@redux/slice/filters/filterSlice';
import languagesReducer from '../slice/languages/languageSlice';
import helpCenteCategoryReducer from '../slice/help-center/helpCenterCategorySlice';
import parcelSizeSliceReducer from '@redux/slice/parcel/parcelSlice';
import countrySeasonSliceReducer from '@redux/slice/countrySeason/countrySeasonSlice';
import featuresReducer from '@redux/slice/features/featuresSlice';

export const store = configureStore({
  reducer: {
    userProfileSlice: profileReducer,
    temporaryRouteSlice: temporaryRouteReducer,
    categoriesSlice: categoriesReducer,
    brandsSlice: brandsReducer,
    itemSizeSlice: itemSizeReducer,
    itemConditionsSlice: itemConditionsReducer,
    itemMaterialsSlice: itemMaterialsReducer,
    colorSlice: colorReducer,
    temporaryAddItemToOutfitSlice: temporaryAddItemToOutfitReducer,
    outfitEditDetailsSlice: outfitEditDetailsReducer,
    countriesSlice: countriesReducer,
    userCountryId: userCountryIdReducer,
    productFilter: filterReducer,
    languagesSlice: languagesReducer,
    helpCenteCategorySlice: helpCenteCategoryReducer,
    parcelSizeSlice: parcelSizeSliceReducer,
    countrySeasonSlice: countrySeasonSliceReducer,
    featuresSlice: featuresReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        warnAfter: 100, // Increase warning threshold from 32ms to 100ms
      },
      serializableCheck: false, // Optional: You can disable serializable checks for better performance
    }),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>; // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch; // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
