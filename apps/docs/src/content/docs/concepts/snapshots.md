---
title: Snapshots
description: Learn how the snapshot system captures gateway state and builds a traversable version history.
---

# Snapshots

A **snapshot** is a point-in-time capture of everything a gateway knows about itself: its agents, channels, model providers, and raw config JSON. Each snapshot is stored as a Minion of type `openclaw-snapshot`.

## Snapshot Fields

| Field | Type | Description |
|-------|------|-------------|
| `instanceId` | string | ID of the parent instance Minion |
| `capturedAt` | date | ISO timestamp of capture |
| `config` | textarea | Raw config JSON (stringified) |
| `agentCount` | number | Number of agents at capture time |
| `channelCount` | number | Number of channels at capture time |
| `modelCount` | number | Number of model providers at capture time |

## The `follows` Chain

Every snapshot (except the first) has a `follows` relation pointing to the previous snapshot. This forms a **linked list** from newest to oldest, enabling:

- Ordered history traversal with `getHistory()`
- Field-level diffs between any two snapshots with `compare()`
- Rollback patterns by decomposing an older snapshot's config

```
[Snapshot 3] --follows--> [Snapshot 2] --follows--> [Snapshot 1]
     ↑                          ↑                          ↑
  (latest)                                            (first)
```

All three snapshots are also children of the instance via `parent_of` relations.

## Capturing a Snapshot

```typescript
import { GatewayClient, SnapshotManager } from '@minions-openclaw/core';

const client = new GatewayClient('ws://localhost:3001', 'token');
await client.openConnection();
const presence = await client.fetchPresence();
await client.close();

const snapshots = new SnapshotManager();
const snap = await snapshots.captureSnapshot(instanceId, presence);
```

## Viewing History

```typescript
const history = await snapshots.getHistory(instanceId);
// Returns snapshots ordered newest → oldest
```

## Comparing Snapshots

```typescript
const diff = await snapshots.compare(snap1.id, snap2.id);
// { agentCount: { from: 3, to: 5 }, config: { from: '...', to: '...' } }
```
