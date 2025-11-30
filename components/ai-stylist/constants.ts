import { Dimensions } from 'react-native';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Carousel configuration constants
export const CAROUSEL_CONFIG = {
  // Item dimensions
  ITEM_WIDTH: 69,
  ITEM_HEIGHT: 66,
  ITEM_SPACING: 30,
  
  // Visible items configuration
  VISIBLE_ITEMS: 3,
  
  // Animation configuration
  AUTO_PLAY_INTERVAL: 3000, // 3 seconds
  ANIMATION_DURATION: 300, // 300ms for smooth scale transitions
} as const;

// Calculate carousel width based on visible items
export const CAROUSEL_WIDTH = 
  (CAROUSEL_CONFIG.ITEM_WIDTH * CAROUSEL_CONFIG.VISIBLE_ITEMS) + 
  (CAROUSEL_CONFIG.ITEM_SPACING * (CAROUSEL_CONFIG.VISIBLE_ITEMS - 1));

// Image assets configuration
export const CAROUSEL_IMAGES = {
  // Top carousel images
  TOP_CAROUSEL: [
    require('../../assets/images/png/opaqueImg5.png'),
    require('../../assets/images/png/image175.png'),
    require('../../assets/images/png/red.png'),
    require('../../assets/images/png/suit.png'),
  ],
  
  // Center model images
  CENTER_MODEL: [
    require('../../assets/images/png/stylist13.png'),
    require('../../assets/images/png/stylist10.png'),
    require('../../assets/images/png/stylist11.png'),
    require('../../assets/images/png/stylist12.png'),
  ],
  
  // Static background image
  BACKGROUND: require('../../assets/images/png/opaqueImg8.png'),
} as const;

// Border styling for active item
export const ACTIVE_ITEM_STYLE = {
  borderWidth: 2,
  borderColor: '#FF3B4A',
  borderRadius: 10,
} as const;

// Accessibility configuration
export const ACCESSIBILITY_CONFIG = {
  CAROUSEL_LABEL: 'AI Stylist outfit carousel',
  CAROUSEL_HINT: 'Swipe left or right to browse outfit ideas',
  ITEM_ROLE: 'image' as const,
  COMING_SOON_LABEL: 'Coming soon button',
  COMING_SOON_HINT: 'This feature will be available soon',
} as const;
