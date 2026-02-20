import { Command } from 'commander';
import chalk from 'chalk';
import { InstanceManager } from '@minions-openclaw/sdk';

export const listCommand = new Command('list')
  .description('List all registered OpenClaw instances')
  .action(async () => {
    const manager = new InstanceManager();
    const instances = await manager.list();
    if (instances.length === 0) {
      console.log(chalk.yellow('No instances registered. Use `register` to add one.'));
      return;
    }
    console.log(chalk.bold('Registered Instances:'));
    for (const inst of instances) {
      const status = (inst.fields['status'] as string) ?? 'unknown';
      const statusColor = status === 'online' ? chalk.green : chalk.yellow;
      console.log(`  ${chalk.cyan(inst.id)}  ${chalk.bold(inst.title)}  ${statusColor(status)}  ${chalk.gray(inst.fields['url'] as string)}`);
    }
  });
