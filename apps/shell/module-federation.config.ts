import { ModuleFederationConfig } from '@nx/module-federation';

const isProduction = process.env['NODE_ENV'] === 'production';

const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: [
    ['homepage',     isProduction ? 'https://wanderbite-homepage.netlify.app'     : 'http://localhost:4201'],
    ['destinations', isProduction ? 'https://wanderbite-destinations.netlify.app' : 'http://localhost:4202'],
    ['food',         isProduction ? 'https://wanderbite-food.vercel.app'           : 'http://localhost:4203'],
  ],
};

export default config;
