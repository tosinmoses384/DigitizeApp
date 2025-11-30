/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IitemSizeResponse } from "../../../services/features/configuration-service/models";

interface IitemSizeSlice {
  itemSize: IitemSizeResponse;
}

const initialState: IitemSizeSlice = {
  itemSize: null,
};

export const itemSizeSlice = createSlice({
  name: "itemSize",
  initialState,
  reducers: {
    setItemSize: (
      state: IitemSizeSlice,
      action: PayloadAction<IitemSizeResponse>
    ) => {
      const { payload } = action;
      state.itemSize = payload;
    },
  },
});

export const { setItemSize } = itemSizeSlice.actions;
export default itemSizeSlice.reducer;
