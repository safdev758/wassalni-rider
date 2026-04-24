# Yassir Rider App

A React Native Expo application for riders to request and track rides, built with TypeScript and following the "Stitch" design system.

## Features

- **Authentication**: Login, signup, and OTP verification with Algerian phone format (+213)
- **Ride Request Flow**: Location selection, ride options, driver matching
- **Real-time Tracking**: Live map tracking with driver location
- **Wallet**: Balance management, payment methods, transaction history
- **Activity**: Ride history and trip details
- **Profile**: User profile management and settings

## Localization

- **Languages**: English (LTR) and Arabic (RTL)
- **Region**: Algeria
- **Currency**: DZD (Algerian Dinar)
- **Phone Format**: +213

## Design System

This app follows the "Stitch" design system principles:
- **No-Line Philosophy**: Boundaries via background shifts, tonal transitions, generous padding
- **Surface Hierarchy**: Physical stack of materials (surface, surface-container-low, surface-container-high, surface-bright)
- **Glass & Gradient Rule**: CTAs use subtle linear gradients, overlays use glassmorphism
- **Typography**: Manrope for display, Inter for utility
- **Tonal Layering**: Depth achieved through stacking and ambient shadows

## Project Structure

```
rider-app/
├── App.tsx                          # App entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── src/
│   ├── api-contracts/              # API contract definitions
│   │   ├── auth.ts                 # Authentication API contracts
│   │   └── rides.ts                # Rides API contracts
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx          # Reusable button component
│   │       ├── Card.tsx            # Card component
│   │       └── Input.tsx           # Input field component
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Root navigation stack
│   │   └── MainTabNavigator.tsx    # Bottom tab navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── OtpVerificationScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx
│   │       ├── ActivityScreen.tsx
│   │       ├── WalletScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── strings/
│   │   ├── en.ts                   # English translations
│   │   ├── ar.ts                   # Arabic translations
│   │   └── index.ts                # i18next configuration
│   ├── theme/
│   │   ├── colors.ts               # Color palette
│   │   ├── typography.ts           # Typography system
│   │   ├── spacing.ts              # Spacing scale
│   │   └── index.ts                # Theme exports
│   └── types/
│       └── index.ts                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI

### Installation

```bash
cd rider-app
npm install
```

### Running the App

```bash
# Start the development server
npx expo start

# Run on iOS
npx expo run ios

# Run on Android
npx expo run android

# Run on web
npx expo start --web
```

## API Contracts

API contracts are defined in `/src/api-contracts/` and include:
- Request/response formats
- Status codes
- Error structures
- WebSocket event structures

See:
- `auth.ts` - Authentication endpoints
- `rides.ts` - Ride-related endpoints

## Key Dependencies

- `expo` - React Native framework
- `react-navigation` - Navigation
- `i18next` - Internationalization
- `expo-localization` - Device locale detection
- `react-native-maps` - Map integration
- `zustand` - State management
- `axios` - HTTP client

## Payment Integration

The payment layer is abstract and backend-driven. The app supports:
- Wallet balance
- Payment methods (cards, cash)
- Transaction history

Note: Apple Pay and Google Pay are not implemented as per requirements.

## Development Notes

### Lint Errors
The TypeScript lint errors shown in the IDE are expected since dependencies haven't been installed yet. Run `npm install` to resolve them.

### RTL Support
The app automatically switches between LTR and RTL layouts based on the selected language. Arabic uses RTL, English uses LTR.

### Algeria Localization
- Phone numbers use +213 country code
- Currency is DZD (Algerian Dinar)
- Maps are centered on Algeria coordinates
