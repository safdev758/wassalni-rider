import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  icon?: IconName;
};

/** Drop pin marker used on Home and location-picker maps. */
export const PrimaryMapMarker: React.FC<Props> = ({ icon = 'location' }) => (
  <View style={styles.container}>
    <View style={styles.pulse} />
    <View style={styles.dot}>
      <Ionicons name={icon} size={icon === 'car' ? 12 : 18} color={colors.surface} />
    </View>
    <View style={styles.stem} />
    <View style={styles.shadow} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '40',
  },
  dot: {
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
  stem: {
    width: 4,
    height: 32,
    backgroundColor: colors.primary,
    opacity: 0.5,
    marginTop: -4,
  },
  shadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    opacity: 0.6,
    marginTop: -2,
  },
});
