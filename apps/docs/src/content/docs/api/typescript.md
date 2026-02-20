---
title: TypeScript API Reference
description: Full API reference for @minions-openclaw/sdk — InstanceManager, GatewayClient, SnapshotManager, ConfigDecomposer.
---

# TypeScript API Reference

```bash
pnpm add @minions-openclaw/sdk
```

---

## InstanceManager

Manages registered OpenClaw Gateway instances in local storage (`~/.openclaw-manager/data.json`).

```typescript
import { InstanceManager } from '@minions-openclaw/sdk';
const manager = new InstanceManager();
```

### `register(name, url, token?)`

```typescript
register(name: string, url: string, token?: string): Promise<Minion>
```

Creates and persists a new instance Minion.

### `listInstances()`

```typescript
listInstances(): Promise<Minion[]>
```

Returns all non-deleted instance Minions.

### `getById(id)`

```typescript
getById(id: string): Promise<Minion | undefined>
```

### `ping(id)`

```typescript
ping(id: string): Promise<{ latencyMs: number; version: string }>
```

Opens a WebSocket connection, measures round-trip time, updates storage, and closes.

### `remove(id)`

```typescript
remove(id: string): Promise<void>
```

Soft-deletes the instance Minion.

---

## GatewayClient

WebSocket client for live communication with an OpenClaw Gateway.

```typescript
import { GatewayClient } from '@minions-openclaw/sdk';
const client = new GatewayClient(url, token?, devicePrivateKey?);
```

### `openConnection()`

```typescript
openConnection(): Promise<void>
```

Establishes a WebSocket connection and completes the challenge-response handshake if required.

### `call(method, params?)`

```typescript
call(method: string, params?: Record<string, unknown>): Promise<unknown>
```

Sends a JSON-RPC-style call and awaits the response matching the generated call ID.

### `fetchPresence()`

```typescript
fetchPresence(): Promise<{ agents: unknown[]; channels: unknown[]; models: unknown[]; config: Record<string, unknown> }>
```

Fetches agents, channels, models, and system presence in parallel via `Promise.all`.

### `close()`

```typescript
close(): Promise<void>
```

### `deviceToken` (property)

```typescript
deviceToken: string | undefined
```

The device token returned by the gateway after successful auth, if any.

---

## SnapshotManager

Captures and queries point-in-time snapshots of gateway state.

```typescript
import { SnapshotManager } from '@minions-openclaw/sdk';
const snapshots = new SnapshotManager();
```

### `captureSnapshot(instanceId, gatewayData)`

```typescript
captureSnapshot(instanceId: string, gatewayData: GatewaySnapshot): Promise<Minion>
```

Creates a snapshot Minion, links it to the instance with `parent_of`, and links to the previous snapshot with `follows`.

### `listSnapshots(instanceId)`

```typescript
listSnapshots(instanceId: string): Promise<Minion[]>
```

Returns all non-deleted snapshots for the instance, sorted newest first.

### `getLatestSnapshot(instanceId)`

```typescript
getLatestSnapshot(instanceId: string): Promise<Minion | undefined>
```

### `getHistory(instanceId)`

```typescript
getHistory(instanceId: string): Promise<Minion[]>
```

Traverses the `follows` chain and returns snapshots in newest → oldest order.

### `compare(snapshotId1, snapshotId2)`

```typescript
compare(snapshotId1: string, snapshotId2: string): Promise<Record<string, { from: unknown; to: unknown }>>
```

Loads both snapshots and delegates to `diffSnapshots`.

### `diffSnapshots(a, b)`

```typescript
diffSnapshots(a: Minion, b: Minion): Record<string, { from: unknown; to: unknown }>
```

Synchronous field-level comparison.

---

## ConfigDecomposer

Maps between `OpenClawConfig` JSON and a typed Minion tree.

```typescript
import { ConfigDecomposer } from '@minions-openclaw/sdk';
const decomposer = new ConfigDecomposer();
```

### `loadFromFile(configPath)`

```typescript
loadFromFile(configPath: string): Promise<OpenClawConfig>
```

### `decompose(config, parentInstanceId)`

```typescript
decompose(config: OpenClawConfig, parentInstanceId: string): DecomposedConfig
// { minions: Minion[], relations: Relation[] }
```

### `compose(instanceId, storage?)`

```typescript
compose(instanceId: string, storage?: StorageData): Promise<OpenClawConfig>
```

Reconstructs the config from storage by reversing the decomposition.

### `saveComposed(instanceId, config)`

```typescript
saveComposed(instanceId: string, config: OpenClawConfig): Promise<void>
```

Decomposes and merges into persistent storage.

### `diff(configA, configB)`

```typescript
diff(
  configA: OpenClawConfig,
  configB: OpenClawConfig,
): {
  added: Partial<OpenClawConfig>;
  removed: Partial<OpenClawConfig>;
  changed: Partial<OpenClawConfig>;
}
```

Compares two config objects at the section level. Array sections compare by item `name`; singleton sections compare field-by-field.

---

## Types

### `OpenClawConfig`

```typescript
interface OpenClawConfig {
  agents?: Array<{ name: string; model: string; systemPrompt?: string; tools?: string[]; channels?: string[]; skills?: string[]; enabled?: boolean }>;
  channels?: Array<{ type: string; name: string; config?: Record<string, unknown>; enabled?: boolean }>;
  modelProviders?: Array<{ provider: string; model: string; apiKey?: string; baseUrl?: string; enabled?: boolean }>;
  skills?: Array<{ name: string; description?: string; enabled?: boolean; config?: Record<string, unknown> }>;
  tools?: Array<{ name: string; type: string; config?: Record<string, unknown>; enabled?: boolean }>;
  sessionConfig?: { maxSessions?: number; sessionTimeout?: number; persistSessions?: boolean };
  gatewayConfig?: { host?: string; port?: number; tlsEnabled?: boolean; certPath?: string; keyPath?: string };
  // ... and talkConfig, browserConfig, hooks, cronJobs, discoveryConfig, identityConfig, canvasConfig, loggingConfig, uiConfig
}
```

### `GatewaySnapshot`

```typescript
interface GatewaySnapshot {
  agents: unknown[];
  channels: unknown[];
  models: unknown[];
  config: Record<string, unknown>;
}
```
