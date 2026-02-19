import { Command } from 'commander';
import chalk from 'chalk';
import { SnapshotManager } from '@minions-openclaw/core';

export const historyCommand = new Command('history')
  .description('Show snapshot history for an instance')
  .argument('<instanceId>', 'Instance ID')
  .action(async (instanceId: string) => {
    const manager = new SnapshotManager();
    const snapshots = await manager.listSnapshots(instanceId);
    if (snapshots.length === 0) {
      console.log(chalk.yellow('No snapshots found for this instance.'));
      return;
    }
    console.log(chalk.bold(`Snapshot History for ${instanceId}:`));
    for (const snap of snapshots) {
      const agents = (snap.fields['agentCount'] as number) ?? 0;
      const channels = (snap.fields['channelCount'] as number) ?? 0;
      const models = (snap.fields['modelCount'] as number) ?? 0;
      console.log(`  ${chalk.cyan(snap.id)}  ${chalk.gray(snap.fields['capturedAt'] as string)}  agents:${agents} channels:${channels} models:${models}`);
    }
  });
