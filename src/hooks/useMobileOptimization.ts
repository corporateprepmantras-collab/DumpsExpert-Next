/**
 * Custom React hooks for mobile optimization
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isMobileDevice,
  isTouchDevice,
  getResponsiveCardCount,
  debounce,
  prefersReducedMotion,
  createMobileIntersectionObserver,
} from "@/lib/mobile-utils";

/**
 * Hook for mobile device detection with responsive card count
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [cardCount, setCardCount] = useState(4);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = debounce(() => {
      const mobile = isMobileDevice();
      const touch = isTouchDevice();
      const width = window.innerWidth;
      const cards = getResponsiveCardCount(width);

      setIsMobile(mobile);
      setIsTouch(touch);
      setScreenWidth(width);
      setCardCount(cards);
    }, 150);

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile,
    isTouch,
    cardCount,
    screenWidth,
    isTablet: screenWidth >= 640 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
  };
};

/**
 * Hook for mobile-optimized touch/swipe handling
 */
export const useSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minDistance: number = 50,
) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent | React.TouchEvent) => {
    touchEnd.current = null;
    const touch =
      (e as TouchEvent).touches?.[0] || (e as TouchEvent).changedTouches?.[0];
    if (touch) {
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
    const touch =
      (e as TouchEvent).touches?.[0] || (e as TouchEvent).changedTouches?.[0];
    if (touch) {
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe and meets minimum distance
    if (absDeltaX > absDeltaY && absDeltaX > minDistance) {
      if (deltaX > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, minDistance]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

/**
 * Hook for auto-sliding functionality with mobile optimizations
 */
export const useAutoSlide = (
  slideFunction: () => void,
  interval: number = 5000,
  mobileInterval?: number,
) => {
  const { isMobile } = useMobile();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isActive) {
      const delay = isMobile && mobileInterval ? mobileInterval : interval;
      intervalRef.current = setInterval(slideFunction, delay);
    }
  }, [slideFunction, interval, mobileInterval, isMobile, isActive]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pauseAutoSlide = useCallback(() => {
    setIsActive(false);
    stopAutoSlide();
  }, [stopAutoSlide]);

  const resumeAutoSlide = useCallback((delay: number = 2000) => {
    setTimeout(() => {
      setIsActive(true);
    }, delay);
  }, []);

  useEffect(() => {
    if (isActive) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }

    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide, isActive]);

  useEffect(() => {
    return () => {
      stopAutoSlide();
    };
  }, [stopAutoSlide]);

  return {
    startAutoSlide,
    stopAutoSlide,
    pauseAutoSlide,
    resumeAutoSlide,
    isActive,
  };
};

/**
 * Hook for mobile-optimized intersection observer
 */
export const useMobileIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = createMobileIntersectionObserver(callback, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return {
    observer: observerRef.current,
    observe,
    unobserve,
    disconnect,
  };
};

/**
 * Hook for managing transition states and preventing multiple simultaneous transitions
 */
export const useTransition = (duration: number = 300) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTransition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsTransitioning(true);
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);
  }, [duration]);

  const cancelTransition = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isTransitioning,
    startTransition,
    cancelTransition,
  };
};

/**
 * Hook for accessibility preferences
 */
export const useAccessibility = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      setReducedMotion(prefersReducedMotion());
    };

    checkReducedMotion();

    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  return {
    prefersReducedMotion: reducedMotion,
    getAnimationDuration: (normal: number, reduced: number = 0) =>
      reducedMotion ? reduced : normal,
  };
};
