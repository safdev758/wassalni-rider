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
  priceDzd: number;
  originalPriceDzd?: number;
  selected: boolean;
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
  name: 'Karim',
  rating: 4.9,
  vehicle: 'Renault Symbol • White',
  plate: '00123-119-16',
  photoUrl: '',
};

const MOCK_OPTIONS: RideOption[] = [
  { id: 'go', name: 'Wasselni Go', seats: 4, eta: '4 min', priceDzd: 650, originalPriceDzd: 800, selected: false },
  { id: 'plus', name: 'Wasselni Plus', seats: 4, eta: '2 min', priceDzd: 950, selected: true },
  { id: 'xl', name: 'Wasselni XL', seats: 6, eta: '7 min', priceDzd: 1400, selected: false },
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
        priceDzd: selectedOption.priceDzd,
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
