import { useState, useCallback } from 'react';
import { outfitTryOnService } from '@services/features/ai-stylist/outfitTryOnService';
import { Alert } from 'react-native';

interface OutfitSuggestion {
  description: string;
  styleNotes: string;
  occasions: string[];
}

interface TryOnResult {
  itemId: string;
  imageUri: string;
  itemTitle?: string;
}

interface WardrobeItemForTryOn {
  id: string;
  imageUrl: string;
  category?: string;
  title?: string;
}

interface UseOutfitTryOnResult {
  suggestions: OutfitSuggestion[];
  tryOnResults: TryOnResult[];
  isGenerating: boolean;
  error: string | null;
  generateOutfits: (wardrobeItems: string[], preferences?: string) => Promise<void>;
  generateVirtualTryOn: (personImageUri: string, clothingItem: WardrobeItemForTryOn) => Promise<void>;
  clearSuggestions: () => void;
  clearTryOnResults: () => void;
}

export const useOutfitTryOn = (): UseOutfitTryOnResult => {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [tryOnResults, setTryOnResults] = useState<TryOnResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVirtualTryOn = useCallback(async (
    personImageUri: string,
    clothingItem: WardrobeItemForTryOn
  ): Promise<void> => {
    if (!personImageUri) {
      Alert.alert('No Photo Selected', 'Please select a photo of yourself first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await outfitTryOnService.generateVirtualTryOn(
        personImageUri,
        clothingItem
      );

      if (result.success && result.imageUri) {
        const newResult: TryOnResult = {
          itemId: clothingItem.id,
          imageUri: result.imageUri,
          itemTitle: clothingItem.title,
        };
        setTryOnResults(prev => [...prev, newResult]);
      } else {
        const errorMessage = result.error || 'Failed to generate virtual try-on';
        setError(errorMessage);
        Alert.alert('Generation Failed', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateOutfits = useCallback(async (
    wardrobeItems: string[],
    preferences?: string
  ): Promise<void> => {
    if (wardrobeItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one wardrobe item to generate outfits.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await outfitTryOnService.generateOutfitSuggestions(
        wardrobeItems,
        preferences
      );

      if (result.success && result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        const errorMessage = result.error || 'Failed to generate outfit suggestions';
        setError(errorMessage);
        Alert.alert('Generation Failed', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  const clearTryOnResults = useCallback(() => {
    setTryOnResults([]);
    setError(null);
  }, []);

  return {
    suggestions,
    tryOnResults,
    isGenerating,
    error,
    generateOutfits,
    generateVirtualTryOn,
    clearSuggestions,
    clearTryOnResults,
  };
};
