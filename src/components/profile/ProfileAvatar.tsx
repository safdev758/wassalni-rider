import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { resolveMediaUrl } from '../../utils/mediaUrl';

type Props = {
  uri?: string | null;
  cacheBust?: string | number;
  size?: number;
  style?: ViewStyle;
};

export const ProfileAvatar: React.FC<Props> = ({ uri, cacheBust, size = 72, style }) => {
  const resolved = resolveMediaUrl(uri, cacheBust);
  const radius = size / 2;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
    >
      {resolved ? (
        <Image
          source={{ uri: resolved }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius }]}>
          <Ionicons name="person" size={size * 0.42} color={colors.onSurfaceVariant} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.surfaceContainerHigh,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
});
