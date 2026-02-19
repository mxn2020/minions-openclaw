#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommand } from './commands/register.js';
import { pingCommand } from './commands/ping.js';
import { snapshotCommand } from './commands/snapshot.js';
import { configCommand } from './commands/config.js';
import { listCommand } from './commands/list.js';
import { historyCommand } from './commands/history.js';
import { agentsCommand } from './commands/agents.js';
import { channelsCommand } from './commands/channels.js';
import { modelsCommand } from './commands/models.js';

const program = new Command();

program
  .name('openclaw-manager')
  .description('Manage OpenClaw Gateway instances')
  .version('0.1.0');

program.addCommand(registerCommand);
program.addCommand(pingCommand);
program.addCommand(snapshotCommand);
program.addCommand(configCommand);
program.addCommand(listCommand);
program.addCommand(historyCommand);
program.addCommand(agentsCommand);
program.addCommand(channelsCommand);
program.addCommand(modelsCommand);

program.parse(process.argv);
