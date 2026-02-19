/**
 * Example: Managing multiple OpenClaw Gateway instances
 */
import { InstanceManager } from '@minions-openclaw/core';

async function main() {
  const manager = new InstanceManager();

  const prod = await manager.register('production', 'ws://prod.example.com:8080', 'prod-token');
  const staging = await manager.register('staging', 'ws://staging.example.com:8080', 'staging-token');
  const local = await manager.register('local', 'ws://localhost:8080');

  console.log('Registered instances:');
  console.log('  Production:', prod.id);
  console.log('  Staging:', staging.id);
  console.log('  Local:', local.id);

  const instances = await manager.list();
  console.log('\nTotal instances:', instances.length);

  for (const inst of instances) {
    console.log(`  ${inst.title}: ${inst.fields['url']} [${inst.fields['status']}]`);
  }

  await manager.remove(prod.id);
  await manager.remove(staging.id);
  await manager.remove(local.id);
  console.log('\nCleaned up all instances');
}

main().catch(console.error);
