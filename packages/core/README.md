# @minions-openclaw/sdk

> TypeScript SDK for managing OpenClaw Gateway instances — register, snapshot, diff, and monitor your gateway fleet.

[![npm](https://img.shields.io/npm/v/@minions-openclaw/sdk.svg)](https://www.npmjs.com/package/@minions-openclaw/sdk)
[![PyPI](https://img.shields.io/pypi/v/minions-openclaw.svg)](https://pypi.org/project/minions-openclaw/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/mxn2020/minions-openclaw/blob/main/LICENSE)
[![CI](https://github.com/mxn2020/minions-openclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/mxn2020/minions-openclaw/actions/workflows/ci.yml)

---

## Overview

`@minions-openclaw/sdk` provides a TypeScript library for:

- **Multi-instance management** — register and manage a fleet of OpenClaw Gateway instances
- **Snapshot capture** — capture live state snapshots for audit and comparison
- **Config decomposition** — parse `openclaw.json` into structured minions with typed schemas
- **Diff & history** — compare snapshots over time to track configuration drift
- **Device authentication** — RSA-based device challenge/response authentication
- **WebSocket client** — full protocol implementation of the OpenClaw Gateway WS API

Built on [minions-sdk](https://www.npmjs.com/package/minions-sdk) for structured data management.

## Install

```bash
npm install @minions-openclaw/sdk
```

## Quick Start

```typescript
import { MinionsOpenClaw } from '@minions-openclaw/sdk';

const minions = new MinionsOpenClaw();

// Register an instance
const instance = await minions.openclaw.instances.register(
  'my-gateway', 'ws://localhost:8080', 'token'
);

// Connect and fetch live state
const client = minions.openclaw.createGatewayClient(
  instance.fields['url'] as string, 'token'
);
await client.openConnection();
const presence = await client.fetchPresence();
await client.close();

// Capture a snapshot
const snapshot = await minions.openclaw.snapshots.captureSnapshot(
  instance.id, presence
);

// Decompose a config file
const config = await minions.openclaw.config.loadFromFile('./openclaw.json');
const { minions: decomposed, relations } = minions.openclaw.config.decompose(
  config, instance.id
);
```

## Python SDK

A Python SDK is also available:

```bash
pip install minions-openclaw
```

```python
from minions_openclaw import MinionsOpenClaw

minions = MinionsOpenClaw()
instance = minions.openclaw.instances.register('my-gateway', 'ws://localhost:8080', 'token')
```

## API

| Export | Description |
|--------|-------------|
| `MinionsOpenClaw` | Unified client with instance, snapshot, config, and gateway management |
| `InstanceManager` | CRUD for gateway instances |
| `SnapshotManager` | Snapshot capture & diff |
| `ConfigDecomposer` | Parse `openclaw.json` into a minion tree |
| `GatewayClient` | WebSocket client with challenge/response auth |

## Related

- [`@minions-openclaw/cli`](https://www.npmjs.com/package/@minions-openclaw/cli) — CLI tool
- [`minions-sdk`](https://www.npmjs.com/package/minions-sdk) — core Minions SDK
- 📘 [Documentation](https://minions-openclaw.help)

## License

[MIT](https://github.com/mxn2020/minions-openclaw/blob/main/LICENSE) — Copyright (c) 2024 Mehdi Nabhani.
