/**
 * Example: Register an OpenClaw Gateway instance
 */
import { InstanceManager } from '@minions-openclaw/sdk';

async function main() {
  const manager = new InstanceManager();

  const instance = await manager.register(
    'my-gateway',
    'ws://localhost:8080',
    'optional-auth-token'
  );

  console.log('Registered instance:', instance.id);
  console.log('Title:', instance.title);
  console.log('URL:', instance.fields['url']);
  console.log('Status:', instance.fields['status']);

  const instances = await manager.list();
  console.log('\nAll instances:', instances.length);
}

main().catch(console.error);
