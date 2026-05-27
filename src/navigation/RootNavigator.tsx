import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { SearchingScreen } from '../screens/ride/SearchingScreen';
import { DestinationSearchScreen } from '../screens/ride/DestinationSearchScreen';
import { RideOptionsScreen } from '../screens/ride/RideOptionsScreen';
import { DriverFoundScreen } from '../screens/ride/DriverFoundScreen';
import { RideTrackingScreen } from '../screens/ride/RideTrackingScreen';
import { RateTripScreen } from '../screens/ride/RateTripScreen';
import { ChatScreen } from '../screens/ride/ChatScreen';
import { ReportScreen } from '../screens/ride/ReportScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacyPolicyScreen } from '../screens/profile/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/profile/TermsOfServiceScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { AddSavedLocationScreen } from '../screens/saved/AddSavedLocationScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
  Main: undefined;
  DestinationSearch: undefined;
  Searching: undefined;
  RideOptions: undefined;
  DriverFound: undefined;
  RideTracking: undefined;
  RateTrip: undefined;
  Chat: undefined;
  Report: { pendingEvidenceId?: string; reasonCode?: string } | undefined;
  EditProfile: undefined;
  Notifications: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Help: undefined;
  AddSavedLocation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Home/Map is the default entry point for everyone (including guests).
  // Guests can browse the map and explore, but will be prompted to sign in
  // when they try to book a ride or edit their profile. All auth screens
  // stay registered so Profile's "Login" CTA can navigate to them.
  useAuth(); // keep subscribed so navigator re-renders on auth changes

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#131313' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="DestinationSearch" component={DestinationSearchScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Searching" component={SearchingScreen} />
      <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
      <Stack.Screen name="DriverFound" component={DriverFoundScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="RateTrip" component={RateTripScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="AddSavedLocation" component={AddSavedLocationScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
};
