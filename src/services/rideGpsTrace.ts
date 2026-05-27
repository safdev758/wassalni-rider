/** Last ~10 GPS points for in-ride safety reports (rider). */
type GpsPoint = { lat: number; lng: number; recorded_at: string };

const trace: GpsPoint[] = [];
let watchSub: { remove: () => void } | null = null;

export function appendGpsPoint(lat: number, lng: number) {
  trace.push({ lat, lng, recorded_at: new Date().toISOString() });
  if (trace.length > 10) trace.shift();
}

export function getGpsTrace(): GpsPoint[] {
  return [...trace];
}

export async function startRideGpsTrace() {
  if (watchSub) return;
  try {
    const Location = await import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    watchSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
      (pos) => appendGpsPoint(pos.coords.latitude, pos.coords.longitude),
    );
  } catch {
    // expo-location unavailable
  }
}

export function stopRideGpsTrace() {
  watchSub?.remove();
  watchSub = null;
  trace.length = 0;
}
