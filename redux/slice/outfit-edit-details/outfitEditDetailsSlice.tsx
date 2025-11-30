/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface TaggedItem {
  id: string;
  name: string;
  imageUrl: string;
  amount?: number;
  currencySymbol?: string;
  type: 'item' | 'outfit';
}

export interface OutfitEditDetails {
  id: string;
  requestId?: string;
  title: string;
  description: string;
  imageUrl: string;
  status?: string;
  items?: {
    id: string;
    name: string;
    imageUrl: string;
  }[];
  metadata?: Record<string, string>;
  createdOn?: string;
  planDate?: string;
}

interface IoutfitEditDetailsSlice {
  outfitEditDetails: OutfitEditDetails | null;
  isEdit: boolean;
  newPostDetails: any;
  tagedItemDetails: any;
  tagedItems: TaggedItem[];
  plansDetails: any;
  isEditPostDetails: boolean;
  editPostId: string;
  isActiveCollageEdit: boolean;
}

const initialState: IoutfitEditDetailsSlice = {
  outfitEditDetails: null,
  isEdit: false,
  newPostDetails: null,
  tagedItemDetails: null,
  tagedItems: [],
  plansDetails: null,
  isEditPostDetails: false,
  editPostId: "",
  isActiveCollageEdit: false,
};

export const outfitEditDetailsSlice = createSlice({
  name: "outfitEditDetails",
  initialState,
  reducers: {
    setOutfitEditDetails: (
      state: IoutfitEditDetailsSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.outfitEditDetails = payload;
    },
    setIsEdit: (
      state: IoutfitEditDetailsSlice,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.isEdit = payload;
    },
    setNewPostDetails: (
      state: IoutfitEditDetailsSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.newPostDetails = payload;
    },
    setTagedDetails: (
      state: IoutfitEditDetailsSlice,
      action: PayloadAction<any>
    ) => {
      const { payload } = action;
      state.tagedItemDetails = payload;
    },
    setPlanDetails: (state: any, action: PayloadAction<any>) => {
      const { payload } = action;
      state.plansDetails = payload;
    },
    setIsEditPostData: (state: any, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.isEditPostDetails = payload;
    },
    setEditPostId: (state: any, action: PayloadAction<string>) => {
      const { payload } = action;
      state.editPostId = payload;
    },
    // New actions for multiple tagged items
    addTagedItem: (state: IoutfitEditDetailsSlice, action: PayloadAction<TaggedItem>) => {
      const { payload } = action;
      // Check if item already exists to avoid duplicates
      const existingIndex = state.tagedItems.findIndex(item => item.id === payload.id);
      if (existingIndex === -1) {
        state.tagedItems.push(payload);
      }
    },
    removeTagedItem: (state: IoutfitEditDetailsSlice, action: PayloadAction<string>) => {
      const { payload } = action;
      state.tagedItems = state.tagedItems.filter(item => item.id !== payload);
    },
    setTagedItems: (state: IoutfitEditDetailsSlice, action: PayloadAction<TaggedItem[]>) => {
      const { payload } = action;
      state.tagedItems = payload;
    },
    clearTagedItems: (state: IoutfitEditDetailsSlice) => {
      state.tagedItems = [];
    },
    setIsActiveCollageEdit: (state: IoutfitEditDetailsSlice, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.isActiveCollageEdit = payload;
    },
  },
});

export const {
  setOutfitEditDetails,
  setIsEdit,
  setNewPostDetails,
  setTagedDetails,
  setPlanDetails,
  setIsEditPostData,
  setEditPostId,
  addTagedItem,
  removeTagedItem,
  setTagedItems,
  clearTagedItems,
  setIsActiveCollageEdit,
} = outfitEditDetailsSlice.actions;
export default outfitEditDetailsSlice.reducer;
