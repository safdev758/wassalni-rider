import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  ScrollView,
} from 'react-native';
import { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { RootStackParamList } from '../../navigation/RootNavigator';
import { InteractivePinMap } from '../../components/common/InteractivePinMap';
import { locationAPI, type LocationSearchResult } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_REGION: Region = {
  latitude: 36.7538,
  longitude: 3.0588,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const AddSavedLocationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();

  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pin, setPin] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [saving, setSaving] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setReverseLoading(true);
    try {
      const res = await locationAPI.reverse(lat, lng);
      if (res?.address) setAddress(res.address);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setReverseLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        setPin({ latitude, longitude });
        setRegion((r) => ({ ...r, latitude, longitude }));
        await reverseGeocode(latitude, longitude);
      } catch {
        await reverseGeocode(pin.latitude, pin.longitude);
      }
    })();
  }, [reverseGeocode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
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
  }, [query]);

  const movePin = (latitude: number, longitude: number) => {
    setPin({ latitude, longitude });
    setRegion((r) => ({ ...r, latitude, longitude }));
    if (reverseRef.current) clearTimeout(reverseRef.current);
    reverseRef.current = setTimeout(() => reverseGeocode(latitude, longitude), 400);
  };

  const handleSelectPlace = (place: LocationSearchResult) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setQuery('');
    setResults([]);
    setAddress(place.display_name || place.name || '');
    movePin(lat, lng);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('savedLocation.nameRequired'));
      return;
    }
    if (!address.trim()) {
      Alert.alert(t('common.error'), t('savedLocation.addressRequired'));
      return;
    }
    setSaving(true);
    try {
      await locationAPI.save({
        name: name.trim(),
        address: address.trim(),
        lat: pin.latitude,
        lng: pin.longitude,
      });
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('savedLocation.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const goToMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({});
    movePin(pos.coords.latitude, pos.coords.longitude);
  };

  return (
    <View style={styles.container}>
      <InteractivePinMap
        region={region}
        pin={pin}
        onPinChange={movePin}
        onRegionChange={setRegion}
        style={styles.map}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarButton} onPress={goToMyLocation}>
            <Ionicons name="locate" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.sheetKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />

          <View style={styles.searchCard}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={20} color={colors.onSurfaceVariant} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={t('savedLocation.searchPlaceholder')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={query}
              onChangeText={setQuery}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
          </View>

          {results.length > 0 && (
            <View style={styles.resultsBox}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={styles.resultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.resultRow} onPress={() => handleSelectPlace(item)}>
                    <View style={styles.resultIcon}>
                      <Ionicons name="location-outline" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.resultText} numberOfLines={2}>
                      {item.display_name || item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <Text style={styles.mapHint}>{t('savedLocation.mapHint')}</Text>

            <Text style={styles.label}>{t('savedLocation.labelName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('savedLocation.namePlaceholder')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t('savedLocation.labelAddress')}</Text>
            {reverseLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.addressLoader} />
            ) : (
              <Text style={styles.addressPreview} numberOfLines={3}>{address || '—'}</Text>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveBtnText}>{t('savedLocation.save')}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
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
  sheetKeyboard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLow + 'F2',
    borderTopLeftRadius: spacing.borderRadius.xxl,
    borderTopRightRadius: spacing.borderRadius.xxl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -32 },
    shadowOpacity: 0.6,
    shadowRadius: 64,
    elevation: 16,
    maxHeight: '58%',
    paddingBottom: spacing.lg,
  },
  bottomSheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: colors.onSurfaceVariant + '60',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface + 'E6',
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    gap: spacing.sm,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    paddingVertical: 0,
  },
  resultsBox: {
    maxHeight: 120,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  resultsList: { flexGrow: 0 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
  },
  formContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl,
  },
  mapHint: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.fontFamily.label,
    fontSize: typography.fontSize.labelSmall,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodyMedium,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  addressPreview: {
    color: colors.onSurface,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.bodySmall,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    minHeight: 48,
  },
  addressLoader: { marginVertical: spacing.md },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.onPrimaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.headline,
    fontWeight: '700' as any,
    fontSize: typography.fontSize.bodyLarge,
  },
});
