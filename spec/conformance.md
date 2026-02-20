# minions-openclaw Conformance Guide

This document defines what it means for an implementation to be conformant with the minions-openclaw specification.

## Conformance Levels

### Level 1: Core (Required)

All implementations MUST support:

1. **Instance management**: `register()`, `list()`, `getById()`, `remove()` operations
2. **File persistence**: Data stored at `~/.openclaw-manager/data.json`
3. **Soft delete**: `remove()` marks instances as deleted without hard removal
4. **All 18 types**: The complete type registry must include all standard OpenClaw types:
   - `openclaw-instance`, `openclaw-snapshot`, `openclaw-agent`, `openclaw-channel`
   - `openclaw-model-provider`, `openclaw-session-config`, `openclaw-gateway-config`
   - `openclaw-skill`, `openclaw-tool-config`, `openclaw-talk-config`, `openclaw-browser-config`
   - `openclaw-hook`, `openclaw-cron-job`, `openclaw-discovery-config`, `openclaw-identity-config`
   - `openclaw-canvas-config`, `openclaw-logging-config`, `openclaw-ui-config`
5. **Snapshot capture**: `captureSnapshot()` records agent, channel, model counts and config JSON
6. **Snapshot listing**: `listSnapshots()` returns all snapshots for a given instance ID
7. **Snapshot diff**: `diffSnapshots()` detects changed, added, and removed fields
8. **Config decomposition**: `decompose()` converts flat config to minion tree with relations
9. **Config composition**: `compose()` reconstructs a flat config from a minion tree

### Level 2: Connection (Recommended)

Implementations SHOULD support:

1. **WebSocket client**: `GatewayClient` connects to an OpenClaw Gateway via WebSocket
2. **Challenge-response auth**: RSA PKCS1v15 SHA-256 signing of the server challenge
3. **Device token persistence**: Token saved and retrieved across sessions
4. **RPC calls**: `call(method, params)` sends requests and receives JSON responses
5. **Presence fetch**: `fetchPresence()` retrieves agents, channels, models, and config

### Level 3: Advanced (Optional)

Implementations MAY support:

1. **mDNS discovery**: Automatic gateway discovery on local network
2. **Canvas UI integration**: Sending layout data to the gateway canvas
3. **Cron job management**: Scheduling and managing cron-based automations
4. **Snapshot history chain**: `getHistory()` traversing `follows` relations in order

## Testing Conformance

```typescript
import { InstanceManager, SnapshotManager } from '@minions-openclaw/sdk';
import { registry, allOpenClawTypes } from '@minions-openclaw/sdk';

// Level 1: Verify all 18 types registered
assert(allOpenClawTypes.length === 18);
const slugs = registry.list().map(t => t.slug);
assert(slugs.includes('openclaw-instance'));
assert(slugs.includes('openclaw-snapshot'));

// Level 1: Verify instance management
const manager = new InstanceManager();
const instance = await manager.register('Test', 'ws://localhost:18789');
assert(instance.fields.status === 'registered');
const list = await manager.list();
assert(list.length >= 1);

// Level 1: Verify snapshot capture
const snapshotMgr = new SnapshotManager();
const snapshot = await snapshotMgr.captureSnapshot(instance.id, {
  agents: [{ id: 'a1' }],
  channels: [],
  models: [],
  config: {},
});
assert(snapshot.fields.agentCount === 1);
```

---

*minions-openclaw Specification v0.1.0 — MIT*
