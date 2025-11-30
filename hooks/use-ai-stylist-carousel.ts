import { useState, useCallback, useEffect, useRef } from 'react';
import { CAROUSEL_IMAGES } from '../components/ai-stylist/constants';

/**
 * Custom hook for AI Stylist carousel business logic
 * Manages carousel state and synchronization with other UI elements
 * Follows coding guide principles for hooks and state management
 */
export const useAIStylistCarousel = () => {
  // Current carousel index
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Current center model image based on carousel position
  const [centerModelImage, setCenterModelImage] = useState(
    CAROUSEL_IMAGES.CENTER_MODEL[0]
  );
  
  // Ref to track component mount status
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  /**
   * Handle carousel index change
   * Updates the center model image based on current carousel position
   */
  const handleCarouselIndexChange = useCallback((index: number) => {
    if (!isMountedRef.current) return;
    
    setCurrentIndex(index);
    
    // Update center model image based on carousel index
    const modelIndex = index % CAROUSEL_IMAGES.CENTER_MODEL.length;
    setCenterModelImage(CAROUSEL_IMAGES.CENTER_MODEL[modelIndex]);
  }, []);
  
  return {
    // State
    currentIndex,
    centerModelImage,
    
    // Actions
    handleCarouselIndexChange,
    
    // Static data
    backgroundImage: CAROUSEL_IMAGES.BACKGROUND,
  };
};
