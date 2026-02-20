---
title: Snapshot Workflow
description: Capture gateway state, view history, and compare snapshots over time.
---

# Snapshot Workflow

## Scheduled Captures

For continuous monitoring, set up a cron job or systemd timer to capture snapshots regularly:

```bash
# Crontab entry — capture every 15 minutes
*/15 * * * * openclaw-manager snapshot capture <instance-id>
```

Or use a shell script for multiple instances:

```bash
#!/bin/bash
INSTANCES=(abc-123 def-456 ghi-789)
for id in "${INSTANCES[@]}"; do
  openclaw-manager snapshot capture "$id" || echo "Failed: $id"
done
```

## Viewing History

```bash
openclaw-manager snapshot list <instance-id>
```

Output (newest first, traversing the `follows` chain):
```
ID         Captured At              Agents  Channels  Models
─────────────────────────────────────────────────────────────
snap-789   2026-02-20T10:00:00Z    5       3         2
snap-456   2026-02-20T09:45:00Z    4       3         2
snap-123   2026-02-20T09:30:00Z    4       3         1
```

## Comparing Two Snapshots

```bash
openclaw-manager config diff snap-456 snap-789
```

Output:
```
  agentCount:
    - 4
    + 5
  config:
    - "...v1..."
    + "...v2..."
```

## TypeScript SDK — Full History Workflow

```typescript
import { SnapshotManager, GatewayClient } from '@minions-openclaw/sdk';

const client = new GatewayClient('ws://localhost:3001', 'token');
await client.openConnection();
const presence = await client.fetchPresence();
await client.close();

const snapshots = new SnapshotManager();

// Capture
const latest = await snapshots.captureSnapshot(instanceId, presence);

// View ordered history (newest → oldest)
const history = await snapshots.getHistory(instanceId);
console.log(`${history.length} snapshots in history`);

// Compare latest with previous
if (history.length >= 2) {
  const diff = await snapshots.compare(history[0].id, history[1].id);
  console.log('Changes since last capture:', diff);
}
```

## Rollback Pattern

To restore a previous config, use `compose()` on an older snapshot's instance and re-import:

```typescript
import { ConfigDecomposer, SnapshotManager } from '@minions-openclaw/sdk';

const decomposer = new ConfigDecomposer();
const snapshots = new SnapshotManager();

// Get the snapshot you want to roll back to
const history = await snapshots.getHistory(instanceId);
const target = history[2]; // 3 captures ago

// Recompose the config from that snapshot's instance state
const config = await decomposer.compose(instanceId);

// Export and manually apply to the running gateway
console.log(JSON.stringify(config, null, 2));
```
