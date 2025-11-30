/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ILanguagesResponse } from "../../../src/services/features/configuration-service/models";

interface ILanguageSlice {
  languages: ILanguagesResponse;
}

const initialState: ILanguageSlice = {
  languages: null,
};

export const languagesSlice = createSlice({
  name: "languages",
  initialState,
  reducers: {
    setLanguages: (
      state: ILanguageSlice,
      action: PayloadAction<ILanguagesResponse>
    ) => {
      const { payload } = action;
      state.languages = payload;
    },
  },
});

export const { setLanguages } = languagesSlice.actions;
export default languagesSlice.reducer;
