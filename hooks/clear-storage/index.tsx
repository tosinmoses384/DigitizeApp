import { useCallback } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const useClearStorage = () => {
  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.clear();

      ("Storage cleared successfully!");
    } catch (error) {
      // console.error("Failed to clear storage:", error);
    }
  }, []);

  return { clearStorage };
};
