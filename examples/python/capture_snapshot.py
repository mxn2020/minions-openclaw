"""Example: Capture a snapshot from an OpenClaw Gateway instance."""
import asyncio
from minions_openclaw import InstanceManager, SnapshotManager, GatewayClient


async def main():
    instance_manager = InstanceManager()
    snapshot_manager = SnapshotManager()

    instances = instance_manager.list()
    if not instances:
        print('No instances found. Register one first.')
        return

    instance = instances[0]
    print(f'Capturing snapshot for: {instance.title}')

    client = GatewayClient(
        instance.fields['url'],
        token=instance.fields.get('token'),
        device_private_key=instance.fields.get('devicePrivateKey'),
    )

    await client.open_connection()
    presence = await client.fetch_presence()
    await client.close()

    snapshot = snapshot_manager.capture_snapshot(instance.id, presence)
    print(f'Snapshot captured: {snapshot.id}')
    print(f"Agents: {presence['agents']}")


if __name__ == '__main__':
    asyncio.run(main())
