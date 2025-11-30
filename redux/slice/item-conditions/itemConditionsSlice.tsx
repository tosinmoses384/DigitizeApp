/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IIitemConditionsResponse } from "../../../services/features/configuration-service/models";

interface IitemConditionsSlice {
  itemConditions: IIitemConditionsResponse;
}

const initialState: IitemConditionsSlice = {
  itemConditions: null,
};

export const itemConditionsSlice = createSlice({
  name: "itemConditions",
  initialState,
  reducers: {
    setItemConditions: (
      state: IitemConditionsSlice,
      action: PayloadAction<IIitemConditionsResponse>
    ) => {
      const { payload } = action;
      state.itemConditions = payload;
    },
  },
});

export const { setItemConditions } = itemConditionsSlice.actions;
export default itemConditionsSlice.reducer;
