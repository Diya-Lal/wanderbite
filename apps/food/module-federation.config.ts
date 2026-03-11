import { ModuleFederationConfig } from '@nx/module-federation';
import { resolve } from 'path';

const config: ModuleFederationConfig = {
  name: 'food',
  exposes: {
    './Routes': resolve(__dirname, 'src/app/remote-entry/entry.routes.ts'),
  },
};

export default config;
