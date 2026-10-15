import { defineConfig } from 'vite';
import { offline } from './offline/vite-offline';

export default defineConfig({
  plugins: [offline('mcl-biblia-quiz')],
});
