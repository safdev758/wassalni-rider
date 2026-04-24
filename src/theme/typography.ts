// Premium Mobility Design System - Typography
// Fonts: Manrope (Display/Headline) & Inter (Body/Label)

export const typography = {
  // Font Families
  fontFamily: {
    headline: 'Manrope',
    body: 'Inter',
    label: 'Inter',
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Font Sizes - Editorial Authority Scale
  fontSize: {
    // Display
    displayLarge: 57,
    displayMedium: 45,
    displaySmall: 36,

    // Headline
    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,

    // Title
    titleLarge: 22,
    titleMedium: 16,
    titleSmall: 14,

    // Body
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,

    // Label
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,

    // Custom Sizes from Design System
    displayLG: 56, // 3.5rem - Arrival times
    headlineSM: 24, // 1.5rem - Destination titles
    titleMD: 18, // 1.125rem - Vehicle types
    bodyMD: 14, // 0.875rem - Standard UI text
    labelMD: 12, // 0.75rem - Uppercase metadata
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.05,
    wider: 0.1,
  },
} as const;

export type Typography = typeof typography;
