import { Destination } from '../types/destination.types';

export const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
export const GEOCODING_RESULTS_COUNT = 8;
export const GEOCODING_MIN_QUERY_LENGTH = 2;

export const REGION_ICONS: Record<string, string> = {
  Europe: '🏰',
  Asia: '🌸',
  Americas: '🌎',
  Africa: '🌍',
  Oceania: '🌊',
  'Middle East': '🕌',
};

export const FEATURED_DESTINATIONS: Destination[] = [
  { city: 'Paris',     country: 'France',    region: 'Europe', lat: 48.8566,  lon: 2.3522   },
  { city: 'Tokyo',     country: 'Japan',     region: 'Asia',   lat: 35.6762,  lon: 139.6503 },
  { city: 'Santorini', country: 'Greece',    region: 'Europe', lat: 36.3932,  lon: 25.4615  },
  { city: 'Bali',      country: 'Indonesia', region: 'Asia',   lat: -8.3405,  lon: 115.0920 },
  { city: 'Marrakech', country: 'Morocco',   region: 'Africa', lat: 31.6295,  lon: -7.9811  },
  { city: 'Reykjavik', country: 'Iceland',   region: 'Europe', lat: 64.1265,  lon: -21.8174 },
];
