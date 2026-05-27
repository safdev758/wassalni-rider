import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

// Web-only fallback — no react-native-maps import at all

interface MapViewWrapperProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  customMapStyle: any[];
  markerCoordinate: { latitude: number; longitude: number };
  markerTitle?: string;
  markerChildren?: React.ReactNode;
  style?: any;
}

export function MapViewWrapper({
  style,
}: MapViewWrapperProps) {
  return (
    <View style={[styles.webFallback, style]}>
      <View style={styles.webSurgeHigh} />
      <View style={styles.webSurgeMed} />
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: '#1a1c1e',
    overflow: 'hidden',
  },
  webSurgeHigh: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${colors.error}20`,
  },
  webSurgeMed: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: `${colors.primary}15`,
  },
});
