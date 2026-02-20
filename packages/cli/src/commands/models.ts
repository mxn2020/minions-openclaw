import { Command } from 'commander';
import chalk from 'chalk';
import { InstanceManager, GatewayClient } from '@minions-openclaw/sdk';

export const modelsCommand = new Command('models')
  .description('List model providers on an OpenClaw Gateway instance')
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
      const result = await client.call('models.list') as { items?: unknown[] };
      await client.close();
      const models = result?.items ?? [];
      if (models.length === 0) {
        console.log(chalk.yellow('No models found.'));
        return;
      }
      console.log(chalk.bold('Models:'));
      for (const m of models) {
        console.log('  -', JSON.stringify(m));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${String(err)}`));
      process.exit(1);
    }
  });
