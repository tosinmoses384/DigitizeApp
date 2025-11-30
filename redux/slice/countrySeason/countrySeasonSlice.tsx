/* eslint-disable no-param-reassign */
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import {
  CountrySeasonItemDataType,
  CountrySeasonStoreStateType,
} from '@redux/slice/countrySeason/types';

const initialState: CountrySeasonStoreStateType = {
  seasons: null,
  activeSeasons: null,
};

export const countrySeasonSlice = createSlice({
  name: 'countrySeason',
  initialState,
  reducers: {
    setCountrySeasons: (
      state,
      action: PayloadAction<Array<CountrySeasonItemDataType>>,
    ) => {
      const { payload } = action;
      state.seasons = payload;
    },
    setCountrySeasonsActive: (
      state,
      action: PayloadAction<Array<CountrySeasonItemDataType>>,
    ) => {
      const { payload } = action;
      state.activeSeasons = payload;
    },
  },
});

export const { setCountrySeasons, setCountrySeasonsActive } =
  countrySeasonSlice.actions;
export default countrySeasonSlice.reducer;
