---
title: Data Storage
description: How data.json works, the persistence model, the complete data structure, and schema migrations.
---

All `minions-openclaw` data is persisted in a single JSON file at `~/.openclaw-manager/data.json`. This file is the local database for the management client — no external database is required. This document explains the file's structure and how to work with it.

## File Location

```
~/.openclaw-manager/
└── data.json
```

The directory is created automatically on first use. You can override the location by subclassing `InstanceManager` or `SnapshotManager` and passing a custom `dataDir`.

## File Structure

`data.json` uses the standard Minions data model — an array of `minions` and an array of `relations`:

```json
{
  "minions": [
    {
      "id": "uuid-v4",
      "title": "Home Gateway",
      "minionTypeId": "openclaw-instance",
      "fields": {
        "url": "ws://192.168.1.100:18789",
        "status": "connected",
        "lastPingLatencyMs": 12,
        "token": "device-token-string"
      },
      "createdAt": "2026-02-20T07:00:00.000Z",
      "updatedAt": "2026-02-20T07:30:00.000Z"
    },
    {
      "id": "uuid-v4-2",
      "title": "Snapshot 2026-02-20",
      "minionTypeId": "openclaw-snapshot",
      "fields": {
        "instanceId": "uuid-v4",
        "agentCount": 4,
        "channelCount": 3,
        "modelCount": 2,
        "config": "{\"version\":\"1.0\",\"port\":18789}"
      },
      "createdAt": "2026-02-20T07:30:00.000Z",
      "updatedAt": "2026-02-20T07:30:00.000Z"
    }
  ],
  "relations": [
    {
      "id": "uuid-v4-3",
      "sourceId": "uuid-v4-2",
      "targetId": "uuid-v4-snapshot-1",
      "type": "follows",
      "createdAt": "2026-02-20T07:30:00.000Z"
    }
  ]
}
```

## Minion Types in Storage

| `minionTypeId` | Created by | Purpose |
|----------------|-----------|---------|
| `openclaw-instance` | `InstanceManager.register()` | Gateway instance registration |
| `openclaw-snapshot` | `SnapshotManager.captureSnapshot()` | Point-in-time config capture |

Decomposed config minions (agents, channels, etc.) are kept in memory during `decompose()` / `compose()` operations and are not persisted to `data.json` by default.

## Relations

`follows` relations between snapshots form a chain that `SnapshotManager.getHistory()` traverses. Each new snapshot adds a `follows` relation pointing to the previous snapshot for that instance.

## Concurrency

`data.json` is read and written synchronously per operation. It is **not safe for concurrent writes from multiple processes**. If you need multi-process access, implement a custom storage backend using file locking or a database.

## Backup and Migration

To move your data to a new machine, copy `~/.openclaw-manager/` to the same path on the target:

```bash
scp -r ~/.openclaw-manager/ newhost:~/.openclaw-manager/
```

To reset all data:

```bash
rm -rf ~/.openclaw-manager/
```

## Inspecting the File

The file is human-readable JSON. You can inspect it directly:

```bash
cat ~/.openclaw-manager/data.json | jq '.minions | length'
cat ~/.openclaw-manager/data.json | jq '.minions[] | select(.minionTypeId == "openclaw-instance") | .title'
```

## Atomic Writes

To prevent file corruption during a write, `data.json` is written using a write-to-temp-then-rename strategy:

1. Serialize the full data object to a JSON string.
2. Write to `data.json.tmp` in the same directory.
3. Rename `data.json.tmp` → `data.json` (atomic on POSIX filesystems).

If the process crashes during step 2, `data.json.tmp` is left behind but `data.json` remains intact. The `.tmp` file is cleaned up automatically on the next manager startup.

## Schema Migrations

When a new version of `minions-openclaw` introduces a schema change, the manager runs an automatic migration on startup. Migrations are non-destructive. You can check the current schema version:

```bash
jq '.version // "pre-1.0"' ~/.openclaw-manager/data.json
```

To reset all data (WARNING: destroys all instance registrations and snapshots):

```bash
rm -rf ~/.openclaw-manager/
```

The directory and `data.json` are recreated with an empty structure on the next manager operation.
