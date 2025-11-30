import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

export const useGetItemFromStorage = (key: string) => {
  const [item, setItem] = useState(null);

  const getItem = useCallback(async () => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      setItem(storedValue ? JSON.parse(storedValue) : null); // Parse if it's a JSON object
    } catch (error) {
      return null;
    }
  }, [key]);

  useEffect(() => {
    getItem();
  }, [getItem]);

  return { item, refresh: getItem };
};
