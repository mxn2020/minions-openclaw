# minions-openclaw

[![CI](https://github.com/minions-openclaw/minions-openclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/minions-openclaw/minions-openclaw/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@minions-openclaw%2Fcore.svg)](https://www.npmjs.com/package/@minions-openclaw/core)
[![PyPI version](https://badge.fury.io/py/minions-openclaw.svg)](https://pypi.org/project/minions-openclaw/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)

A production-quality monorepo for managing **OpenClaw Gateway** instances using [minions-sdk](https://www.npmjs.com/package/minions-sdk) for structured data management.

## Overview

`minions-openclaw` provides a TypeScript SDK, Python SDK, and CLI for:

- Registering and managing multiple OpenClaw Gateway instances
- Capturing point-in-time configuration snapshots
- Decomposing `openclaw.json` configs into a structured minion tree
- Monitoring live gateway state (agents, channels, model providers)
- Diffing configuration across time or between instances

## Features

- 🔗 **Multi-instance management** — Register and manage a fleet of OpenClaw Gateway instances
- 📸 **Snapshot capture** — Capture live state snapshots for audit and comparison
- 🔄 **Config decomposition** — Parse `openclaw.json` into structured minions with typed schemas
- 📊 **Diff & history** — Compare snapshots over time to track configuration drift
- 🔐 **Device authentication** — RSA-based device challenge/response authentication
- 🌐 **WebSocket client** — Full protocol implementation of the OpenClaw Gateway WS API
- 🐍 **Python SDK** — Equivalent Python library for use in scripts and automation
- 📖 **Documentation** — Astro Starlight docs site

## Installation

### CLI (global)

```bash
npm install -g @minions-openclaw/cli
```

### TypeScript SDK

```bash
npm install @minions-openclaw/core
```

### Python SDK

```bash
pip install minions-openclaw
```

## Quick Start

### Register a gateway instance

```bash
openclaw-manager register my-gateway --url ws://192.168.1.100:8080 --token mytoken
```

### List registered instances

```bash
openclaw-manager list
```

### Ping an instance

```bash
openclaw-manager ping <instanceId>
```

### Capture a snapshot

```bash
openclaw-manager snapshot <instanceId>
```

### View snapshot history

```bash
openclaw-manager history <instanceId>
```

## CLI Command Reference

```
openclaw-manager [command] [options]

Commands:
  register <name>         Register a new OpenClaw Gateway instance
    --url <url>           Gateway WebSocket URL (required)
    --token <token>       Auth token (optional)

  ping <instanceId>       Ping an instance and record latency

  snapshot <instanceId>   Capture a live snapshot of gateway state

  list                    List all registered instances

  history <instanceId>    Show snapshot history for an instance

  agents <instanceId>     List agents on a gateway
  channels <instanceId>   List channels on a gateway
  models <instanceId>     List model providers on a gateway

  config show <instanceId>              Show latest config
  config diff <id1> <id2>               Diff two snapshots
  config export <instanceId>            Export config as JSON
  config import <instanceId> --file <path>  Import config from file
```

## TypeScript SDK Usage

```typescript
import {
  InstanceManager,
  GatewayClient,
  SnapshotManager,
  ConfigDecomposer,
} from '@minions-openclaw/core';

// Register an instance
const manager = new InstanceManager();
const instance = await manager.register('my-gateway', 'ws://localhost:8080', 'token');

// Connect and fetch live state
const client = new GatewayClient(instance.fields['url'] as string, 'token');
await client.openConnection();
const presence = await client.fetchPresence();
await client.close();

// Capture a snapshot
const snapshots = new SnapshotManager();
const snapshot = await snapshots.captureSnapshot(instance.id, presence);

// Decompose a config file
const decomposer = new ConfigDecomposer();
const config = await decomposer.loadFromFile('./openclaw.json');
const { minions, relations } = decomposer.decompose(config, instance.id);
```

## Python SDK Usage

```python
from minions_openclaw import InstanceManager, GatewayClient, SnapshotManager
import asyncio

# Register an instance
manager = InstanceManager()
instance = manager.register('my-gateway', 'ws://localhost:8080', 'token')

# Async: connect and fetch state
async def capture():
    client = GatewayClient(instance.fields['url'], token='token')
    await client.open_connection()
    presence = await client.fetch_presence()
    await client.close()

    snapshots = SnapshotManager()
    snapshot = snapshots.capture_snapshot(instance.id, presence)
    print(f'Snapshot: {snapshot.id}')

asyncio.run(capture())
```

## Architecture

```
minions-openclaw/
├── packages/
│   ├── core/          # TypeScript library (@minions-openclaw/core)
│   │   ├── src/
│   │   │   ├── types.ts           # MinionType definitions for all OpenClaw entities
│   │   │   ├── InstanceManager.ts # CRUD for gateway instances
│   │   │   ├── GatewayClient.ts   # WebSocket client (challenge/response auth)
│   │   │   ├── SnapshotManager.ts # Snapshot capture & diff
│   │   │   ├── ConfigDecomposer.ts# openclaw.json → minion tree
│   │   │   └── index.ts           # Public exports
│   │   └── test/                  # Jest tests
│   ├── cli/           # CLI tool (@minions-openclaw/cli)
│   │   └── src/commands/          # Commander.js commands
│   └── python/        # Python SDK (minions-openclaw)
│       ├── minions_openclaw/
│       └── tests/
├── apps/
│   └── docs/          # Astro Starlight documentation
├── examples/
│   ├── typescript/    # TypeScript usage examples
│   └── python/        # Python usage examples
└── spec/
    └── v0.1.md        # Technical specification
```

### Data Storage

Instances and snapshots are persisted to `~/.openclaw-manager/data.json` using the minions-sdk structured object format.

### Connection Protocol

The `GatewayClient` implements the OpenClaw WebSocket protocol:
1. Server sends `connect.challenge` with nonce + timestamp
2. Client signs challenge with RSA private key (or sends empty signature)
3. Server responds with `hello-ok` (or `hello-error`)
4. Client can then call methods via `{ type: "call", id, method, params }`

## Development Setup

```bash
# Clone the repo
git clone https://github.com/minions-openclaw/minions-openclaw.git
cd minions-openclaw

# Install all JS dependencies (workspaces)
npm install

# Build TypeScript packages
npm run build

# Run TypeScript tests
npm run test -w packages/core

# Python setup
cd packages/python
pip install -e ".[dev]"
pytest tests/ -v
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm test && cd packages/python && pytest`)
5. Commit your changes (`git commit -m 'feat: add my feature'`)
6. Push and open a Pull Request

## License

[GNU Affero General Public License v3.0](LICENSE) — see [LICENSE](LICENSE) for details.
