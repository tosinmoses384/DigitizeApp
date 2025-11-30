/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ICountryResponse } from "@services/features/configuration-service/models";

interface IcountrySlice {
  countries: any;
  isCountryLoading: boolean;
}

const initialState: IcountrySlice = {
  countries: null,
  isCountryLoading: false,
};

export const countriesSlice = createSlice({
  name: "countires",
  initialState,
  reducers: {
    setCountires: (
      state: IcountrySlice,
      action: PayloadAction<ICountryResponse>
    ) => {
      const { payload } = action;
      state.countries = payload;
    },
    setIsCountryLoading: (
      state: IcountrySlice,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.isCountryLoading = payload;
    },
  },
});

export const { setCountires, setIsCountryLoading } = countriesSlice.actions;
export default countriesSlice.reducer;
