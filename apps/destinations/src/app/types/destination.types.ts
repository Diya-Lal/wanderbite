export interface Destination {
  city: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
}

export interface CityResult {
  id: number;
  name: string;
  displayName: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
}

export interface OpenMeteoResult {
  id: number;
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
}

export interface OpenMeteoResponse {
  results?: OpenMeteoResult[];
}
