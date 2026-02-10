/**
 * Mobile Optimizations Provider Component
 * Import this in your _app.js or layout.js to apply mobile optimizations globally
 */

import React, { useEffect } from 'react';
import '../styles/mobile-optimizations.css';
import { optimizeForMobile } from '@/lib/mobile-utils';

interface MobileOptimizationsProviderProps {
  children: React.ReactNode;
  enableGlobalOptimizations?: boolean;
}

export const MobileOptimizationsProvider: React.FC<MobileOptimizationsProviderProps> = ({ 
  children, 
  enableGlobalOptimizations = true 
}) => {
  useEffect(() => {
    if (enableGlobalOptimizations) {
      optimizeForMobile();
    }
  }, [enableGlobalOptimizations]);

  return <>{children}</>;
};

export default MobileOptimizationsProvider;