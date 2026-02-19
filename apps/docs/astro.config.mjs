import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Minions OpenClaw',
      social: { github: 'https://github.com/minions-openclaw/minions-openclaw' },
      sidebar: [
        { label: 'Getting Started', link: '/getting-started' },
        { label: 'Concepts', autogenerate: { directory: 'concepts' } },
        { label: 'Guides', autogenerate: { directory: 'guides' } },
        { label: 'API Reference', autogenerate: { directory: 'api' } },
        { label: 'CLI', autogenerate: { directory: 'cli' } },
      ],
    }),
  ],
});
