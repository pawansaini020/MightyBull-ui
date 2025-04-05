import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// const SERVICE_NAME = "mightybull-ui";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  return {
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
