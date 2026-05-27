import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../screens/main/HomeScreen';
import { ActivityScreen } from '../screens/main/ActivityScreen';
import { WalletScreen } from '../screens/main/WalletScreen';
import { ProfileGuestScreen } from '../screens/main/ProfileGuestScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AuthRequiredTab } from '../components/AuthRequiredTab';
import { useAuth } from '../context/AuthContext';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  Wallet: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isGuest } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLow + 'E6',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + spacing.sm,
          paddingTop: spacing.sm,
          height: 64 + insets.bottom,
          borderTopLeftRadius: spacing.borderRadius.xxl,
          borderTopRightRadius: spacing.borderRadius.xxl,
        },
        tabBarBackground: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.surfaceBright,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.label,
          fontSize: 10,
          fontWeight: typography.fontWeight.medium,
          textTransform: 'uppercase',
          letterSpacing: typography.letterSpacing.wider,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Ionicons
                name={focused ? 'car' : 'car-outline'}
                size={22}
                color={focused ? colors.onPrimary : colors.surfaceBright}
              />
              <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
                Ride
              </Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Activity"
        children={() => (
          <AuthRequiredTab titleKey="activity.title">
            <ActivityScreen />
          </AuthRequiredTab>
        )}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={focused ? colors.onPrimary : colors.surfaceBright}
              />
              <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
                {t('activity.title')}
              </Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Wallet"
        children={() => (
          <AuthRequiredTab titleKey="wallet.title">
            <WalletScreen />
          </AuthRequiredTab>
        )}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={22}
                color={focused ? colors.onPrimary : colors.surfaceBright}
              />
              <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
                {t('wallet.title')}
              </Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={isGuest ? ProfileGuestScreen : ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? colors.onPrimary : colors.surfaceBright}
              />
              <Text style={focused ? styles.activeLabel : styles.inactiveLabel}>
                {t('profile.title')}
              </Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  inactiveTab: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.surfaceBright,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
