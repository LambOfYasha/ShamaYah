import { useSettings } from '@/contexts/settings-context';

export function useCompactMode() {
  const { isCompactMode, isReducedMotion, fontSize, theme } = useSettings();
  
  return {
    isCompactMode,
    isReducedMotion,
    fontSize,
    theme,
    // Helper function to get compact-aware spacing classes
    getSpacing: (defaultSpacing: string, compactSpacing?: string) => {
      return isCompactMode ? (compactSpacing || defaultSpacing) : defaultSpacing;
    },
    // Helper function to get compact-aware text classes
    getTextSize: (defaultSize: string, compactSize?: string) => {
      return isCompactMode ? (compactSize || defaultSize) : defaultSize;
    },
    // Helper function to get compact-aware padding classes
    getPadding: (defaultPadding: string, compactPadding?: string) => {
      return isCompactMode ? (compactPadding || defaultPadding) : defaultPadding;
    },
    // Helper function to get compact-aware margin classes
    getMargin: (defaultMargin: string, compactMargin?: string) => {
      return isCompactMode ? (compactMargin || defaultMargin) : defaultMargin;
    }
  };
}
