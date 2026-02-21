import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const isProd = process.env.BRANCH === 'main';
const isDev = process.env.BRANCH === 'dev';
const siteUrl = isProd ? 'https://openclaw.minions.help' : (isDev ? 'https://openclaw.minions.help' : 'http://localhost:4321');

export default defineConfig({
  site: siteUrl,
  integrations: [
    starlight({
      title: 'Minions OpenClaw',
      description: 'Manage, monitor, and version-control your OpenClaw Gateway instances.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        de: { label: 'Deutsch', lang: 'de' },
        es: { label: 'Español', lang: 'es' },
        it: { label: 'Italiano', lang: 'it' },
        fr: { label: 'Français', lang: 'fr' },
      },
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: '/og-image.png' } },
      ],
      components: {
        Head: './src/components/CopyMarkdownButton.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/mxn2020/minions-openclaw' },
        { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/mnx/' },
        { icon: 'external', label: 'App', href: 'https://openclaw.minions.wtf' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/getting-started/introduction/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Quick Start', link: '/getting-started/quick-start/' },
            { label: 'Contributing', link: '/guides/contributing/' },
          ],
        },
        {
          label: 'Tutorial',
          items: [
            { label: 'Gateway Setup', link: '/tutorial/gateway-setup/' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Instances', link: '/concepts/instances/' },
            { label: 'Snapshots', link: '/concepts/snapshots/' },
            { label: 'Config Decomposition', link: '/concepts/config-decomposition/' },
            { label: 'Security Model', link: '/concepts/security-model/' },
            { label: 'Data Storage', link: '/concepts/data-storage/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Managing Instances', link: '/guides/managing-instances/' },
            { label: 'Snapshot Workflow', link: '/guides/snapshot-workflow/' },
            { label: 'Config Management', link: '/guides/config-management/' },
            { label: 'Authentication', link: '/guides/authentication/' },
            { label: 'Multiple Instances', link: '/guides/multi-instance/' },
            { label: 'Snapshot Diffing', link: '/guides/snapshot-diffing/' },
            { label: 'Backup & Restore', link: '/guides/backup-restore/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'API Reference', link: '/reference/api-reference/' },
            { label: 'Minion Types', link: '/reference/minion-types/' },
            { label: 'Connection Protocol', link: '/reference/connection-protocol/' },
            { label: 'Config Schema', link: '/reference/config-schema/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'TypeScript', link: '/api/typescript/' },
            { label: 'Python', link: '/api/python/' },
          ],
        },
      ],
    }),
  ],
});
