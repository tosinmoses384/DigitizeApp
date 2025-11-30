/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IItemColorResponse } from "../../../services/features/configuration-service/models";

interface IcolorsSlice {
  colors: IItemColorResponse;
}

const initialState: IcolorsSlice = {
  colors: null,
};

export const colorSlice = createSlice({
  name: "colors",
  initialState,
  reducers: {
    setColors: (
      state: IcolorsSlice,
      action: PayloadAction<IItemColorResponse>
    ) => {
      const { payload } = action;
      state.colors = payload;
    },
  },
});

export const { setColors } = colorSlice.actions;
export default colorSlice.reducer;
