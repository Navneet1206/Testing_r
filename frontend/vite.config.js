import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rides': 'http://localhost:3000',
      '/captains': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
    },
  },
});
