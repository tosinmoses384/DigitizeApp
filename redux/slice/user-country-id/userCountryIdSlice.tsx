/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface IuserCountryIdSlice {
  countryId: string;
}

const initialState: IuserCountryIdSlice = {
  countryId: "",
};

export const userCountryIdSlice = createSlice({
  name: "userCountryId",
  initialState,
  reducers: {
    setUserCountryId: (
      state: IuserCountryIdSlice,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.countryId = payload;
    },
  },
});

export const { setUserCountryId } = userCountryIdSlice.actions;
export default userCountryIdSlice.reducer;
