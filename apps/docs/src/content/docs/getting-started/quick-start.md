---
title: Quick Start
description: Register an OpenClaw instance, ping it, take a snapshot, and view its agents in under 5 minutes.
---

# Quick Start

## 1. Register an Instance

```bash
openclaw-manager instance register my-gateway --url ws://localhost:3001 --token my-secret-token
```

The CLI stores the instance in `~/.openclaw-manager/data.json` and prints the assigned instance ID:

```
Registered instance: my-gateway (id: abc-123)
```

## 2. Ping the Gateway

```bash
openclaw-manager instance ping abc-123
```

Output:
```
Ping successful — latency: 12ms, version: 1.4.2
```

## 3. Take a Snapshot

Capture the full current state of the gateway (agents, channels, models, config):

```bash
openclaw-manager snapshot capture abc-123
```

Output:
```
Snapshot captured: snap-456 (3 agents, 2 channels, 1 model provider)
```

## 4. View Agents

```bash
openclaw-manager snapshot list abc-123
```

## 5. Using the TypeScript SDK

```typescript
import { InstanceManager, SnapshotManager, GatewayClient } from '@minions-openclaw/core';

const instances = new InstanceManager();
const instance = await instances.register('my-gateway', 'ws://localhost:3001', 'my-secret-token');

const client = new GatewayClient(instance.fields.url as string, instance.fields.token as string);
await client.openConnection();

const presence = await client.fetchPresence();
await client.close();

const snapshots = new SnapshotManager();
const snapshot = await snapshots.captureSnapshot(instance.id, presence);
console.log('Snapshot ID:', snapshot.id);
```

## 6. Using the Python SDK

```python
import asyncio
from minions_openclaw import InstanceManager, GatewayClient, SnapshotManager

async def main():
    instances = InstanceManager()
    instance = instances.register('my-gateway', 'ws://localhost:3001', token='my-secret-token')

    client = GatewayClient(instance.fields['url'], token=instance.fields.get('token'))
    await client.open_connection()
    presence = await client.fetch_presence()
    await client.close()

    snapshots = SnapshotManager()
    snapshot = snapshots.capture_snapshot(instance.id, presence)
    print('Snapshot ID:', snapshot.id)

asyncio.run(main())
```
