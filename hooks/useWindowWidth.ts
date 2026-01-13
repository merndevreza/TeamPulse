import { useState, useEffect } from 'react';

/**
 * A hook that returns the current window width and handles SSR
 * @returns The current window width in pixels (defaults to 0 during SSR)
 */
const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(0); 
  
  useEffect(() => {
    // Set initial width after mount
    setWidth(window.innerWidth);

    // Handler for window resize
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

export default useWindowWidth;