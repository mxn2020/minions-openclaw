import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { InstanceManager } from '@minions-openclaw/core';

export const pingCommand = new Command('ping')
  .description('Ping an OpenClaw Gateway instance')
  .argument('<instanceId>', 'Instance ID')
  .action(async (instanceId: string) => {
    const spinner = ora(`Pinging ${instanceId}...`).start();
    try {
      const manager = new InstanceManager();
      const latency = await manager.ping(instanceId);
      spinner.succeed(chalk.green(`Pong! Latency: ${latency}ms`));
    } catch (err) {
      spinner.fail(chalk.red(`Ping failed: ${String(err)}`));
      process.exit(1);
    }
  });
