/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
// import { IGetProfileResponse } from "../../../services/features/identity-service/models";

interface IProfileState {
  profile: any;
  refetchUserState: boolean;
  profileLoader: boolean;
  token: string;
  refecthHomeState: boolean;
  isShownLoginModal: boolean;
  currentChatName: string;
  resendCodeDuration: number;
  refecthUserDashboardState: boolean;
  refetchPostList: boolean;
  userName: string;
  refetchUserName: boolean;
  postageAddress: any;
  refetchPostageAddress: boolean;
  oldPhoneNumber: string;
  fetchMoreItem: boolean;
  profileTab: string;
  metaData: any;
  chatItem: any;
  checkoutData: any;
  showSocialOnboardingModal: boolean;
  hasCompletedSocialOnboarding: boolean;
}

const initialState: IProfileState = {
  profile: null,
  refetchUserState: false,
  token: "",
  profileLoader: false,
  refecthHomeState: false,
  isShownLoginModal: false,
  currentChatName: "",
  resendCodeDuration: 0,
  refecthUserDashboardState: false,
  refetchPostList: false,
  userName: "",
  refetchUserName: false,
  postageAddress: null,
  refetchPostageAddress: false,
  oldPhoneNumber: "",
  fetchMoreItem: false,
  profileTab: "",
  metaData: null,
  chatItem: null,
  checkoutData: null,
  showSocialOnboardingModal: false,
  hasCompletedSocialOnboarding: false,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state: IProfileState, action: PayloadAction<any>) => {
      const { payload } = action;
      state.profile = payload;
    },
    setRefetchUserState: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refetchUserState = payload;
    },
    setRefetchHomeState: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refecthHomeState = payload;
    },

    setToken: (state: IProfileState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.token = payload;
    },
    setProfileLoaderState: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.profileLoader = payload;
    },
    setIsShownLoginModal: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.isShownLoginModal = payload;
    },
    setCurrentChatName: (
      state: IProfileState,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.currentChatName = payload;
    },
    setResetCodeDuration: (
      state: IProfileState,
      action: PayloadAction<number>
    ) => {
      const { payload } = action;
      state.resendCodeDuration = payload;
    },

    setRefetchUserDashboardState: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refecthUserDashboardState = payload;
    },
    setRefetchPostList: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refetchPostList = payload;
    },
    setUserName: (state: IProfileState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.userName = payload;
    },
    setRefetchUserName: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refetchUserName = payload;
    },
    setPostageAddress: (state: IProfileState, action: PayloadAction<any>) => {
      const { payload } = action;
      state.postageAddress = payload;
    },
    setRefetchPostageAddress: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.refetchPostageAddress = payload;
    },
    setOldPhoneNumber: (
      state: IProfileState,
      action: PayloadAction<string>
    ) => {
      const { payload } = action;
      state.oldPhoneNumber = payload;
    },
    setFetchMoreItem: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.fetchMoreItem = payload;
    },
    setProfileTab: (state: IProfileState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.profileTab = payload;
    },
    setMetaData: (state: IProfileState, action: PayloadAction<any>) => {
      const { payload } = action;
      state.metaData = payload;
    },
    setChatItem: (state: IProfileState, action: PayloadAction<any>) => {
      const { payload } = action;
      state.chatItem = payload;
    },
    setCheckoutData: (state: IProfileState, action: PayloadAction<any>) => {
      const { payload } = action;
      state.checkoutData = payload;
    },
    setShowSocialOnboardingModal: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.showSocialOnboardingModal = payload;
    },
    setHasCompletedSocialOnboarding: (
      state: IProfileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.hasCompletedSocialOnboarding = payload;
    },
  },
});

export const {
  setProfile,
  setRefetchUserState,
  setToken,
  setProfileLoaderState,
  setRefetchHomeState,
  setIsShownLoginModal,
  setCurrentChatName,
  setResetCodeDuration,
  setRefetchUserDashboardState,
  setRefetchPostList,
  setUserName,
  setRefetchUserName,
  setPostageAddress,
  setRefetchPostageAddress,
  setOldPhoneNumber,
  setFetchMoreItem,
  setProfileTab,
  setChatItem,
  setMetaData,
  setCheckoutData,
  setShowSocialOnboardingModal,
  setHasCompletedSocialOnboarding,
} = profileSlice.actions;
export default profileSlice.reducer;
