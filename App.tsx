import React, { useEffect } from 'react';
import { I18nManager, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { restoreAccessToken } from './src/services/api';
import { I18nextProvider } from 'react-i18next';

import i18n from './src/strings';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { colors } from './src/theme/colors';
import { RideCallOverlay } from './src/components/RideCallOverlay';

function DeepLinkHandler() {
  const { t } = useTranslation();
  useEffect(() => {
    const handle = (url: string) => {
      if (!url.includes('wasselni://wallet')) return;
      const status = url.includes('status=success') ? 'success' : url.includes('status=failure') ? 'failure' : '';
      if (status === 'success') {
        Alert.alert(t('wallet.title'), t('wallet.topupSuccess'));
      } else if (status === 'failure') {
        Alert.alert(t('common.error'), t('wallet.topupError'));
      }
    };
    Linking.getInitialURL().then(u => { if (u) handle(u); });
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => sub.remove();
  }, [t]);
  return null;
}

export default function App() {
  useEffect(() => {
    I18nManager.allowRTL(true);
    restoreAccessToken().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RideProvider>
          <I18nextProvider i18n={i18n}>
            <NavigationContainer ref={navigationRef}>
              <DeepLinkHandler />
              <StatusBar style="light" backgroundColor={colors.surface} />
              <RootNavigator />
              <RideCallOverlay />
            </NavigationContainer>
          </I18nextProvider>
        </RideProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
