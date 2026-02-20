import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { InstanceManager } from '@minions-openclaw/sdk';

export const registerCommand = new Command('register')
  .description('Register a new OpenClaw Gateway instance')
  .argument('<name>', 'Instance name')
  .option('--url <url>', 'Gateway WebSocket URL')
  .option('--token <token>', 'Auth token (optional)')
  .action(async (name: string, options: { url: string; token?: string }) => {
    if (!options.url) {
      console.error(chalk.red('Error: --url is required'));
      process.exit(1);
    }
    const spinner = ora(`Registering instance "${name}"...`).start();
    try {
      const manager = new InstanceManager();
      const minion = await manager.register(name, options.url, options.token);
      spinner.succeed(chalk.green(`Registered instance: ${minion.id}`));
      console.log(chalk.cyan('  Name:'), name);
      console.log(chalk.cyan('  URL:'), options.url);
      console.log(chalk.cyan('  ID:'), minion.id);
    } catch (err) {
      spinner.fail(chalk.red(`Failed: ${String(err)}`));
      process.exit(1);
    }
  });
