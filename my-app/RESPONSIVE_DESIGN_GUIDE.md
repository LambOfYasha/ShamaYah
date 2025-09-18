# Responsive Design Guide

This guide documents the responsive design implementation for the DOM Project web application, ensuring optimal user experience across mobile, tablet, and desktop devices.

## Overview

The application has been enhanced with comprehensive responsive functionality that includes:

- **Mobile-first design approach**
- **Responsive breakpoints** following Tailwind CSS conventions
- **Mobile sidebar navigation** with slide-out menu
- **Adaptive layouts** that adjust to screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Responsive typography** and spacing

## Breakpoints

The application uses the following breakpoints (based on Tailwind CSS):

```css
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

## Responsive Hooks

### useResponsive Hook

A comprehensive hook that provides device detection and screen size information:

```typescript
import { useResponsive } from "@/hooks/use-responsive"

function MyComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isSmallScreen, 
    isLargeScreen, 
    breakpoint,
    windowSize 
  } = useResponsive()
  
  // Use these values to conditionally render content
}
```

### useIsMobile Hook

A simpler hook for basic mobile detection:

```typescript
import { useIsMobile } from "@/hooks/use-mobile"

function MyComponent() {
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return <MobileLayout />
  }
  
  return <DesktopLayout />
}
```

## Responsive Components

### ResponsiveContainer

A container component that provides consistent spacing and layout:

```typescript
import { ResponsiveContainer } from "@/components/ui/responsive-container"

<ResponsiveContainer 
  maxWidth="xl" 
  padding="md" 
  centered={true}
>
  {/* Content */}
</ResponsiveContainer>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `centered`: boolean

### ResponsiveCard

A card component that adapts to different screen sizes:

```typescript
import { ResponsiveCard } from "@/components/ui/responsive-card"

<ResponsiveCard 
  title="Card Title"
  description="Card description"
  compact={false}
  mobileCompact={true}
>
  {/* Card content */}
</ResponsiveCard>
```

**Props:**
- `title`: string
- `description`: string
- `compact`: boolean (reduces padding)
- `mobileCompact`: boolean (compact on mobile)

### ResponsiveGrid

A flexible grid component for responsive layouts:

```typescript
import { ResponsiveGrid } from "@/components/ui/responsive-grid"

<ResponsiveGrid 
  cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
  autoFit={false}
>
  {/* Grid items */}
</ResponsiveGrid>
```

**Props:**
- `cols`: Object with breakpoint-specific column counts
- `gap`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `autoFit`: boolean (auto-fit grid)
- `autoFill`: boolean (auto-fill grid)

### ResponsiveButton

A button component with responsive text and icons:

```typescript
import { ResponsiveButton } from "@/components/ui/responsive-button"

<ResponsiveButton
  mobileText="Save"
  desktopText="Save Changes"
  mobileIcon={<Save className="w-4 h-4" />}
  desktopIcon={<Save className="w-4 h-4 mr-2" />}
  fullWidthOnMobile={true}
>
  Default Text
</ResponsiveButton>
```

**Props:**
- `mobileText`: string (text shown on mobile)
- `desktopText`: string (text shown on desktop)
- `mobileIcon`: ReactNode (icon shown on mobile)
- `desktopIcon`: ReactNode (icon shown on desktop)
- `fullWidthOnMobile`: boolean
- `compactOnMobile`: boolean

## Mobile Navigation

### MobileSidebar Component

A slide-out sidebar for mobile devices:

```typescript
import { MobileSidebar } from "@/components/mobile-sidebar"

<MobileSidebar />
```

**Features:**
- Slide-out animation from left
- Overlay background
- Touch-friendly navigation
- Auto-close on navigation
- Responsive content

### Header Integration

The header component has been updated to include:

- Mobile sidebar trigger (hamburger menu)
- Responsive button layouts
- Hidden elements on mobile
- Touch-friendly interactions

## Settings Page Responsiveness

The settings page has been fully optimized for mobile and tablet devices:

### Tab Navigation
- **Mobile**: 3-column grid with abbreviated text
- **Desktop**: 6-column grid with full text
- **Responsive**: Smooth transitions between layouts

### Form Layouts
- **Mobile**: Single column, full-width inputs
- **Tablet**: Two-column grid where appropriate
- **Desktop**: Multi-column layouts

### Button Layouts
- **Mobile**: Full-width buttons, stacked vertically
- **Desktop**: Auto-width buttons, horizontal layout

### Content Spacing
- **Mobile**: Reduced padding and margins
- **Desktop**: Standard spacing
- **Responsive**: Gradual scaling between breakpoints

## CSS Classes for Responsive Design

### Spacing Classes
```css
/* Responsive padding */
p-3 sm:p-4 lg:p-6

/* Responsive margins */
m-2 sm:m-4 lg:m-6

/* Responsive gaps */
gap-2 sm:gap-4 lg:gap-6
```

### Typography Classes
```css
/* Responsive text sizes */
text-sm sm:text-base lg:text-lg

/* Responsive font weights */
font-normal sm:font-medium lg:font-semibold
```

### Layout Classes
```css
/* Responsive flex direction */
flex-col sm:flex-row

/* Responsive grid columns */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

/* Responsive visibility */
hidden sm:block
block sm:hidden
```

### Interactive Classes
```css
/* Touch-friendly sizing */
min-h-[44px] /* Minimum touch target */
p-3 sm:p-4 /* Adequate padding for touch */

/* Responsive hover states */
hover:bg-gray-100 sm:hover:bg-gray-50
```

## Best Practices

### 1. Mobile-First Approach
Always start with mobile design and progressively enhance for larger screens.

### 2. Touch-Friendly Interfaces
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Clear visual feedback for touch interactions

### 3. Performance Considerations
- Optimize images for different screen densities
- Use responsive images with `srcset`
- Minimize JavaScript for mobile devices

### 4. Content Prioritization
- Show most important content first on mobile
- Use progressive disclosure for secondary content
- Maintain content hierarchy across all screen sizes

### 5. Testing
- Test on actual devices, not just browser dev tools
- Test with different orientations (portrait/landscape)
- Test with different user preferences (reduced motion, high contrast)

## Implementation Examples

### Responsive Form Layout
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="space-y-2">
    <Label className="text-sm sm:text-base">Field Label</Label>
    <Input className="text-sm sm:text-base" />
  </div>
</div>
```

### Responsive Button Group
```typescript
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Primary Action</Button>
  <Button variant="outline" className="w-full sm:w-auto">Secondary Action</Button>
</div>
```

### Responsive Card Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <ResponsiveCard title="Card Title" mobileCompact={true}>
    <p className="text-sm sm:text-base">Card content</p>
  </ResponsiveCard>
</div>
```

## Future Enhancements

1. **Dark Mode Support**: Implement responsive dark mode
2. **Accessibility**: Enhanced screen reader support
3. **Performance**: Lazy loading for mobile devices
4. **Offline Support**: Progressive Web App features
5. **Gesture Support**: Swipe gestures for mobile navigation

## Conclusion

This responsive design implementation provides a solid foundation for a modern web application that works seamlessly across all device types. The modular approach allows for easy maintenance and future enhancements while ensuring optimal user experience on every screen size.
