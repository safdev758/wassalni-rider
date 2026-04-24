// Premium Mobility Design System - Colors
// Based on the "Stitch" design philosophy

export const colors = {
  // Primary - Electric Premium Blue
  primary: '#b7c4ff',
  onPrimary: '#002584',
  primaryContainer: '#000000',
  onPrimaryContainer: '#3b67ff',
  primaryFixed: '#dde1ff',
  primaryFixedDim: '#b7c4ff',
  onPrimaryFixed: '#001453',
  onPrimaryFixedVariant: '#0037b8',
  inversePrimary: '#004bf0',

  // Secondary
  secondary: '#c6c6c7',
  onSecondary: '#2f3131',
  secondaryContainer: '#454747',
  onSecondaryContainer: '#b4b5b5',
  secondaryFixed: '#e2e2e2',
  secondaryFixedDim: '#c6c6c7',
  onSecondaryFixed: '#1a1c1c',
  onSecondaryFixedVariant: '#454747',

  // Tertiary
  tertiary: '#c6c6c6',
  onTertiary: '#303030',
  tertiaryContainer: '#000000',
  onTertiaryContainer: '#757575',
  tertiaryFixed: '#e2e2e2',
  tertiaryFixedDim: '#c6c6c6',
  onTertiaryFixed: '#1b1b1b',
  onTertiaryFixedVariant: '#474747',

  // Error
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  // Surface Hierarchy - "The No-Line Philosophy"
  background: '#131313',
  onBackground: '#e2e2e2',
  surface: '#131313',
  onSurface: '#e2e2e2',
  surfaceVariant: '#353535',
  onSurfaceVariant: '#cfc4c5',
  inverseSurface: '#e2e2e2',
  inverseOnSurface: '#303030',
  surfaceTint: '#b7c4ff',

  // Surface Containers - Tonal Layering
  surfaceDim: '#131313',
  surfaceBright: '#393939',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1b1b1b',
  surfaceContainer: '#1f1f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353535',

  // Outline
  outline: '#988e90',
  outlineVariant: '#4c4546',

  // Scrim/Overlay
  scrim: '#000000',

  // Shadow
  shadow: '#000000',
} as const;

export type Colors = typeof colors;
