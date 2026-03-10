import { ModuleFederationConfig } from '@nx/module-federation';
import { resolve } from 'path';

const config: ModuleFederationConfig = {
  name: 'destinations',
  exposes: {
    './Routes': resolve(__dirname, 'src/app/remote-entry/entry.routes.ts'),
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
