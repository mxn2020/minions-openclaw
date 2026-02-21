---
title: Backup and Restore
description: Backup and restore workflow using snapshots and config decomposition.
---

## Overview

OpenClaw uses snapshots as its backup mechanism. A snapshot captures the entire running configuration of a gateway at a point in time. Restoring a snapshot pushes that configuration back to the gateway, returning it to the exact state it was in when the snapshot was taken.

This document covers: manual backups, automated scheduled backups, exporting configs to disk, and restore procedures.

---

## Creating a backup (manual)

A backup is simply a snapshot. Use `SnapshotManager.capture()` before any significant change:

```typescript
import { InstanceManager, SnapshotManager, GatewayClient } from '@minions-openclaw/core';

const manager = new InstanceManager();
const snapshots = new SnapshotManager();

const instance = await manager.get('inst_abc123');
const client = new GatewayClient(instance);
await client.connect();

// Capture the backup
const backup = await snapshots.capture(instance.id, client);
console.log('Backup created:', backup.id);
console.log('Timestamp:', backup.fields.capturedAt);

await client.disconnect();
```

Keep a note of `backup.id` so you can reference it later in a restore.

---

## Automated scheduled backups

Use a cron job or a gateway-side `openclaw-cron-job` to capture snapshots automatically:

### Node.js with `node-cron`

```typescript
import cron from 'node-cron';
import { InstanceManager, SnapshotManager, GatewayClient } from '@minions-openclaw/core';

const manager = new InstanceManager();
const snapshots = new SnapshotManager();

// Backup every 6 hours
cron.schedule('0 */6 * * *', async () => {
  const instances = await manager.list();
  for (const instance of instances) {
    try {
      const client = new GatewayClient(instance);
      await client.connect();
      const snap = await snapshots.capture(instance.id, client);
      await client.disconnect();
      console.log(`[${new Date().toISOString()}] Backed up ${instance.fields.label}: ${snap.id}`);
    } catch (err) {
      console.error(`Backup failed for ${instance.fields.label}:`, err);
    }
  }
});
```

### Gateway-side cron job (in `openclaw.json`)

```json
{
  "cronJobs": [
    {
      "name": "auto-backup",
      "schedule": "0 */6 * * *",
      "action": "snapshots.capture",
      "enabled": true
    }
  ]
}
```

---

## Exporting a snapshot to disk

Snapshots are stored in `~/.openclaw-manager/data.json`, but you may also want to export the raw config to a file for off-site backup or version control:

```typescript
import fs from 'node:fs/promises';
import path from 'node:path';

const snap = await snapshots.get('snap_abc123');
const config = JSON.parse(snap.fields.config);

const exportPath = path.resolve(`./backups/config-${snap.fields.capturedAt}.json`);
await fs.writeFile(exportPath, JSON.stringify(config, null, 2), 'utf-8');
console.log('Exported to', exportPath);
```

Commit these files to a separate Git repository for a full audit trail with history.

---

## Using ConfigDecomposer for partial exports

`ConfigDecomposer.decompose()` breaks the flat config into typed minion objects, letting you export only the sections you care about:

```typescript
import { ConfigDecomposer } from '@minions-openclaw/core';

const decomposer = new ConfigDecomposer();
const snap = await snapshots.get('snap_abc123');
const raw = JSON.parse(snap.fields.config);
const parts = decomposer.decompose(raw);

// Export only agent definitions
await fs.writeFile(
  './backups/agents.json',
  JSON.stringify(parts.agents, null, 2),
  'utf-8',
);

// Export only model providers (redact API keys first)
const safeProviders = parts.modelProviders.map((p) => ({
  ...p,
  fields: { ...p.fields, apiKey: '[REDACTED]' },
}));
await fs.writeFile('./backups/model-providers.json', JSON.stringify(safeProviders, null, 2));
```

---

## Restoring a snapshot

`SnapshotManager.restore()` pushes the stored config back to the gateway:

```typescript
const client = new GatewayClient(instance);
await client.connect();

// Restore to a known-good snapshot
await snapshots.restore('snap_abc123', client);
console.log('Gateway restored to snapshot snap_abc123');

await client.disconnect();
```

**What happens during restore:**

1. `restore()` reads the stored `config` JSON from the snapshot minion.
2. It calls `GatewayClient.setConfig()` to push the config to the gateway.
3. The gateway validates the config. If validation fails, the existing config is left unchanged and `restore()` throws an error.
4. On success, the gateway applies the new config. Depending on the gateway version, a restart may be required for some sections (e.g., `gatewayConfig.port`).

---

## Restore procedure checklist

Before restoring to production, follow these steps:

1. **Capture a pre-restore snapshot** — create a safety backup of the current state before overwriting it:

```typescript
const safetySnap = await snapshots.capture(instance.id, client);
console.log('Safety snapshot:', safetySnap.id);
```

2. **Diff the target snapshot against current state** — understand what will change:

```typescript
const diff = await snapshots.diff(safetySnap.id, 'snap_target');
snapshots.printDiff(diff);
```

3. **Confirm the diff looks correct** — check for unexpected additions or removals.

4. **Run restore** — push the target config.

5. **Verify** — ping the gateway and spot-check critical settings.

```typescript
const ping = await manager.ping(instance.id);
console.log('Gateway up:', ping.latencyMs, 'ms');
```

---

## Rolling back a failed restore

If the gateway ends up in a bad state after a restore, roll back using the pre-restore safety snapshot:

```typescript
await snapshots.restore(safetySnap.id, client);
console.log('Rolled back to pre-restore state');
```

Because the safety snapshot was taken immediately before the restore, this returns the gateway to exactly where it was.
