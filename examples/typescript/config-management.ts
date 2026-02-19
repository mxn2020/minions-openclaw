/**
 * Example: Config management with ConfigDecomposer
 */
import { ConfigDecomposer } from '@minions-openclaw/core';

async function main() {
  const decomposer = new ConfigDecomposer();

  const config = {
    agents: [
      { name: 'assistant', model: 'gpt-4', enabled: true },
      { name: 'coder', model: 'gpt-4-turbo', enabled: true },
    ],
    channels: [
      { type: 'slack', name: 'general', enabled: true },
    ],
    sessionConfig: {
      maxSessions: 10,
      sessionTimeout: 3600,
      persistSessions: false,
    },
  };

  const instanceId = 'example-instance-id';
  const { minions, relations } = decomposer.decompose(config, instanceId);

  console.log('Decomposed config:');
  console.log('  Minions:', minions.length);
  console.log('  Relations:', relations.length);

  for (const minion of minions) {
    console.log(`  - ${minion.title} (${minion.minionTypeId})`);
  }
}

main().catch(console.error);
