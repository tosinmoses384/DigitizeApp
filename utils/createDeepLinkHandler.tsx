import React, { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import BaseDeepLinkHandler from '../components/BaseDeepLinkHandler';

/**
 * Factory function to create reusable deep link handlers
 * 
 * This utility makes it easy to create new deep link handlers with consistent structure:
 * - Handles authentication state automatically
 * - Provides loading UI
 * - Integrates with the custom hook for unauthenticated users
 * - Follows the same pattern for all deep link types
 * 
 * @param config Configuration object for the deep link handler
 * @returns React component for the deep link handler
 * 
 * @example
 * // Create an item deep link handler
 * export default createDeepLinkHandler({
 *   type: 'item',
 *   paramName: 'itemId',
 *   onNavigate: (id) => router.replace(`/ItemDetails/${id}`)
 * });
 * 
 * @example
 * // Create a chat deep link handler
 * export default createDeepLinkHandler({
 *   type: 'chat',
 *   paramName: 'chatId',
 *   onNavigate: (id) => router.replace(`/chats/${id}`)
 * });
 */

interface DeepLinkHandlerConfig {
  type: 'post' | 'user' | 'item' | 'chat';
  paramName: string; // e.g., 'postId', 'userId', 'itemId', 'chatId'
  onNavigate: (id: string) => void;
}

export const createDeepLinkHandler = (config: DeepLinkHandlerConfig) => {
  const { type, paramName, onNavigate } = config;
  
  return function DeepLinkHandler() {
    // Get the parameter from the URL (e.g., postId, userId, etc.)
    const params = useLocalSearchParams<Record<string, string>>();
    const id = params[paramName];

    // Navigation callback for authenticated users
    const handleAuthenticatedNavigation = useCallback((entityId: string) => {
      onNavigate(entityId);
    }, []);

    return (
      <BaseDeepLinkHandler
        id={id}
        type={type}
        onAuthenticatedNavigation={handleAuthenticatedNavigation}
        entityName={paramName}
      />
    );
  };
};

export default createDeepLinkHandler;
