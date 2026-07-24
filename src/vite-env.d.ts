/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_PRIMARY_COLOR?: string;
    readonly VITE_SECONDARY_COLOR?: string;
    readonly VITE_BACKGROUND_DEFAULT?: string;
    readonly VITE_BACKGROUND_PAPER?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    // This is the custom object we're adding to the window object at runtime
    // It contains the variables we're dynamically injecting.
    env: {
        VITE_API_URL: string;
    }
}

  // declare module 'html2canvas';
  // declare module 'jspdf';
