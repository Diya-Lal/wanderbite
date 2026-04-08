export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  address: string;
  rating: number | null;
  stars: number[];
  openingHours: string | null;
  website: string | null;
  phone: string | null;
  imageUrl: string;
  lat: number;
  lon: number;
}

export interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}
