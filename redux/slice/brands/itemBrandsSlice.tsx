/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IBrandsResponse } from "../../../services/features/configuration-service/models";

interface IBrandsSlice {
  brands: IBrandsResponse;
}

const initialState: IBrandsSlice = {
  brands: null,
};

export const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    setBrands: (
      state: IBrandsSlice,
      action: PayloadAction<IBrandsResponse>
    ) => {
      const { payload } = action;
      state.brands = payload;
    },
  },
});

export const { setBrands } = brandsSlice.actions;
export default brandsSlice.reducer;
