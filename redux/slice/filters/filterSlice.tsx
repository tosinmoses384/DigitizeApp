/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface IfilterSlice {
  brandValue: any;
  pageTitle: string;
  categoryValue: any;
  sizeValue: any;
  conditionValue: any;
  colourValue: any;
  materialValue: any;
  sellerId: string;
  itemDetailsId: any;
}

const initialState: IfilterSlice = {
  brandValue: null,
  pageTitle: "",
  categoryValue: null,
  sizeValue: null,
  conditionValue: null,
  colourValue: null,
  materialValue: null,
  sellerId: "",
  itemDetailsId: "",
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setBrandValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.brandValue = payload;
    },
    setPageTitle: (state: IfilterSlice, action: PayloadAction<string>) => {
      const { payload } = action;
      state.pageTitle = payload;
    },
    setCategoryValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.categoryValue = payload;
    },
    setSizeValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.sizeValue = payload;
    },
    setConditionValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.conditionValue = payload;
    },
    setColourValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.colourValue = payload;
    },
    setMaterialValue: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.materialValue = payload;
    },
    setSellerId: (state: IfilterSlice, action: PayloadAction<string>) => {
      const { payload } = action;
      state.sellerId = payload;
    },
    setItemDetails: (state: IfilterSlice, action: PayloadAction<any>) => {
      const { payload } = action;
      state.itemDetailsId = payload;
    },
  },
});

export const {
  setBrandValue,
  setPageTitle,
  setCategoryValue,
  setSizeValue,
  setConditionValue,
  setColourValue,
  setMaterialValue,
  setSellerId,
  setItemDetails,
} = filterSlice.actions;
export default filterSlice.reducer;
