const path = require('path');
const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');

module.exports = defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, 'frontend'),
  publicDir: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'frontend', 'public', 'assets'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        exercise: path.resolve(__dirname, 'frontend', 'src', 'pages', 'exercise.js'),
      },
    },
  },
});
