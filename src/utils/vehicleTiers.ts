import i18n from '../strings';

const NAME_KEYS: Record<string, string> = {
  economy: 'rideOptions.wasselniCore',
  plus: 'rideOptions.wasselniPremium',
  xl: 'rideOptions.wasselniSpace',
};

const DESC_KEYS: Record<string, string> = {
  economy: 'rideOptions.economyDesc',
  plus: 'rideOptions.plusDesc',
  xl: 'rideOptions.xlDesc',
};

export function getVehicleDisplayName(id: string, backendName?: string): string {
  const key = NAME_KEYS[id];
  return key ? i18n.t(key) : backendName || id;
}

export function getVehicleDescription(id: string, backendDescription?: string): string {
  const key = DESC_KEYS[id];
  if (key) return i18n.t(key);
  return backendDescription || '';
}
