import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { MapViewWrapper } from '../../components/common/MapViewWrapper';
import { PrimaryMapMarker } from '../../components/common/PrimaryMapMarker';
import { darkMapStyle } from '../../theme/mapStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { useAuth } from '../../context/AuthContext';
import { locationAPI } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type SavedLocation = { id: string; name: string; address: string; lat: number; lng: number };
type RecentLocation = { id: string; name: string; address: string };

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { setPickupLocation, setDropoffLocation, startSearch } = useRide();
  const { isAuthenticated } = useAuth(); // still needed for saved locations fetch
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 36.7538,
    longitude: 3.0588,
  });
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('errors.locationPermissionDenied'));
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();

  }, []);

  const loadSavedLocations = useCallback(() => {
    if (!isAuthenticated) return;
    locationAPI.getSaved().then((res) => {
      if (res?.locations) setSavedLocations(res.locations);
    }).catch(() => {});
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadSavedLocations();
    }, [loadSavedLocations]),
  );

  const openAddSavedLocation = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('AddSavedLocation');
  };

  const currentAddress = t('home.currentLocation');

  const handleSearchPress = () => {
    navigation.navigate('DestinationSearch');
  };

  const handleLocationPress = (saved: SavedLocation) => {
    setPickupLocation({ address: currentAddress, latitude: location.latitude, longitude: location.longitude });
    setDropoffLocation({ address: saved.address, latitude: saved.lat, longitude: saved.lng });
    startSearch(currentAddress, saved.address);
    navigation.navigate('RideOptions');
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapViewWrapper
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle}
        markerCoordinate={{ latitude: location.latitude, longitude: location.longitude }}
        markerTitle={t('home.currentLocation')}
        markerChildren={<PrimaryMapMarker icon="car" />}
      />

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
                {t('home.currentLocation')}
              </Text>
              <Text style={styles.currentLocationAddress}>
                {t('home.aroundYou')}
              </Text>
            </View>
          </View>

          {/* Suggested Destinations */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.suggested')}</Text>
              {isAuthenticated && (
                <TouchableOpacity onPress={openAddSavedLocation} style={styles.addIconBtn}>
                  <Ionicons name="add-circle" size={26} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            {savedLocations.length === 0 ? (
              <View style={styles.emptyLocations}>
                <Ionicons name="location-outline" size={32} color={colors.onSurfaceVariant} />
                <Text style={styles.emptyLocationsText}>{t('home.noSavedLocations')}</Text>
                <TouchableOpacity
                  style={styles.addLocationButton}
                  onPress={openAddSavedLocation}
                  accessibilityRole="button"
                  accessibilityLabel={t('home.addYourFirst')}
                >
                  <Text style={styles.addLocationText}>{t('home.addYourFirst')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.suggestedGrid}>
                {savedLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc.id}
                    style={styles.suggestedCard}
                    onPress={() => handleLocationPress(loc)}
                    activeOpacity={0.9}
                    accessibilityRole="button"
                    accessibilityLabel={`${loc.name}, ${loc.address}`}
                  >
                    <View style={styles.suggestedIconContainer}>
                      <Ionicons
                        name={loc.name.toLowerCase().includes('home') ? 'home' : 'briefcase'}
                        size={18}
                        color={loc.name.toLowerCase().includes('home') ? colors.primary : colors.onSurface}
                      />
                    </View>
                    <View>
                      <Text style={styles.suggestedName}>{loc.name}</Text>
                      <Text style={styles.suggestedDistance}>{loc.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Recent Places */}
          <View style={styles.sectionContainer}>
            {recentLocations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={styles.recentItem}
                onPress={() => {
                  setPickupLocation({ address: currentAddress, latitude: location.latitude, longitude: location.longitude });
                  startSearch(currentAddress, loc.address);
                  navigation.navigate('Searching');
                }}
                activeOpacity={0.9}
              >
                <View style={styles.recentIconContainer}>
                  <Ionicons name="time" size={20} color={colors.onSurfaceVariant} />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentName}>{loc.name}</Text>
                  <Text style={styles.recentAddress}>{loc.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingRight: spacing.xs,
  },
  addIconBtn: {
    padding: 2,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.label,
    fontSize: typography.fontSize.labelMedium,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
    marginBottom: 0,
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
  emptyLocations: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyLocationsText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  addLocationButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addLocationText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    color: colors.primary,
    fontWeight: '600' as any,
  },
});
