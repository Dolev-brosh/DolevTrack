import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'base: ./' ensures assets are loaded correctly on GitHub Pages (sub-paths)
  base: './', 
});