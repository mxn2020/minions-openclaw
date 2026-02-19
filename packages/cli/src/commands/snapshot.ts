import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { InstanceManager, SnapshotManager, GatewayClient } from '@minions-openclaw/core';

export const snapshotCommand = new Command('snapshot')
  .description('Capture a snapshot of an OpenClaw Gateway instance')
  .argument('<instanceId>', 'Instance ID')
  .action(async (instanceId: string) => {
    const spinner = ora(`Capturing snapshot for ${instanceId}...`).start();
    try {
      const manager = new InstanceManager();
      const instance = await manager.getById(instanceId);
      if (!instance) {
        spinner.fail(chalk.red(`Instance ${instanceId} not found`));
        process.exit(1);
      }
      const url = instance.fields['url'] as string;
      const token = instance.fields['token'] as string | undefined;
      const privateKey = instance.fields['devicePrivateKey'] as string | undefined;
      const client = new GatewayClient(url, token, privateKey);
      await client.openConnection();
      const presence = await client.fetchPresence();
      await client.close();
      const snapshotManager = new SnapshotManager();
      const snapshot = await snapshotManager.captureSnapshot(instanceId, presence);
      spinner.succeed(chalk.green(`Snapshot captured: ${snapshot.id}`));
      console.log(chalk.cyan('  Agents:'), presence.agents.length);
      console.log(chalk.cyan('  Channels:'), presence.channels.length);
      console.log(chalk.cyan('  Models:'), presence.models.length);
    } catch (err) {
      spinner.fail(chalk.red(`Snapshot failed: ${String(err)}`));
      process.exit(1);
    }
  });
