import React from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

// Native-only version — this file is never bundled on web (MapViewWrapper.web.tsx is used instead)

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
  region,
  customMapStyle,
  markerCoordinate,
  markerTitle,
  markerChildren,
  style,
}: MapViewWrapperProps) {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={style}
      initialRegion={region}
      region={region}
      customMapStyle={customMapStyle}
    >
      <Marker coordinate={markerCoordinate} title={markerTitle}>
        {markerChildren}
      </Marker>
    </MapView>
  );
}
