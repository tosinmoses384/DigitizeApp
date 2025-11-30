/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ITemporaryAdditemToOutfitSlice {
  temporaryAddItemToOutfitSlice: [];
  refNumber: string;
  wardrobeType: string;
  outfitType: string;
  selectedDatePlan: string;
  refetchPlans: boolean;
  outfitCanvasPosition: any;
}

const initialState: ITemporaryAdditemToOutfitSlice = {
  temporaryAddItemToOutfitSlice: [],
  refNumber: "",
  wardrobeType: "first",
  outfitType: "",
  selectedDatePlan: "",
  refetchPlans: false,
  outfitCanvasPosition: [],
};

export const temporaryAddItemToOutfitSlice = createSlice({
  name: "temporaryAddItemToOutfit",
  initialState,
  reducers: {
    setTemporaryAddItemToOutfit: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.temporaryAddItemToOutfitSlice = payload;
    },
    setRefNumber: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.refNumber = payload;
    },
    setWardrobeType: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.wardrobeType = payload;
    },
    setOutfitType: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.outfitType = payload;
    },
    setSelectedDatePlan: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.selectedDatePlan = payload;
    },
    setRefetchPlans: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refetchPlans = payload;
    },
    setOutfitCanvasPosition: (
      state: ITemporaryAdditemToOutfitSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.outfitCanvasPosition = payload;
    },
  },
});

export const {
  setTemporaryAddItemToOutfit,
  setRefNumber,
  setWardrobeType,
  setOutfitType,
  setSelectedDatePlan,
  setRefetchPlans,
  setOutfitCanvasPosition,
} = temporaryAddItemToOutfitSlice.actions;
export default temporaryAddItemToOutfitSlice.reducer;
