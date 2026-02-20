import { Command } from 'commander';
import chalk from 'chalk';
import { InstanceManager, GatewayClient } from '@minions-openclaw/sdk';

export const channelsCommand = new Command('channels')
  .description('List channels on an OpenClaw Gateway instance')
  .argument('<instanceId>', 'Instance ID')
  .action(async (instanceId: string) => {
    const manager = new InstanceManager();
    const instance = await manager.getById(instanceId);
    if (!instance) {
      console.error(chalk.red(`Instance ${instanceId} not found`));
      process.exit(1);
    }
    try {
      const client = new GatewayClient(
        instance.fields['url'] as string,
        instance.fields['token'] as string | undefined,
        instance.fields['devicePrivateKey'] as string | undefined
      );
      await client.openConnection();
      const result = await client.call('channels.list') as { items?: unknown[] };
      await client.close();
      const channels = result?.items ?? [];
      if (channels.length === 0) {
        console.log(chalk.yellow('No channels found.'));
        return;
      }
      console.log(chalk.bold('Channels:'));
      for (const ch of channels) {
        console.log('  -', JSON.stringify(ch));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${String(err)}`));
      process.exit(1);
    }
  });
