/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface IProfileState {
  temporaryRoute: string;
}

const initialState: IProfileState = {
  temporaryRoute: null,
};

export const temporaryRouteSlice = createSlice({
  name: "temporaryRoute",
  initialState,
  reducers: {
    setTemporaryRoute: (
      state: IProfileState,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.temporaryRoute = payload;
    },
  },
});

export const { setTemporaryRoute } = temporaryRouteSlice.actions;
export default temporaryRouteSlice.reducer;
