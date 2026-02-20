---
title: CLI Reference
description: All openclaw-manager commands with flags, examples, and expected output.
---

# CLI Reference

Install the CLI:

```bash
npm install -g @minions-openclaw/cli
```

```
Usage: openclaw-manager [command] [options]
```

---

## instance

Manage registered OpenClaw Gateway instances.

### `instance register <name>`

```
Options:
  --url <url>           WebSocket URL of the gateway (ws:// or wss://)  [required]
  --token <token>       Bearer auth token
  --private-key <pem>   RSA private key (PEM string) for device auth
  --public-key <pem>    RSA public key (PEM string)
```

```bash
openclaw-manager instance register home --url ws://localhost:3001 --token abc123
# Registered instance: home (id: abc-123-...)
```

### `instance list`

Lists all registered (non-deleted) instances.

```bash
openclaw-manager instance list
```

### `instance ping <id>`

Connects to the gateway, measures latency, and updates local storage.

```bash
openclaw-manager instance ping abc-123
# Ping successful — latency: 14ms, version: 1.4.2
```

### `instance remove <id>`

Soft-deletes an instance.

```bash
openclaw-manager instance remove abc-123
# Removed instance abc-123
```

---

## snapshot

Capture and query point-in-time gateway state.

### `snapshot capture <instanceId>`

Opens a live WebSocket connection, fetches presence data, and stores a snapshot.

```bash
openclaw-manager snapshot capture abc-123
# Snapshot captured: snap-456 (3 agents, 2 channels, 1 model)
```

### `snapshot list <instanceId>`

Lists all snapshots for an instance, newest first.

```bash
openclaw-manager snapshot list abc-123
```

### `snapshot show <snapshotId>`

Displays a single snapshot's fields.

```bash
openclaw-manager snapshot show snap-456
```

---

## config

Manage and compare gateway configurations.

### `config show <instanceId>`

Displays the config JSON from the latest snapshot.

```bash
openclaw-manager config show abc-123
```

### `config export <instanceId>`

Exports the config from the latest snapshot.

```
Options:
  --format <format>   Output format: json (default) or pretty
  --out <file>        Write output to file instead of stdout
```

```bash
openclaw-manager config export abc-123 --format pretty
openclaw-manager config export abc-123 --format pretty > backup.json
```

### `config import <instanceId>`

Imports and decomposes a config file into the instance's minion tree.

```
Options:
  --file <path>   Path to the config JSON file  [required]
```

```bash
openclaw-manager config import abc-123 --file openclaw.json
# Imported: 12 config items
```

### `config diff <snapshotId1> <snapshotId2>`

Shows field-level differences between two snapshots.

```bash
openclaw-manager config diff snap-456 snap-789
#   agentCount:
#     - 3
#     + 5
```

---

## Global Options

```
  --help        Show help
  --version     Show version
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0    | Success |
| 1    | Command error (instance not found, file not readable, etc.) |
