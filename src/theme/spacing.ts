// Premium Mobility Design System - Spacing
// Generous padding for "breathing room" - No-Line Philosophy

export const spacing = {
  // Base unit
  base: 4,

  // Scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Component-specific spacing
  screenPadding: 24,
  cardPadding: 16,
  cardGap: 16,
  sectionGap: 24,
  elementGap: 12,

  // Border Radius
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  // Elevation/Shadow
  elevation: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 24,
  },
} as const;

export type Spacing = typeof spacing;
