import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/ChatWidget.tsx'),
      name: 'BotMotionWidget',
      fileName: () => 'widget.js',
      formats: ['iife']
    },
    outDir: 'dist-widget',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
