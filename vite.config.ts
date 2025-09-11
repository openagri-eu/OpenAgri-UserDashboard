import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'OpenAgri-UserDashboard',
      short_name: 'OAUserDash',
      description: 'Dashboard for all OpenAgri services',
      theme_color: '#558bc9',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      // also make sure it's not pre-cached
      globIgnores: ['**/env-config.js'],
      // NEVER cache the runtime env file
      runtimeCaching: [
        {
          urlPattern: /\/env-config\.js$/,
          handler: 'NetworkOnly', // or 'NetworkFirst' with low cache
        },
      ],

    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})