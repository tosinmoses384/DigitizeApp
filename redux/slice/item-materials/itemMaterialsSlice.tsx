/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IItemMaterialsResponse } from "../../../services/features/configuration-service/models";

interface IitemMaterialsSlice {
  itemMaterials: IItemMaterialsResponse;
}

const initialState: IitemMaterialsSlice = {
  itemMaterials: null,
};

export const itemMaterialsSlice = createSlice({
  name: "itemMaterials",
  initialState,
  reducers: {
    setItemMaterials: (
      state: IitemMaterialsSlice,
      action: PayloadAction<IItemMaterialsResponse>
    ) => {
      const { payload } = action;
      state.itemMaterials = payload;
    },
  },
});

export const { setItemMaterials } = itemMaterialsSlice.actions;
export default itemMaterialsSlice.reducer;
