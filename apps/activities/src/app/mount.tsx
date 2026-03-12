import { createRoot } from 'react-dom/client';
import App from './App';

export function mount(
  el: HTMLElement,
  city: string,
  lat: number,
  lon: number
): () => void {
  const root = createRoot(el);
  root.render(<App city={city} lat={lat} lon={lon} standalone={false} />);
  return () => root.unmount();
}
