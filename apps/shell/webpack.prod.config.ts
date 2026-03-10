import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

export default withModuleFederation(
  {
    ...config,
    /*
     * Remote URLs for production.
     * e.g. remotes: [['homepage', 'https://homepage.example.com']]
     */
  },
  { dts: false }
);
