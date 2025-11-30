/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface IHelpcenterIdSlice {
  helpCenterCategory: any;
}

const initialState: IHelpcenterIdSlice = {
  helpCenterCategory: [],
};

export const helpCenteCategorySlice = createSlice({
  name: "helpCenterCategory",
  initialState,
  reducers: {
    setHelpCenterCategory: (
      state: IHelpcenterIdSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.helpCenterCategory = payload;
    },
  },
});

export const { setHelpCenterCategory } = helpCenteCategorySlice.actions;
export default helpCenteCategorySlice.reducer;
