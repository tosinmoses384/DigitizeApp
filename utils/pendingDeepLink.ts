import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_DEEP_LINK_KEY = '@digitizeapp_pending_deep_link';

export interface PendingDeepLink {
  type: 'post' | 'user' | 'item' | 'chat';
  id: string;
  url: string;
  timestamp: number;
}

/**
 * Save a deep link to be processed after authentication
 */
export const savePendingDeepLink = async (deepLink: Omit<PendingDeepLink, 'timestamp'>): Promise<void> => {
  try {
    const pendingLink: PendingDeepLink = {
      ...deepLink,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, JSON.stringify(pendingLink));
    console.log('💾 Saved pending deep link:', pendingLink);
  } catch (error) {
    console.error('❌ Error saving pending deep link:', error);
  }
};

/**
 * Get and clear the pending deep link
 */
export const getPendingDeepLink = async (): Promise<PendingDeepLink | null> => {
  try {
    const pendingLinkStr = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY);
    
    if (!pendingLinkStr) {
      return null;
    }
    
    const pendingLink: PendingDeepLink = JSON.parse(pendingLinkStr);
    
    // Check if the deep link is not too old (24 hours)
    const isExpired = Date.now() - pendingLink.timestamp > 24 * 60 * 60 * 1000;
    
    if (isExpired) {
      console.log('⏰ Pending deep link expired, clearing...');
      await clearPendingDeepLink();
      return null;
    }
    
    console.log('📥 Retrieved pending deep link:', pendingLink);
    return pendingLink;
  } catch (error) {
    console.error('❌ Error getting pending deep link:', error);
    return null;
  }
};

/**
 * Clear the pending deep link
 */
export const clearPendingDeepLink = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
    console.log('🧹 Cleared pending deep link');
  } catch (error) {
    console.error('❌ Error clearing pending deep link:', error);
  }
};

/**
 * Check if there's a pending deep link
 */
export const hasPendingDeepLink = async (): Promise<boolean> => {
  try {
    const pendingLink = await getPendingDeepLink();
    return pendingLink !== null;
  } catch (error) {
    console.error('❌ Error checking pending deep link:', error);
    return false;
  }
};
