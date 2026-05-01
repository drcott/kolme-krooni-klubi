// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { remarkYoutube } from './src/plugins/remark-youtube.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://kolme-krooni-klubi.marko-a00.workers.dev',
  i18n: {
    defaultLocale: 'et',
    locales: ['et', 'sv', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkYoutube],
  },
  integrations: [sitemap()],
});
