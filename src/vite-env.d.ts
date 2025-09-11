/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
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
