import { useState, useCallback, useEffect } from 'react';
import { geminiApiKeyService } from '@services/features/ai-stylist/geminiApiKeyService';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

interface UseGeminiApiKeyResult {
  apiKey: string | null;
  hasApiKey: boolean;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  saveApiKey: (key: string) => Promise<boolean>;
  deleteApiKey: () => Promise<void>;
  validateAndSaveApiKey: (key: string) => Promise<boolean>;
  checkClipboardForApiKey: () => Promise<string | null>;
  refreshApiKey: () => Promise<void>;
}

export const useGeminiApiKey = (): UseGeminiApiKeyResult => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApiKey = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const key = await geminiApiKeyService.getApiKey();
      setApiKey(key);
      setHasApiKey(!!key);
    } catch (err) {
      setError('Failed to load API key');
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  const saveApiKey = useCallback(async (key: string): Promise<boolean> => {
    setError(null);

    try {
      await geminiApiKeyService.saveApiKey(key);
      setApiKey(key);
      setHasApiKey(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save API key';
      setError(errorMessage);
      return false;
    }
  }, []);

  const deleteApiKey = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await geminiApiKeyService.deleteApiKey();
      setApiKey(null);
      setHasApiKey(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const validateAndSaveApiKey = useCallback(async (key: string): Promise<boolean> => {
    setIsValidating(true);
    setError(null);

    try {
      const validation = await geminiApiKeyService.validateApiKey(key);

      if (!validation.isValid) {
        setError(validation.error || 'Invalid API key');
        Alert.alert('Invalid API Key', validation.error || 'Please check your API key and try again.');
        return false;
      }

      const saved = await saveApiKey(key);
      if (saved) {
        Alert.alert('Success', 'Your AI Stylist is ready to use!');
      }
      return saved;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate API key';
      setError(errorMessage);
      Alert.alert('Validation Error', errorMessage);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [saveApiKey]);

  const checkClipboardForApiKey = useCallback(async (): Promise<string | null> => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      const extractedKey = geminiApiKeyService.extractApiKeyFromClipboard(clipboardText);

      if (extractedKey) {
        return extractedKey;
      } else {
        Alert.alert(
          'No API Key Found',
          'No valid Gemini API key found in clipboard. Make sure you copied it correctly.'
        );
        return null;
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to read clipboard');
      return null;
    }
  }, []);

  const refreshApiKey = useCallback(async (): Promise<void> => {
    await loadApiKey();
  }, [loadApiKey]);

  return {
    apiKey,
    hasApiKey,
    isLoading,
    isValidating,
    error,
    saveApiKey,
    deleteApiKey,
    validateAndSaveApiKey,
    checkClipboardForApiKey,
    refreshApiKey,
  };
};
