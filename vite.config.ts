import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    // allow cloudflared/ngrok tunnel hosts for mobile PWA testing
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app'],
  },
  plugins: [react(), tsconfigPaths(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      id: '/',
      name: 'OpenAgri-UserDashboard',
      short_name: 'OAUserDash',
      description: 'Dashboard for all OpenAgri services',
      theme_color: '#558bc9',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      screenshots: [
        {
          src: 'screenshot-wide.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'OpenAgri UserDashboard',
        },
        {
          src: 'screenshot-mobile.png',
          sizes: '720x1280',
          type: 'image/png',
          label: 'OpenAgri UserDashboard',
        },
      ],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      // also make sure it's not pre-cached
      globIgnores: ['**/env-config.js'],
      navigateFallbackDenylist: [/^\/examples\//],
      // NEVER cache the runtime env file
      runtimeCaching: [
        {
          urlPattern: /\/env-config\.js$/,
          handler: 'NetworkOnly', // or 'NetworkFirst' with low cache
        },
        {
          urlPattern: /^\/examples\//,
          handler: 'NetworkOnly',
        },
      ],

    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  }),
    // {
    //   name: 'inject-env-config',
    //   transformIndexHtml(html, ctx) {
    //     if (ctx.bundle) {
    //       return html.replace(
    //         '</head>',
    //         '  <script src="/env-config.js"></script>\n</head>'
    //       )
    //     }
    //   },
    // }
  ],
})