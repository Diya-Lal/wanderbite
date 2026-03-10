import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      webServerCommands: {
        default: 'nx run shell:serve',
        production: 'nx run shell:serve:production',
      },
      ciWebServerCommand: 'nx run shell:serve-static',
    }),
  },
});
