import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';

import i18n from './src/strings';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RideProvider>
          <I18nextProvider i18n={i18n}>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor={colors.surface} />
              <RootNavigator />
            </NavigationContainer>
          </I18nextProvider>
        </RideProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
