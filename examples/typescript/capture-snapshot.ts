/**
 * Example: Capture a snapshot from an OpenClaw Gateway instance
 */
import { InstanceManager, SnapshotManager, GatewayClient } from '@minions-openclaw/sdk';

async function main() {
  const instanceManager = new InstanceManager();
  const snapshotManager = new SnapshotManager();

  const instances = await instanceManager.list();
  if (instances.length === 0) {
    console.log('No instances found. Register one first.');
    return;
  }

  const instance = instances[0];
  console.log('Capturing snapshot for:', instance.title);

  const client = new GatewayClient(
    instance.fields['url'] as string,
    instance.fields['token'] as string | undefined,
    instance.fields['devicePrivateKey'] as string | undefined
  );

  await client.openConnection();
  const presence = await client.fetchPresence();
  await client.close();

  const snapshot = await snapshotManager.captureSnapshot(instance.id, presence);
  console.log('Snapshot captured:', snapshot.id);
  console.log('Agents:', presence.agents.length);
  console.log('Channels:', presence.channels.length);
  console.log('Models:', presence.models.length);
}

main().catch(console.error);
