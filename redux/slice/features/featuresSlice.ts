import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ShippingSettings {
  supportsOfflineShipping: boolean;
}

interface FeaturesData {
  shippingSettings: ShippingSettings;
  banners: string;
  brands: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
  categories: Array<{
    id: string;
    requestId: string;
    name: string;
    description: string;
    imageUrl: string;
    parentId: string;
    path: string;
    level: number;
    children: Array<any>;
  }>;
}

interface FeaturesState {
  features: FeaturesData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeaturesState = {
  features: null,
  isLoading: false,
  error: null,
};

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    setFeatures: (state, action: PayloadAction<FeaturesData>) => {
      state.features = action.payload;
    },
    setFeaturesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFeaturesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetFeatures: (state) => {
      state.features = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setFeatures,
  setFeaturesLoading,
  setFeaturesError,
  resetFeatures,
} = featuresSlice.actions;

export default featuresSlice.reducer;
