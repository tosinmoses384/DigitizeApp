import { LinkingOptions } from '@react-navigation/native';

// Environment-aware web base URL for universal links
const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'https://staging.digitizeapp.com';

export const linkingConfig: LinkingOptions<any> = {
  prefixes: [
    'digitize-app://',
    'com.digitizeapp.digitizeapp://',
    'com.digitizeapp.app://',
    WEB_BASE_URL,
    'https://digitizeapp.app',
    'https://preview.digitizeapp.app',
  ],
  config: {
    screens: {
      // Main authenticated screens
      '(authenticated)': {
        screens: {
          '(tabs)': {
            screens: {
              index: 'home',
              wardrobe: 'wardrobe',
              add: 'add',
              profile: 'profile',
            },
          },
          // Item details with dynamic ID
          'ItemDetails': {
            path: '/item/:itemId',
            screens: {
              '[itemId]': 'item/:itemId',
            },
          },
          // User profile deep link handler
          'user': {
            path: 'user/:userId',
            screens: {
              '[userId]': 'user/:userId',
            },
          },
          // Post deep link handler
          'post': {
            path: 'post/:postId',
            screens: {
              '[postId]': 'post/:postId',
            },
          },
          // Actual seller profile screen (navigated to from deep link handler)
          'SellerProfile': 'seller-profile',
          // Items listing
          items: 'items',
          // Post creation
          addPost: 'create-post',
          // Chat with dynamic ID
          chats: {
            path: '/chat/:chatId',
            screens: {
              '[id]': 'chat/:chatId',
            },
          },
          // Edit profile item
          'editProfileItem': {
            path: '/edit-item/:itemId',
            screens: {
              '[id]': 'edit-item/:itemId',
            },
          },
        },
      },
      // Authentication screens
      Login: 'login',
      Signup: 'signup',
      OnboardingMain: 'onboarding',
      // Other screens
      filterPage: 'filter',
      NotFound: '*',
    },
  },
};

// Deep link URL generators for easy sharing
export const generateDeepLinks = {
  // Item details
  item: (itemId: string) => `digitize-app://item/${itemId}`,
  
  // User profile
  userProfile: (userId: string) => `digitize-app://user/${userId}`,
  
  // Post
  post: (postId: string) => `digitize-app://post/${postId}`,
  
  // Chat
  chat: (chatId: string) => `digitize-app://chat/${chatId}`,
  
  // Edit item
  editItem: (itemId: string) => `digitize-app://edit-item/${itemId}`,
  
  // Main sections
  home: () => `digitize-app://home`,
  wardrobe: () => `digitize-app://wardrobe`,
  add: () => `digitize-app://add`,
  profile: () => `digitize-app://profile`,
  
  // Authentication
  login: () => `digitize-app://login`,
  signup: () => `digitize-app://signup`,
  
  // Universal links (for sharing outside the app)
  universal: {
    // Web routes must match the deployed website routes per environment
    item: (itemId: string) => `${WEB_BASE_URL}/preloved/item-details/${itemId}`,
    userProfile: (userId: string) => `${WEB_BASE_URL}/preloved/seller-profile/${userId}`,
    post: (postId: string) => `${WEB_BASE_URL}/post/${postId}`,
    home: () => `${WEB_BASE_URL}/home`,
  },
};

// Helper function to parse deep link parameters
export const parseDeepLinkParams = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    return {
      path: urlObj.pathname,
      segments: pathSegments,
      params: Object.fromEntries(urlObj.searchParams),
    };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};
