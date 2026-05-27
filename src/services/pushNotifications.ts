import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { notificationAPI } from './api';

let registered = false;

/** Remote push tokens are not available in Expo Go (SDK 53+). */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export async function registerPushTokenIfPossible(): Promise<void> {
  if (registered || Platform.OS === 'web' || isExpoGo()) {
    return;
  }
  try {
    const Notifications = await import('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    if (!token) return;

    await notificationAPI.registerPushToken(
      token,
      Platform.OS === 'ios' ? 'ios' : 'android',
    );
    registered = true;
  } catch {
    // Dev client / missing Google Play services — non-fatal
  }
}

export function resetPushRegistration() {
  registered = false;
}
