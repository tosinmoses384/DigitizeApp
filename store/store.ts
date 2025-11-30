import { create } from "zustand";

type Store = {
  auth: {
    username: string;
    active: boolean;
  };
  setUsername: (state: any) => void;
};

export const useAuthStore = create<Store>()((set) => ({
  auth: {
    username: "",
    active: false,
  },
  setUsername: (name: any) =>
    set((state) => ({ auth: { ...state.auth, username: name } })),
}));