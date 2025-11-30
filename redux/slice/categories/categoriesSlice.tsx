/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IItemCategoriesResponse } from "../../../services/features/configuration-service/models";

interface IcategoriesSlice {
  categories: IItemCategoriesResponse;
}

const initialState: IcategoriesSlice = {
  categories: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (
      state: IcategoriesSlice,
      action: PayloadAction<IItemCategoriesResponse>
    ) => {
      const { payload } = action;
      state.categories = payload;
    },
  },
});

export const { setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
