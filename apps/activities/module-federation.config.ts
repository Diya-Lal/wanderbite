import { ModuleFederationConfig } from '@nx/module-federation';
import { resolve } from 'path';

const config: ModuleFederationConfig = {
  name: 'activities',
  exposes: {
    './mount': resolve(__dirname, 'src/app/mount.tsx'),
  },
};

export default config;
