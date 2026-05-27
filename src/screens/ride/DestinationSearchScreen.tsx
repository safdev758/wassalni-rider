import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { useRide } from '../../context/RideContext';
import { locationAPI, type LocationSearchResult } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type ActiveField = 'pickup' | 'dropoff';

export const DestinationSearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { setPickupLocation, setDropoffLocation, startSearch } = useRide();

  const [activeField, setActiveField] = useState<ActiveField>('dropoff');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [useCurrentPickup, setUseCurrentPickup] = useState(true);
  const [pickupAddress, setPickupAddress] = useState(t('home.currentLocation'));
  const [pickupCity, setPickupCity] = useState('');
  const [pickupCoords, setPickupCoords] = useState({ latitude: 36.7538, longitude: 3.0588 });
  const [dropoffAddress, setDropoffAddress] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupInputRef = useRef<TextInput>(null);
  const dropoffInputRef = useRef<TextInput>(null);

  useEffect(() => {
    dropoffInputRef.current?.focus();
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ latitude, longitude });
        const res = await locationAPI.reverse(latitude, longitude);
        if (res?.address) {
          setPickupAddress(res.address);
          const city = [res.city || res.locality, res.wilaya || res.region].filter(Boolean).join(', ');
          setPickupCity(city);
        }
      } catch {
        // keep defaults
      }
    })();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (useCurrentPickup && activeField === 'pickup') {
      setResults([]);
      return;
    }
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await locationAPI.search(query);
        setResults(res.results);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeField, useCurrentPickup]);

  const focusField = (field: ActiveField) => {
    setActiveField(field);
    setQuery(field === 'pickup' ? pickupAddress : dropoffAddress);
    setResults([]);
    if (field === 'pickup') {
      if (useCurrentPickup) {
        setUseCurrentPickup(false);
      }
      pickupInputRef.current?.focus();
    } else {
      dropoffInputRef.current?.focus();
    }
  };

  const enableCurrentPickup = async () => {
    setUseCurrentPickup(true);
    setActiveField('dropoff');
    setQuery(dropoffAddress);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ latitude, longitude });
        const res = await locationAPI.reverse(latitude, longitude);
        if (res?.address) {
          setPickupAddress(res.address);
          const city = [res.city || res.locality, res.wilaya || res.region].filter(Boolean).join(', ');
          setPickupCity(city);
        } else {
          setPickupAddress(t('home.currentLocation'));
          setPickupCity('');
        }
      }
    } catch {
      setPickupAddress(t('home.currentLocation'));
    }
    dropoffInputRef.current?.focus();
  };

  const finishRideSetup = (
    pickup: { address: string; latitude: number; longitude: number },
    dropoff: { address: string; latitude: number; longitude: number },
  ) => {
    setPickupLocation(pickup);
    setDropoffLocation(dropoff);
    startSearch(pickup.address, dropoff.address);
    navigation.replace('RideOptions');
  };

  const handleSelect = (place: LocationSearchResult) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const address = place.display_name || place.name || '';

    if (activeField === 'pickup') {
      setUseCurrentPickup(false);
      setPickupAddress(address);
      setPickupCoords({ latitude: lat, longitude: lng });
      setQuery('');
      setResults([]);
      setActiveField('dropoff');
      dropoffInputRef.current?.focus();
      return;
    }

    setDropoffAddress(address);

    const pickup = useCurrentPickup
      ? { address: pickupAddress, latitude: pickupCoords.latitude, longitude: pickupCoords.longitude }
      : { address: pickupAddress, latitude: pickupCoords.latitude, longitude: pickupCoords.longitude };

    finishRideSetup(pickup, { address, latitude: lat, longitude: lng });
  };

  const pickupLabel = useCurrentPickup
    ? (pickupCity ? `${t('home.currentLocation')} · ${pickupCity}` : t('home.currentLocation'))
    : pickupAddress;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('ride.setRoute')}</Text>
        </View>

        <View style={styles.routeCard}>
          <TouchableOpacity
            style={[styles.routeRow, activeField === 'pickup' && styles.routeRowActive]}
            onPress={() => focusField('pickup')}
            activeOpacity={0.85}
          >
            <View style={styles.dotPickup} />
            {useCurrentPickup && activeField !== 'pickup' ? (
              <View style={styles.routeTextBlock}>
                <Text style={styles.routeLabel}>{t('ride.pickup')}</Text>
                <Text style={styles.routeStatic} numberOfLines={2}>{pickupLabel}</Text>
              </View>
            ) : (
              <TextInput
                ref={pickupInputRef}
                style={styles.routeInput}
                placeholder={t('ride.pickupPlaceholder')}
                placeholderTextColor={colors.onSurfaceVariant}
                value={activeField === 'pickup' ? query : pickupAddress}
                onChangeText={(text) => {
                  setUseCurrentPickup(false);
                  setActiveField('pickup');
                  setQuery(text);
                }}
                onFocus={() => focusField('pickup')}
                returnKeyType="search"
                autoCorrect={false}
              />
            )}
            {!useCurrentPickup && (
              <TouchableOpacity
                onPress={enableCurrentPickup}
                accessibilityLabel={t('ride.useCurrentLocation')}
              >
                <Ionicons name="locate" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={styles.routeDivider} />

          <View style={[styles.routeRow, activeField === 'dropoff' && styles.routeRowActive]}>
            <View style={styles.dotDrop} />
            <TextInput
              ref={dropoffInputRef}
              style={styles.routeInput}
              placeholder={t('ride.dropoffPlaceholder')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={activeField === 'dropoff' ? query : dropoffAddress}
              onChangeText={(text) => {
                setActiveField('dropoff');
                setQuery(text);
              }}
              onFocus={() => focusField('dropoff')}
              returnKeyType="search"
              autoCorrect={false}
            />
            {(activeField === 'dropoff' ? query : dropoffAddress).length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  if (activeField === 'dropoff') setQuery('');
                  else setDropoffAddress('');
                }}
              >
                <Ionicons name="close-circle" size={18} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!useCurrentPickup ? (
          <TouchableOpacity style={styles.currentLocationChip} onPress={() => void enableCurrentPickup()}>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.currentLocationChipText}>{t('ride.useCurrentLocation')}</Text>
          </TouchableOpacity>
        ) : null}

        {isSearching ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              query.length > 1 && !isSearching ? (
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>{t('ride.noPlacesFound')}</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const mainName = item.name || item.display_name.split(',')[0];
              const subName = item.display_name.split(',').slice(1).join(',').trim();
              return (
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.85}
                >
                  <View style={styles.resultIcon}>
                    <Ionicons name="location-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.resultText}>
                    <Text style={styles.resultMain} numberOfLines={1}>{mainName}</Text>
                    {subName ? (
                      <Text style={styles.resultSub} numberOfLines={1}>{subName}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.onSurface,
    fontWeight: '600' as any,
    fontSize: typography.fontSize.titleMedium,
    fontFamily: typography.fontFamily.headline,
  },
  routeCard: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
  },
  routeRowActive: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dotDrop: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.onSurface,
  },
  routeTextBlock: {
    flex: 1,
  },
  routeLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    marginBottom: 2,
  },
  routeStatic: {
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
  },
  routeInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    paddingVertical: 0,
  },
  routeDivider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginVertical: spacing.xs,
    marginLeft: 26,
  },
  currentLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
  },
  currentLocationChipText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surfaceContainerHigh,
    marginLeft: 56,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
  },
  resultMain: {
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    fontWeight: '500' as any,
  },
  resultSub: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    marginTop: 2,
  },
});
