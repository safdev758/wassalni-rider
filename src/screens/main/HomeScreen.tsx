import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const SAVED_LOCATIONS = [
  { id: 'home', name: 'Home', address: 'Hydra, Algiers', distance: '2.4 km' },
  { id: 'work', name: 'Office', address: 'Bab Ezzouar, Algiers', distance: '14.2 km' },
];

const RECENT_LOCATIONS = [
  { id: '1', name: 'The Ritz-Carlton', address: '181 Peachtree St NE' },
  { id: '2', name: 'Houari Boumediene Airport', address: 'North Terminal Drop-off' },
];

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { startSearch } = useRide();
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 36.7538,
    longitude: 3.0588,
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.log('Error getting location:', error);
        // Fallback to Algiers coordinates if location fails
      }
    })();
  }, []);

  const handleSearchPress = () => {
    startSearch('1240 Techwood Drive NW', 'JFK International Airport');
    navigation.navigate('Searching');
  };

  const handleLocationPress = (location: string) => {
    startSearch('1240 Techwood Drive NW', location);
    navigation.navigate('Searching');
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle}
      >
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title={t('home.currentLocation')}
        >
          <View style={styles.markerContainer}>
            {/* Pulse effect */}
            <View style={styles.markerPulse} />
            {/* Pin */}
            <View style={styles.markerDot}>
              <Ionicons name="car" size={12} color={colors.surface} />
            </View>
            {/* Stem */}
            <View style={styles.markerStem} />
            <View style={styles.markerShadow} />
          </View>
        </Marker>
      </MapView>

      {/* Top Safe Area Overlay */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />

        {/* Search Bar - Frosted Glass */}
        <TouchableOpacity
          style={styles.searchCard}
          onPress={handleSearchPress}
          activeOpacity={0.9}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
            </View>
            <View style={styles.searchTextContainer}>
              <Text style={styles.searchTitle}>{t('home.whereTo')}</Text>
              <Text style={styles.searchSubtitle}>{t('home.enterDestination')}</Text>
            </View>
            <TouchableOpacity style={styles.scheduleButton} onPress={() => Alert.alert('Schedule', 'Ride scheduling coming soon.')}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Quick Access Panel */}
        <ScrollView
          style={styles.panelScroll}
          contentContainerStyle={styles.panelContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Current Location */}
          <View style={styles.currentLocationRow}>
            <View style={styles.currentLocationIconContainer}>
              <Ionicons name="locate" size={20} color={colors.primary} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.currentLocationTitle}>
                1240 Techwood Drive NW
              </Text>
              <Text style={styles.currentLocationAddress}>
                {t('home.currentLocation')}
              </Text>
            </View>
          </View>

          {/* Suggested Destinations */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('home.suggested')}</Text>
            <View style={styles.suggestedGrid}>
              {SAVED_LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.suggestedCard}
                  onPress={() => handleLocationPress(location.address)}
                  activeOpacity={0.9}
                >
                  <View style={styles.suggestedIconContainer}>
                    <Ionicons
                      name={location.id === 'home' ? 'home' : 'briefcase'}
                      size={18}
                      color={location.id === 'home' ? colors.primary : colors.onSurface}
                    />
                  </View>
                  <View>
                    <Text style={styles.suggestedName}>{location.name}</Text>
                    <Text style={styles.suggestedDistance}>{location.distance}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Places */}
          <View style={styles.sectionContainer}>
            {RECENT_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.recentItem}
                onPress={() => handleLocationPress(location.address)}
                activeOpacity={0.9}
              >
                <View style={styles.recentIconContainer}>
                  <Ionicons name="time" size={20} color={colors.onSurfaceVariant} />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentName}>{location.name}</Text>
                  <Text style={styles.recentAddress}>{location.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#e2e2e2' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a2a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3b67ff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#131313' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
  },
  topBarButton: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surface + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '40',
  },
  markerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  markerStem: {
    width: 4,
    height: 32,
    backgroundColor: colors.primary,
    opacity: 0.5,
    marginTop: -4,
  },
  markerShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    opacity: 0.6,
    marginTop: -2,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLow + 'F2',
    borderTopLeftRadius: spacing.borderRadius.xxl,
    borderTopRightRadius: spacing.borderRadius.xxl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -32 },
    shadowOpacity: 0.6,
    shadowRadius: 64,
    elevation: 16,
    maxHeight: '55%',
  },
  bottomSheetHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHighest,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchCard: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceContainer + 'E6',
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 48,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchTitle: {
    fontFamily: typography.fontFamily.headline,
    fontSize: typography.fontSize.titleMedium,
    fontWeight: '600' as any,
    color: colors.onSurface,
  },
  searchSubtitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  scheduleButton: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  currentLocationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  currentLocationTitle: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  currentLocationAddress: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.label,
    fontSize: typography.fontSize.labelMedium,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  suggestedGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  suggestedCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.md,
  },
  suggestedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  suggestedName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  suggestedDistance: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentName: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
    color: colors.onSurface,
  },
  recentAddress: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
