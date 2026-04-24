import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  price: string;
  originalPrice?: string;
  selected: boolean;
};

export type CompletedRide = {
  id: string;
  driver: Driver;
  pickup: string;
  dropoff: string;
  price: string;
  option: string;
  date: string;
  status: 'completed' | 'cancelled';
};

type RideContextType = {
  state: RideState;
  pickup: string;
  dropoff: string;
  driver: Driver | null;
  options: RideOption[];
  selectedOption: RideOption | null;
  completedRide: CompletedRide | null;
  startSearch: (pickup: string, dropoff: string) => void;
  selectOption: (option: RideOption) => void;
  confirmRide: () => void;
  cancelRide: () => void;
  completeRide: () => void;
  submitRating: (stars: number, tip: number, compliments: string[]) => void;
  resetRide: () => void;
};

const MOCK_DRIVER: Driver = {
  id: 'drv_001',
  name: 'Alex',
  rating: 4.9,
  vehicle: 'Tesla Model 3 • Black',
  plate: 'XYZ 123',
  photoUrl: '',
};

const MOCK_OPTIONS: RideOption[] = [
  { id: 'go', name: 'Wessalni Go', seats: 4, eta: '4 min', price: '$45.00', originalPrice: '$52.00', selected: false },
  { id: 'plus', name: 'Wessalni Plus', seats: 4, eta: '2 min', price: '$72.00', selected: true },
  { id: 'xl', name: 'Wessalni XL', seats: 6, eta: '7 min', price: '$95.00', selected: false },
];

const RideContext = createContext<RideContextType>({
  state: 'idle',
  pickup: '',
  dropoff: '',
  driver: null,
  options: [],
  selectedOption: null,
  completedRide: null,
  startSearch: () => {},
  selectOption: () => {},
  confirmRide: () => {},
  cancelRide: () => {},
  completeRide: () => {},
  submitRating: () => {},
  resetRide: () => {},
});

export const RideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<RideState>('idle');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [options, setOptions] = useState<RideOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [completedRide, setCompletedRide] = useState<CompletedRide | null>(null);

  const startSearch = (p: string, d: string) => {
    setPickup(p);
    setDropoff(d);
    setState('searching');
    // Simulate driver found after 3 seconds
    setTimeout(() => {
      setDriver(MOCK_DRIVER);
      setOptions(MOCK_OPTIONS);
      setSelectedOption(MOCK_OPTIONS.find(o => o.selected) || MOCK_OPTIONS[0]);
      setState('ride_options');
    }, 3000);
  };

  const selectOption = (option: RideOption) => {
    setSelectedOption(option);
    setOptions(prev => prev.map(o => ({ ...o, selected: o.id === option.id })));
  };

  const confirmRide = () => {
    setState('driver_found');
    // Simulate driver arriving after 2 seconds
    setTimeout(() => {
      setState('tracking');
    }, 2000);
  };

  const cancelRide = () => {
    setState('idle');
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
  };

  const completeRide = () => {
    if (driver && selectedOption) {
      setCompletedRide({
        id: 'ride_001',
        driver,
        pickup,
        dropoff,
        price: selectedOption.price,
        option: selectedOption.name,
        date: new Date().toLocaleDateString(),
        status: 'completed',
      });
    }
    setState('rating');
  };

  const submitRating = (_stars: number, _tip: number, _compliments: string[]) => {
    // In production: POST /api/rides/:id/rate
    setState('idle');
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
    setCompletedRide(null);
  };

  const resetRide = () => {
    setState('idle');
    setPickup('');
    setDropoff('');
    setDriver(null);
    setOptions([]);
    setSelectedOption(null);
    setCompletedRide(null);
  };

  return (
    <RideContext.Provider value={{
      state, pickup, dropoff, driver, options, selectedOption, completedRide,
      startSearch, selectOption, confirmRide, cancelRide, completeRide, submitRating, resetRide,
    }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
