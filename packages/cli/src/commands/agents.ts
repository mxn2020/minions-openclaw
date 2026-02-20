import { Command } from 'commander';
import chalk from 'chalk';
import { InstanceManager, GatewayClient } from '@minions-openclaw/sdk';

export const agentsCommand = new Command('agents')
  .description('List agents on an OpenClaw Gateway instance')
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
      const result = await client.call('agents.list') as { items?: unknown[] };
      await client.close();
      const agents = result?.items ?? [];
      if (agents.length === 0) {
        console.log(chalk.yellow('No agents found.'));
        return;
      }
      console.log(chalk.bold('Agents:'));
      for (const agent of agents) {
        console.log('  -', JSON.stringify(agent));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${String(err)}`));
      process.exit(1);
    }
  });
