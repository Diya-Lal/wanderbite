export interface Activity {
  id: number;
  name: string;
  type: string;
  address: string;
  lat: number;
  lon: number;
  wikimediaUrl?: string;
}

export interface ActivityAppProps {
  city: string;
  lat: number;
  lon: number;
  standalone?: boolean;
}

export interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}
