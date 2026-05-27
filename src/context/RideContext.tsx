import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { rideAPI, walletAPI, safetyAPI, addWSHandler, removeWSHandler, type WSMessage } from '../services/api';
import { navigateRideScreen } from '../navigation/navigationRef';
import { wsEventData } from '../utils/wsPayload';
import {
  startRideAudioSafety,
  stopRideAudioSafety,
  setHarassmentPromptHandler,
  type HarassmentPrompt,
} from '../services/rideAudioSafety';
import { startRideGpsTrace, stopRideGpsTrace } from '../services/rideGpsTrace';
import { getVehicleDisplayName, getVehicleDescription } from '../utils/vehicleTiers';
import {
  WS_DRIVER_ASSIGNED, WS_OFFER_ACCEPTED, WS_RIDE_CANCELLED,
  WS_RIDE_COMPLETED, WS_LOCATION_UPDATE, WS_PRICE_COUNTER,
  WS_SAFETY_ALERT, WS_ROUTE_CHANGE, WS_HARASSMENT,
} from '../services/wsEvents';

export type PaymentMethod = 'cash' | 'wallet';

export type SafetyAlert = {
  type: typeof WS_SAFETY_ALERT | typeof WS_ROUTE_CHANGE | typeof WS_HARASSMENT | 'REPORT_BUTTON';
  severity: 'low' | 'medium' | 'high';
  detail: string;
  confidence?: number;
  timestamp: string;
};

export type RideState = 'idle' | 'searching' | 'driver_found' | 'ride_options' | 'tracking' | 'rating';

export type Driver = {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  photoUrl: string;
};

export type RideOption = {
  id: string;
  name: string;
  description: string;
  seats: number;
  eta: string;
  priceDzd: number;
  originalPriceDzd?: number;
  selected: boolean;
};

export type CounterOffer = {
  offerId: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  offeredPrice: number;
};

export type CompletedRide = {
  id: string;
  driver: Driver;
  pickup: string;
  dropoff: string;
  priceDzd: number;
  option: string;
  date: string;
  status: 'completed' | 'cancelled';
};

type PickupDropoff = {
  address: string;
  latitude: number;
  longitude: number;
};

type RideContextType = {
  state: RideState;
  pickup: string;
  dropoff: string;
  pickupCoords: PickupDropoff | null;
  dropoffCoords: PickupDropoff | null;
  driver: Driver | null;
  options: RideOption[];
  selectedOption: RideOption | null;
  completedRide: CompletedRide | null;
  rideId: string | null;
  riderPrice: number;
  paymentMethod: PaymentMethod;
  womenOnly: boolean;
  setWomenOnly: (value: boolean) => void;
  walletBalanceDzd: number | null;
  counterOffers: CounterOffer[];
  safetyAlert: SafetyAlert | null;
  driverCoords: { latitude: number; longitude: number } | null;
  routePolyline: string | null;
  tripDistanceKm: number | null;
  tripDurationMin: number | null;
  eta: string | null;
  progressPct: number;
  setPickupLocation: (loc: PickupDropoff) => void;
  setDropoffLocation: (loc: PickupDropoff) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  refreshWalletBalance: () => Promise<void>;
  fetchEstimate: () => Promise<void>;
  startSearch: (pickup: string, dropoff: string) => void;
  selectOption: (option: RideOption) => void;
  confirmRide: () => Promise<void>;
  cancelRide: () => Promise<void>;
  submitRating: (stars: number, tip: number, compliments: string[]) => void;
  resetRide: () => void;
  updateRiderPrice: (price: number) => void;
  acceptCounterOffer: (offer: CounterOffer) => Promise<void>;
  clearSafetyAlert: () => void;
};

const RideContext = createContext<RideContextType>({
  state: 'idle',
  pickup: '',
  dropoff: '',
  pickupCoords: null,
  dropoffCoords: null,
  driver: null,
  options: [],
  selectedOption: null,
  completedRide: null,
  rideId: null,
  riderPrice: 0,
  paymentMethod: 'cash',
  womenOnly: false,
  setWomenOnly: () => {},
  walletBalanceDzd: null,
  counterOffers: [],
  safetyAlert: null,
  driverCoords: null,
  routePolyline: null,
  tripDistanceKm: null,
  tripDurationMin: null,
  eta: null,
  progressPct: 0,
  setPickupLocation: () => {},
  setDropoffLocation: () => {},
  setPaymentMethod: () => {},
  refreshWalletBalance: async () => {},
  fetchEstimate: async () => {},
  startSearch: () => {},
  selectOption: () => {},
  confirmRide: async () => {},
  cancelRide: async () => {},
  submitRating: () => {},
  resetRide: () => {},
  updateRiderPrice: () => {},
  acceptCounterOffer: async () => {},
  clearSafetyAlert: () => {},
});

