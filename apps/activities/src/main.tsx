import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles.css';

const params = new URLSearchParams(window.location.search);
const city = params.get('city') ?? '';
const lat = parseFloat(params.get('lat') ?? '0');
const lon = parseFloat(params.get('lon') ?? '0');

const root = createRoot(document.getElementById('root')!);
root.render(<App city={city} lat={lat} lon={lon} standalone />);
