import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

export const useSetItemToStorage = () => {
  const setItem = useCallback(async (key, value) => {
    try {
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : value;
      await AsyncStorage.setItem(key, stringValue);
      `${key} set to storage.`;
    } catch (error) {
      console.error("Error setting item to storage:", error);
    }
  }, []);

  return { setItem };
};
