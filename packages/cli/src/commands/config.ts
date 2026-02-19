import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigDecomposer, SnapshotManager } from '@minions-openclaw/core';
import type { Minion } from '@minions-openclaw/core';
import { promises as fsp } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export const configCommand = new Command('config')
  .description('Manage OpenClaw configuration');

configCommand
  .command('show <instanceId>')
  .description('Show configuration for an instance')
  .action(async (instanceId: string) => {
    const snapshotManager = new SnapshotManager();
    const latest = await snapshotManager.getLatestSnapshot(instanceId);
    if (!latest) {
      console.log(chalk.yellow('No snapshots found. Run `snapshot` first.'));
      return;
    }
    const config = latest.fields['config'] as string;
    console.log(chalk.bold('Latest configuration:'));
    try {
      console.log(JSON.stringify(JSON.parse(config), null, 2));
    } catch {
      console.log(config);
    }
  });

configCommand
  .command('diff <id1> <id2>')
  .description('Diff two snapshots')
  .action(async (id1: string, id2: string) => {
    const snapshotManager = new SnapshotManager();
    const dataFile = join(homedir(), '.openclaw-manager', 'data.json');
    let storage: { minions: Minion[]; relations: unknown[] } = { minions: [], relations: [] };
    try {
      storage = JSON.parse(await fsp.readFile(dataFile, 'utf-8'));
    } catch { /* no-op */ }
    const a = storage.minions.find((m: Minion) => m.id === id1);
    const b = storage.minions.find((m: Minion) => m.id === id2);
    if (!a || !b) {
      console.error(chalk.red('One or both snapshot IDs not found'));
      process.exit(1);
    }
    const diff = snapshotManager.diffSnapshots(a, b);
    if (Object.keys(diff).length === 0) {
      console.log(chalk.green('No differences found'));
    } else {
      for (const [key, { from, to }] of Object.entries(diff)) {
        console.log(chalk.yellow(`  ${key}:`));
        console.log(chalk.red(`    - ${JSON.stringify(from)}`));
        console.log(chalk.green(`    + ${JSON.stringify(to)}`));
      }
    }
  });

configCommand
  .command('export <instanceId>')
  .description('Export configuration as JSON')
  .option('--format <format>', 'Output format', 'json')
  .action(async (instanceId: string, _options: { format: string }) => {
    const snapshotManager = new SnapshotManager();
    const latest = await snapshotManager.getLatestSnapshot(instanceId);
    if (!latest) {
      console.log(chalk.yellow('No snapshots found.'));
      return;
    }
    const config = latest.fields['config'] as string;
    console.log(config);
  });

configCommand
  .command('import <instanceId>')
  .description('Import configuration from file')
  .requiredOption('--file <file>', 'Config file path')
  .action(async (instanceId: string, options: { file: string }) => {
    const spinner = ora(`Importing config from ${options.file}...`).start();
    try {
      const decomposer = new ConfigDecomposer();
      const config = await decomposer.loadFromFile(options.file);
      const result = decomposer.decompose(config, instanceId);
      spinner.succeed(chalk.green(`Imported: ${result.minions.length} config items`));
    } catch (err) {
      spinner.fail(chalk.red(`Import failed: ${String(err)}`));
      process.exit(1);
    }
  });
