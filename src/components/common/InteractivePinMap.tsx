import React, { useRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';

import { darkMapStyle } from '../../theme/mapStyle';
import { PrimaryMapMarker } from './PrimaryMapMarker';

type Pin = { latitude: number; longitude: number };

type Props = {
  region: Region;
  pin: Pin;
  onPinChange: (latitude: number, longitude: number) => void;
  onRegionChange?: (region: Region) => void;
  style?: ViewStyle;
};

export const InteractivePinMap: React.FC<Props> = ({
  region,
  pin,
  onPinChange,
  onRegionChange,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  const movePin = (latitude: number, longitude: number) => {
    onPinChange(latitude, longitude);
    mapRef.current?.animateToRegion(
      { ...region, latitude, longitude },
      280,
    );
  };

  return (
    <MapView
      ref={mapRef}
      style={[StyleSheet.absoluteFill, style]}
      provider={PROVIDER_DEFAULT}
      customMapStyle={darkMapStyle}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={onRegionChange}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        movePin(latitude, longitude);
      }}
      showsUserLocation={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      <Marker
        coordinate={pin}
        draggable
        anchor={{ x: 0.5, y: 1 }}
        onDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          movePin(latitude, longitude);
        }}
      >
        <PrimaryMapMarker icon="location" />
      </Marker>
    </MapView>
  );
};
