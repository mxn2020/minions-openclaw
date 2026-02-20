import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Minions OpenClaw',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/mxn2020/minions-openclaw' }],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Quick Start', link: '/getting-started/quick-start/' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Instances', link: '/concepts/instances/' },
            { label: 'Snapshots', link: '/concepts/snapshots/' },
            { label: 'Config Decomposition', link: '/concepts/config-decomposition/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Managing Instances', link: '/guides/managing-instances/' },
            { label: 'Snapshot Workflow', link: '/guides/snapshot-workflow/' },
            { label: 'Config Management', link: '/guides/config-management/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'TypeScript', link: '/api/typescript/' },
            { label: 'Python', link: '/api/python/' },
          ],
        },
        {
          label: 'CLI Reference',
          link: '/cli/',
        },
      ],
    }),
  ],
});