export const RideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<RideState>('idle');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<PickupDropoff | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<PickupDropoff | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [options, setOptions] = useState<RideOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [completedRide, setCompletedRide] = useState<CompletedRide | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const [riderPrice, setRiderPrice] = useState(0);
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod>('cash');
  const [womenOnly, setWomenOnly] = useState(false);
  const [walletBalanceDzd, setWalletBalanceDzd] = useState<number | null>(null);
  const [counterOffers, setCounterOffers] = useState<CounterOffer[]>([]);
  const [safetyAlert, setSafetyAlert] = useState<SafetyAlert | null>(null);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);
  const [tripDistanceKm, setTripDistanceKm] = useState<number | null>(null);
  const [tripDurationMin, setTripDurationMin] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const driverRef = useRef(driver);
  const selectedRef = useRef(selectedOption);
  const rideIdRef = useRef(rideId);
  const pickupRef = useRef(pickup);
  const dropoffRef = useRef(dropoff);

  useEffect(() => { driverRef.current = driver; }, [driver]);
  useEffect(() => { selectedRef.current = selectedOption; }, [selectedOption]);
  useEffect(() => { rideIdRef.current = rideId; }, [rideId]);
  useEffect(() => { pickupRef.current = pickup; }, [pickup]);
  useEffect(() => { dropoffRef.current = dropoff; }, [dropoff]);

  const refreshWalletBalance = useCallback(async () => {
    try {
      const res = await walletAPI.getBalance();
      setWalletBalanceDzd(res.balance_dzd ?? 0);
    } catch {
      setWalletBalanceDzd(null);
    }
  }, []);

  const handleWSMessage = useCallback((msg: WSMessage) => {
    const payload = wsEventData(msg);

    switch (msg.type) {
      case WS_DRIVER_ASSIGNED: {
        const driverData = payload.driver as Record<string, unknown>;
        setDriver({
          id: driverData.id as string,
          name: driverData.name as string,
          rating: driverData.rating as number,
          vehicle: driverData.vehicle as string,
          plate: driverData.plate as string,
          photoUrl: '',
        });
        setState('driver_found');
        navigateRideScreen('DriverFound');
        if (rideIdRef.current) {
          startRideAudioSafety(rideIdRef.current);
        }
        break;
      }
      case WS_PRICE_COUNTER: {
        const offer: CounterOffer = {
          offerId: payload.offer_id as string,
          driverId: payload.driver_id as string,
          driverName: payload.driver_name as string,
          driverRating: payload.driver_rating as number,
          offeredPrice: payload.offered_price as number,
        };
        setCounterOffers(prev => [...prev, offer]);
        break;
      }
      case WS_RIDE_COMPLETED: {
        stopRideAudioSafety();
        stopRideGpsTrace();
        const d = driverRef.current;
        const opt = selectedRef.current;
        if (d && opt) {
          setCompletedRide({
            id: rideIdRef.current || '',
            driver: d,
            pickup: pickupRef.current,
            dropoff: dropoffRef.current,
            priceDzd: (payload.amount_dzd as number) || opt.priceDzd,
            option: opt.name,
            date: new Date().toLocaleDateString(),
            status: 'completed',
          });
        }
        const paid = payload.paid as boolean;
        const method = payload.payment_method as string;
        if (paid && method === 'wallet') {
          Alert.alert(t('ride.paymentConfirmed'), t('ride.paymentConfirmedWallet'));
        }
        setState('rating');
        navigateRideScreen('RateTrip');
        refreshWalletBalance();
        break;
      }
      case WS_RIDE_CANCELLED:
        stopRideAudioSafety();
        stopRideGpsTrace();
        setState('idle');
        setDriver(null);
        setRideId(null);
        setCounterOffers([]);
        break;
      case WS_OFFER_ACCEPTED:
        setState('driver_found');
        navigateRideScreen('DriverFound');
        break;
      case WS_LOCATION_UPDATE: {
        const etaMins = payload.eta_minutes as number | undefined;
        if (etaMins != null) setEta(`${etaMins} min`);
        const pct = payload.progress_pct as number | undefined;
        if (pct != null) setProgressPct(Math.min(100, Math.max(0, pct)));
        const lat = payload.lat as number | undefined;
        const lng = payload.lng as number | undefined;
        if (lat != null && lng != null) {
          setDriverCoords({ latitude: lat, longitude: lng });
          setState(prev => (prev === 'driver_found' ? 'tracking' : prev));
          if (driverRef.current) {
            navigateRideScreen('RideTracking');
          }
        }
        break;
      }
      case WS_SAFETY_ALERT:
      case WS_ROUTE_CHANGE:
      case WS_HARASSMENT: {
        const detail =
          (payload.detail as string) ||
          (payload.anomaly_type as string) ||
          (msg.type === WS_HARASSMENT ? t('ride.safetyHarassmentDetail') : t('ride.routeDeviation'));
        setSafetyAlert({
          type: msg.type as SafetyAlert['type'],
          severity: (payload.severity as SafetyAlert['severity']) ?? 'high',
          detail,
          confidence: payload.confidence as number | undefined,
          timestamp: (payload.timestamp as string) || new Date().toISOString(),
        });
        if (msg.type === WS_ROUTE_CHANGE) {
          setState(prev => (prev === 'driver_found' ? 'tracking' : prev));
          navigateRideScreen('RideTracking');
        }
        break;
      }
    }
  }, [t, refreshWalletBalance]);

  useEffect(() => {
    addWSHandler(handleWSMessage);
    return () => removeWSHandler(handleWSMessage);
  }, [handleWSMessage]);

  const mlLabelToCategory = (label: string) => {
    if (label === 'aggressive') return 'verbal_abuse';
    if (label === 'sexual_harassment' || label === 'distress') return 'harassment';
    return 'harassment';
  };

  useEffect(() => {
    if (!rideId || (state !== 'driver_found' && state !== 'tracking')) {
      setHarassmentPromptHandler(null);
      return;
    }
    startRideGpsTrace();
    setHarassmentPromptHandler((p: HarassmentPrompt) => {
      if (!p.pendingEvidenceId) return;
      Alert.alert(
        t('ride.safetyHarassmentPromptTitle'),
        t('ride.safetyHarassmentPromptBody'),
        [
          {
            text: t('ride.safetyImOk'),
            style: 'cancel',
            onPress: () => {
              void safetyAPI.dismissAudioPending(p.rideId, p.pendingEvidenceId);
            },
          },
          {
            text: t('ride.safetyReportNow'),
            onPress: () => {
              navigateRideScreen('Report', {
                pendingEvidenceId: p.pendingEvidenceId,
                reasonCode: mlLabelToCategory(p.label),
              });
            },
          },
        ],
      );
    });
    return () => {
      setHarassmentPromptHandler(null);
      stopRideGpsTrace();
    };
  }, [rideId, state, t]);

  const setPickupLocation = (loc: PickupDropoff) => {
    setPickupCoords(loc);
    setPickup(loc.address);
  };

  const setDropoffLocation = (loc: PickupDropoff) => {
    setDropoffCoords(loc);
    setDropoff(loc.address);
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodState(method);
    if (method === 'wallet') {
      refreshWalletBalance();
    }
  };

  const fetchEstimate = async () => {
    if (!pickupCoords || !dropoffCoords) return;

    try {
      const result = await rideAPI.estimate(
        { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, address: pickupCoords.address },
        { latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude, address: dropoffCoords.address },
      );

      const dist = Number(result.distance_km);
      const dur = Number(result.duration_minutes);
      setTripDistanceKm(Number.isFinite(dist) ? dist : null);
      setTripDurationMin(Number.isFinite(dur) ? dur : null);

      const rideOptions: RideOption[] = (result.options as Record<string, unknown>[]).map((opt, idx) => {
        const id = String(opt.id ?? '');
        const etaMin = Number(opt.eta_minutes);
        const price = Number(opt.price);
        const original = opt.original_price != null ? Number(opt.original_price) : undefined;
        return {
          id,
          name: getVehicleDisplayName(id, opt.name as string | undefined),
          description: getVehicleDescription(id, opt.description as string | undefined),
          seats: Number(opt.seats) || 4,
          eta: Number.isFinite(etaMin) ? `${etaMin} min` : '—',
          priceDzd: Number.isFinite(price) ? price : 0,
          originalPriceDzd:
            original != null && Number.isFinite(original) && original > price ? original : undefined,
          selected: idx === 0,
        };
      });

      const route = result.route as { polyline?: string } | undefined;
      setRoutePolyline(route?.polyline || null);

      const pickupResolved = result.pickup as { address?: string } | undefined;
      const dropoffResolved = result.dropoff as { address?: string } | undefined;
      if (pickupResolved?.address) {
        setPickup(pickupResolved.address);
        setPickupCoords((prev) => (prev ? { ...prev, address: pickupResolved.address! } : prev));
      }
      if (dropoffResolved?.address) {
        setDropoff(dropoffResolved.address);
        setDropoffCoords((prev) => (prev ? { ...prev, address: dropoffResolved.address! } : prev));
      }

      setOptions(rideOptions);
      setSelectedOption(rideOptions[0] || null);
      if (rideOptions[0]) {
        setRiderPrice(rideOptions[0].priceDzd);
      }
      setState('ride_options');
      navigateRideScreen('RideOptions');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.error');
      Alert.alert(t('common.error'), message);
      setState('idle');
      setOptions([]);
      navigateRideScreen('Main');
    }
  };

  useEffect(() => {
    if (state === 'searching' && pickupCoords && dropoffCoords && options.length === 0) {
      fetchEstimate();
    }
  }, [state, pickupCoords, dropoffCoords, options.length]);

  const startSearch = (p: string, d: string) => {
    setPickup(p);
    setDropoff(d);
    setRideId(null);
    setOptions([]);
    setCounterOffers([]);
    setState('searching');
    navigateRideScreen('Searching');
  };

  const selectOption = (option: RideOption) => {
    setSelectedOption(option);
    setRiderPrice(option.priceDzd);
    setOptions(prev => prev.map(o => ({ ...o, selected: o.id === option.id })));
  };

  const confirmRide = async () => {
    if (!selectedOption || !pickupCoords || !dropoffCoords) return;

    if (paymentMethod === 'wallet') {
      await refreshWalletBalance();
      if (walletBalanceDzd != null && walletBalanceDzd < selectedOption.priceDzd) {
        Alert.alert(t('common.error'), t('ride.insufficientWallet'));
        return;
      }
    }

    try {
      const result = await rideAPI.create({
        pickup_address: pickupCoords.address,
        pickup_lat: pickupCoords.latitude,
        pickup_lng: pickupCoords.longitude,
        dropoff_address: dropoffCoords.address,
        dropoff_lat: dropoffCoords.latitude,
        dropoff_lng: dropoffCoords.longitude,
        vehicle_type: selectedOption.id,
        rider_price: selectedOption.priceDzd,
        payment_method: paymentMethod,
        women_only: womenOnly,
      });

      setRideId(result.ride_id);
      setState('searching');
      navigateRideScreen('Searching');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('ride.bookingFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  const cancelRide = async () => {
    if (rideId) {
      try {
        await rideAPI.cancel(rideId);
      } catch (error) {
        console.error('Cancel ride failed:', error);
      }
    }
    setState('idle');
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
    setRideId(null);
    setCounterOffers([]);
    navigateRideScreen('Main');
  };

  const submitRating = async (stars: number, tip: number, compliments: string[]) => {
    if (rideId) {
      try {
        await rideAPI.rate(rideId, { rating: stars, tip_amount: tip, compliments });
      } catch (error) {
        console.error('Rate ride failed:', error);
      }
    }
    setState('idle');
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
    setCompletedRide(null);
    setRideId(null);
    setCounterOffers([]);
    stopRideAudioSafety();
    stopRideGpsTrace();
    navigateRideScreen('Main');
  };

  const resetRide = () => {
    stopRideAudioSafety();
    stopRideGpsTrace();
    setState('idle');
    setPickup('');
    setDropoff('');
    setPickupCoords(null);
    setDropoffCoords(null);
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
    setCompletedRide(null);
    setRideId(null);
    setRiderPrice(0);
    setCounterOffers([]);
    setRoutePolyline(null);
    setTripDistanceKm(null);
    setTripDurationMin(null);
  };

  const updateRiderPrice = async (price: number) => {
    setRiderPrice(price);
    if (rideId) {
      try {
        await rideAPI.updatePrice(rideId, price);
      } catch (error) {
        console.error('Update price failed:', error);
      }
    }
  };

  const clearSafetyAlert = () => setSafetyAlert(null);

  const acceptCounterOffer = async (offer: CounterOffer) => {
    if (rideId) {
      try {
        await rideAPI.acceptCounterOffer(rideId, offer.offerId);
        setRiderPrice(offer.offeredPrice);
        setDriver({
          id: offer.driverId,
          name: offer.driverName,
          rating: offer.driverRating,
          vehicle: '',
          plate: '',
          photoUrl: '',
        });
        setState('driver_found');
        navigateRideScreen('DriverFound');
        if (rideId) {
          startRideAudioSafety(rideId);
        }
      } catch (error) {
        Alert.alert(t('common.error'), error instanceof Error ? error.message : t('common.error'));
      }
    }
  };

  return (
    <RideContext.Provider value={{
      state, pickup, dropoff, pickupCoords, dropoffCoords, driver, options, selectedOption,
      completedRide, rideId, riderPrice, paymentMethod, womenOnly, setWomenOnly, walletBalanceDzd, counterOffers, safetyAlert,
      driverCoords, routePolyline, tripDistanceKm, tripDurationMin, eta, progressPct,
      setPickupLocation, setDropoffLocation, setPaymentMethod, refreshWalletBalance,
      fetchEstimate, startSearch, selectOption, confirmRide, cancelRide, submitRating, resetRide,
      updateRiderPrice, acceptCounterOffer, clearSafetyAlert,
    }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
