import { useEffect, useRef } from 'react';

/**
 * specific hook to monitor render performance
 * @param componentName Name of the component to track
 */
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(global.performance ? global.performance.now() : Date.now());

  renderCount.current += 1;
  
  if (__DEV__) {
    const now = global.performance ? global.performance.now() : Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    console.log(
      `[Performance] ${componentName} rendered. Count: ${renderCount.current}. Time since last: ${timeSinceLastRender.toFixed(2)}ms`
    );
  }

  useEffect(() => {
    if (__DEV__) {
      console.log(`[Performance] ${componentName} mounted`);
    }
    return () => {
      if (__DEV__) {
        console.log(`[Performance] ${componentName} unmounted`);
      }
    };
  }, [componentName]);
};



