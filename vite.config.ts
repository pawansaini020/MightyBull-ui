import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// const SERVICE_NAME = "mightybull-ui";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  return {
    server: {
      allowedHosts: [
        'c6c1-2409-40f2-1045-5c52-d133-f640-54e3-2f34.ngrok-free.app'
      ]
    },
    plugins: [
      react()
    ],
    envDir: './environments',
    build: {
      outDir: './dist/mightybull-ui',
      chunkSizeWarningLimit: 600,
      sourcemap: true, // Ensure sourcemaps are generated
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
