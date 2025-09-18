import * as React from "react"

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useResponsive() {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = windowSize.width < BREAKPOINTS.md
  const isTablet = windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg
  const isDesktop = windowSize.width >= BREAKPOINTS.lg
  const isSmallScreen = windowSize.width < BREAKPOINTS.sm
  const isLargeScreen = windowSize.width >= BREAKPOINTS.xl

  const breakpoint = React.useMemo(() => {
    if (windowSize.width >= BREAKPOINTS['2xl']) return '2xl'
    if (windowSize.width >= BREAKPOINTS.xl) return 'xl'
    if (windowSize.width >= BREAKPOINTS.lg) return 'lg'
    if (windowSize.width >= BREAKPOINTS.md) return 'md'
    if (windowSize.width >= BREAKPOINTS.sm) return 'sm'
    return 'xs'
  }, [windowSize.width])

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    breakpoint,
    breakpoints: BREAKPOINTS,
  }
}
