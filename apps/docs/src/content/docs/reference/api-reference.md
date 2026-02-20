---
title: API Reference
description: Full SDK API surface for @minions-openclaw/core — InstanceManager, SnapshotManager, ConfigDecomposer, and GatewayClient.
---

## InstanceManager

Manages the registry of OpenClaw gateway instances persisted in `~/.openclaw-manager/data.json`.

### Constructor

```typescript
new InstanceManager(options?: { dataDir?: string })
```

| Option | Type | Default | Description |
|---|---|---|---|
| `dataDir` | string | `~/.openclaw-manager` | Directory for `data.json` |

### Methods

#### `register(options): Promise<Minion>`

Registers a new gateway instance. Initiates the WebSocket handshake and persists device credentials on success.

```typescript
const instance = await manager.register({
  url: 'ws://localhost:3000',   // required
  label: 'my-gateway',         // optional human label
});
```

Returns the persisted `openclaw-instance` minion with populated `deviceId`, `devicePublicKey`, and `devicePrivateKey` fields.

#### `list(): Promise<Minion[]>`

Returns all registered instances.

```typescript
const instances = await manager.list();
```

#### `get(id: string): Promise<Minion | null>`

Retrieves a single instance by ID.

#### `remove(id: string): Promise<void>`

Deletes an instance and its associated snapshots from local storage.

#### `ping(id: string): Promise<{ latencyMs: number; version: string }>`

Opens a temporary connection, sends a ping, records the latency, and closes the connection.

#### `updateStatus(id: string, status: string): Promise<void>`

Updates the `status` field of an instance (`'connected'`, `'disconnected'`, `'error'`).

---

## SnapshotManager

Captures, stores, and compares point-in-time config snapshots.

### Constructor

```typescript
new SnapshotManager(options?: { dataDir?: string })
```

### Methods

#### `capture(instanceId: string, client: GatewayClient): Promise<Minion>`

Fetches the full running config from the gateway and stores it as an `openclaw-snapshot` minion.

```typescript
const snapshot = await snapshots.capture(instance.id, client);
// snapshot.fields.capturedAt  — ISO timestamp
// snapshot.fields.config      — full config JSON string
// snapshot.fields.agentCount  — number of agents
// snapshot.fields.channelCount — number of channels
// snapshot.fields.modelCount  — number of model providers
```

#### `list(instanceId: string): Promise<Minion[]>`

Returns all snapshots for a given instance, sorted by `capturedAt` ascending.

#### `get(snapshotId: string): Promise<Minion | null>`

Retrieves a single snapshot by ID.

#### `diff(snapshotIdA: string, snapshotIdB: string): Promise<SnapshotDiff>`

Compares two snapshots and returns a structured diff.

```typescript
interface SnapshotDiff {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: ChangedEntry[];
}

interface DiffEntry {
  path: string;   // e.g. 'agents[1]'
  value: unknown;
}

interface ChangedEntry {
  path: string;
  before: unknown;
  after: unknown;
}
```

#### `printDiff(diff: SnapshotDiff): void`

Prints a human-readable diff to stdout using `+`, `-`, `~` prefixes.

#### `restore(snapshotId: string, client: GatewayClient): Promise<void>`

Pushes the stored config of a snapshot back to the connected gateway, restoring it to the captured state.

---

## ConfigDecomposer

Decomposes a flat `openclaw.json` config object into typed minion objects for each section.

### Constructor

```typescript
new ConfigDecomposer()
```

### Methods

#### `decompose(config: object): DecomposedConfig`

Parses a raw gateway config and returns an object with a typed minion for each section.

```typescript
const decomposer = new ConfigDecomposer();
const raw = JSON.parse(snapshot.fields.config);
const parts = decomposer.decompose(raw);

// parts.agents        — Minion[] (openclaw-agent)
// parts.channels      — Minion[] (openclaw-channel)
// parts.modelProviders — Minion[] (openclaw-model-provider)
// parts.skills        — Minion[] (openclaw-skill)
// parts.gatewayConfig — Minion   (openclaw-gateway-config)
// parts.sessionConfig — Minion   (openclaw-session-config)
// ... one property per config section
```

#### `recompose(parts: DecomposedConfig): object`

The inverse of `decompose`. Takes decomposed minions and rebuilds a flat config object suitable for writing back to `openclaw.json` or sending via `restore()`.

```typescript
const rawConfig = decomposer.recompose(parts);
await fs.writeFile('openclaw.json', JSON.stringify(rawConfig, null, 2));
```

---

## GatewayClient

Low-level WebSocket client that manages the authenticated connection to a single gateway instance.

### Constructor

```typescript
new GatewayClient(instance: Minion, options?: GatewayClientOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `timeout` | number | `10000` | Connection timeout in milliseconds |
| `autoReconnect` | boolean | `false` | Automatically reconnect on disconnect |
| `reconnectDelay` | number | `2000` | Delay between reconnect attempts (ms) |

### Methods

#### `connect(): Promise<void>`

Opens the WebSocket connection and completes the 7-step authentication handshake. Resolves when the connection is authenticated and ready for RPC calls.

#### `disconnect(): Promise<void>`

Sends a graceful close frame and closes the connection.

#### `ping(): Promise<{ latencyMs: number; version: string }>`

Sends a ping RPC call and measures round-trip time.

#### `getConfig(): Promise<object>`

Fetches the full running config from the gateway as a parsed JSON object.

#### `setConfig(config: object): Promise<void>`

Pushes a complete config object to the gateway. The gateway validates and applies it.

#### `call(method: string, params?: object): Promise<unknown>`

Low-level RPC call. Use for gateway-specific methods not exposed by higher-level managers.

```typescript
const agents = await client.call('agents.list');
const result = await client.call('agents.create', { name: 'my-agent', model: 'gpt-4o' });
```

### Events

`GatewayClient` extends `EventEmitter`. Listen for these events:

```typescript
client.on('connected', () => console.log('authenticated'));
client.on('disconnected', (reason) => console.log('closed:', reason));
client.on('error', (err) => console.error('error:', err));
client.on('message', (msg) => console.log('raw message:', msg));
```
