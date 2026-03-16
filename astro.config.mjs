// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  trailingSlash: "ignore",
  base: '/',
  integrations: [react()],
  adapter: netlify(),
  vite: {
    optimizeDeps: {
      include: ['react-dom/client'],
    },
  },
});