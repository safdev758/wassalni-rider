import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { rideAPI, addWSHandler, removeWSHandler, type WSMessage } from '../services/api';

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
  counterOffers: CounterOffer[];
  setPickupLocation: (loc: PickupDropoff) => void;
  setDropoffLocation: (loc: PickupDropoff) => void;
  fetchEstimate: () => Promise<void>;
  startSearch: (pickup: string, dropoff: string) => void;
  selectOption: (option: RideOption) => void;
  confirmRide: () => void;
  cancelRide: () => void;
  completeRide: () => void;
  submitRating: (stars: number, tip: number, compliments: string[]) => void;
  resetRide: () => void;
  updateRiderPrice: (price: number) => void;
  acceptCounterOffer: (offer: CounterOffer) => void;
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
  counterOffers: [],
  setPickupLocation: () => {},
  setDropoffLocation: () => {},
  fetchEstimate: async () => {},
  startSearch: () => {},
  selectOption: () => {},
  confirmRide: () => {},
  cancelRide: () => {},
  completeRide: () => {},
  submitRating: () => {},
  resetRide: () => {},
  updateRiderPrice: () => {},
  acceptCounterOffer: () => {},
});

export const RideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const [counterOffers, setCounterOffers] = useState<CounterOffer[]>([]);

  const handleWSMessage = useCallback((msg: WSMessage) => {
    const payload = msg.payload as Record<string, unknown>;

    switch (msg.type) {
      case 'driver_assigned': {
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
        break;
      }
      case 'price_counter': {
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
      case 'ride_completed':
        if (driver && selectedOption) {
          setCompletedRide({
            id: rideId || '',
            driver,
            pickup,
            dropoff,
            priceDzd: selectedOption.priceDzd,
            option: selectedOption.name,
            date: new Date().toLocaleDateString(),
            status: 'completed',
          });
        }
        setState('rating');
        break;
      case 'ride_cancelled':
        setState('idle');
        setDriver(null);
        setRideId(null);
        break;
      case 'offer_accepted':
        setState('driver_found');
        break;
    }
  }, [driver, selectedOption, rideId, pickup, dropoff]);

  useEffect(() => {
    addWSHandler(handleWSMessage);
    return () => removeWSHandler(handleWSMessage);
  }, [handleWSMessage]);

  const setPickupLocation = (loc: PickupDropoff) => {
    setPickupCoords(loc);
    setPickup(loc.address);
  };

  const setDropoffLocation = (loc: PickupDropoff) => {
    setDropoffCoords(loc);
    setDropoff(loc.address);
  };

  const fetchEstimate = async () => {
    if (!pickupCoords || !dropoffCoords) return;

    try {
      const result = await rideAPI.estimate(
        { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude, address: pickupCoords.address },
        { latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude, address: dropoffCoords.address },
      );

      const rideOptions: RideOption[] = result.options.map((opt: Record<string, unknown>, idx: number) => ({
        id: opt.id as string,
        name: opt.name as string,
        seats: opt.seats as number,
        eta: `${opt.eta_minutes} min`,
        priceDzd: opt.price as number,
        originalPriceDzd: opt.original_price as number | undefined,
        selected: idx === 0,
      }));

      setRideId(result.ride_id || null);
      setOptions(rideOptions);
      setSelectedOption(rideOptions[0] || null);
      if (rideOptions[0]) {
        setRiderPrice(rideOptions[0].priceDzd);
      }
      setState('ride_options');
    } catch (error) {
      console.error('Estimate failed:', error);
    }
  };

  useEffect(() => {
    if (state === 'searching' && pickupCoords && dropoffCoords && !rideId) {
      fetchEstimate();
    }
  }, [state, pickupCoords, dropoffCoords]);

  const startSearch = (p: string, d: string) => {
    setPickup(p);
    setDropoff(d);
    setState('searching');
  };

  const selectOption = (option: RideOption) => {
    setSelectedOption(option);
    setRiderPrice(option.priceDzd);
    setOptions(prev => prev.map(o => ({ ...o, selected: o.id === option.id })));
  };

  const confirmRide = async () => {
    if (!selectedOption || !rideId) return;

    try {
      const result = await rideAPI.confirm(rideId, {
        option_id: selectedOption.id,
        payment_method_id: 'cash',
        scheduled_for: null,
      });

      if (result.driver) {
        const d = result.driver;
        setDriver({
          id: d.id,
          name: d.name,
          rating: d.rating,
          vehicle: d.vehicle,
          plate: d.plate,
          photoUrl: d.photo_url || '',
        });
        setState('driver_found');
      } else {
        setState('searching');
      }
    } catch (error) {
      console.error('Create ride failed:', error);
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
  };

  const completeRide = () => {
    if (driver && selectedOption) {
      setCompletedRide({
        id: rideId || '',
        driver,
        pickup,
        dropoff,
        priceDzd: selectedOption.priceDzd,
        option: selectedOption.name,
        date: new Date().toLocaleDateString(),
        status: 'completed',
      });
    }
    setState('rating');
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
  };

  const resetRide = () => {
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

  const acceptCounterOffer = async (offer: CounterOffer) => {
    if (rideId) {
      try {
        await rideAPI.acceptCounterOffer(rideId, offer.offerId);
        setRiderPrice(offer.offeredPrice);
      } catch (error) {
        console.error('Accept counter offer failed:', error);
      }
    }
  };

  return (
    <RideContext.Provider value={{
      state, pickup, dropoff, pickupCoords, dropoffCoords, driver, options, selectedOption,
      completedRide, rideId, riderPrice, counterOffers,
      setPickupLocation, setDropoffLocation, fetchEstimate,
      startSearch, selectOption, confirmRide, cancelRide, completeRide, submitRating, resetRide,
      updateRiderPrice, acceptCounterOffer,
    }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
