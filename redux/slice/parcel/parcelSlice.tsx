/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IPercelSizeResponse } from "@services/features/configuration-service/models";

interface IParcelSlice {
  parcelSize: any;
}

const initialState: IParcelSlice = {
  parcelSize: null,
};

export const parcelSizeSlice = createSlice({
  name: "languages",
  initialState,
  reducers: {
    setParcelSizeSlice: (state: IParcelSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.parcelSize = payload;
    },
  },
});

export const { setParcelSizeSlice } = parcelSizeSlice.actions;
export default parcelSizeSlice.reducer;
