/**
 * Mobile utility functions for responsive design and touch handling
 */

export interface TouchPosition {
  x: number;
  y: number;
}

export interface SwipeDirection {
  horizontal: "left" | "right" | null;
  vertical: "up" | "down" | null;
}

/**
 * Detect if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth < 640 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get responsive card count based on screen width
 */
export const getResponsiveCardCount = (width?: number): number => {
  const screenWidth =
    width || (typeof window !== "undefined" ? window.innerWidth : 1200);

  if (screenWidth < 640) return 1; // Mobile
  if (screenWidth < 1024) return 2; // Tablet
  return 4; // Desktop
};

/**
 * Calculate swipe direction and distance
 */
export const calculateSwipe = (
  startPos: TouchPosition,
  endPos: TouchPosition,
  minDistance: number = 50,
): SwipeDirection & { distance: number; isSwipe: boolean } => {
  const deltaX = endPos.x - startPos.x;
  const deltaY = endPos.y - startPos.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const isSwipe = distance >= minDistance;

  const horizontal =
    Math.abs(deltaX) > Math.abs(deltaY)
      ? deltaX > 0
        ? "right"
        : "left"
      : null;

  const vertical =
    Math.abs(deltaY) > Math.abs(deltaX) ? (deltaY > 0 ? "down" : "up") : null;

  return {
    horizontal,
    vertical,
    distance,
    isSwipe,
  };
};

/**
 * Debounce function for resize events
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle function for scroll/touch events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Create touch event handlers for mobile slider
 */
export const createTouchHandlers = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minSwipeDistance: number = 50,
) => {
  let touchStart: TouchPosition | null = null;
  let touchEnd: TouchPosition | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    touchEnd = null; // Reset end position
    touchStart = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEnd = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const swipe = calculateSwipe(touchStart, touchEnd, minSwipeDistance);

    if (swipe.isSwipe && swipe.horizontal) {
      if (swipe.horizontal === "left") {
        onSwipeLeft();
      } else if (swipe.horizontal === "right") {
        onSwipeRight();
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

/**
 * Performance optimization for mobile
 */
export const optimizeForMobile = () => {
  if (typeof window === "undefined") return;

  // Disable iOS zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false,
  );

  // Prevent iOS scroll bounce
  document.body.addEventListener(
    "touchmove",
    (e) => {
      if (e.target === document.body) {
        e.preventDefault();
      }
    },
    { passive: false },
  );
};

/**
 * Get optimal image dimensions for mobile
 */
export const getOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 400,
  maxHeight: number = 300,
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Mobile-safe setTimeout with proper cleanup
 */
export const mobileSafeTimeout = (
  callback: () => void,
  delay: number,
): (() => void) => {
  const timeoutId = setTimeout(callback, delay);

  return () => {
    clearTimeout(timeoutId);
  };
};

/**
 * Create intersection observer optimized for mobile
 */
export const createMobileIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver | null => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    threshold: isMobileDevice() ? 0.2 : 0.1,
    rootMargin: isMobileDevice() ? "0px 0px -50px 0px" : "0px",
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};
