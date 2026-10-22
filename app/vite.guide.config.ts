import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build only the additive guide. Joseph's app.html/assets remain unchanged.
export default defineConfig({
  plugins: [react()],
  publicDir: false, // The guide does not use the original app's public images.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: '../guidance-assets', emptyOutDir: true,
    lib: { entry: 'src/guidance/Guide.tsx', formats: ['es'], fileName: () => 'guide.js', cssFileName: 'guide' },
  },
});
