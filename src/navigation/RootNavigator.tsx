import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { SearchingScreen } from '../screens/ride/SearchingScreen';
import { RideOptionsScreen } from '../screens/ride/RideOptionsScreen';
import { DriverFoundScreen } from '../screens/ride/DriverFoundScreen';
import { RideTrackingScreen } from '../screens/ride/RideTrackingScreen';
import { RateTripScreen } from '../screens/ride/RateTripScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacyPolicyScreen } from '../screens/profile/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/profile/TermsOfServiceScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
  Main: undefined;
  Searching: undefined;
  RideOptions: undefined;
  DriverFound: undefined;
  RideTracking: undefined;
  RateTrip: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Help: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Guests can browse the map/home tab but must sign in before booking a ride
  // or editing their profile. All auth screens stay registered so Profile's
  // "Login" CTA can navigate to them from anywhere in the tree.
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Main' : 'Login'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#131313' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
      <Stack.Screen name="DriverFound" component={DriverFoundScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="RateTrip" component={RateTripScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
};
