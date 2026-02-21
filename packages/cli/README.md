# @minions-openclaw/cli

> CLI tool for managing OpenClaw Gateway instances — register, snapshot, diff, and monitor from the terminal.

[![npm](https://img.shields.io/npm/v/@minions-openclaw/cli.svg)](https://www.npmjs.com/package/@minions-openclaw/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/mxn2020/minions-openclaw/blob/main/LICENSE)

---

## Install

```bash
npm install -g @minions-openclaw/cli
```

## Commands

```
openclaw-manager [command] [options]

COMMANDS:
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

## Usage Examples

### Register a gateway

```bash
openclaw-manager register my-gateway --url ws://192.168.1.100:8080 --token mytoken
```

### Capture a snapshot

```bash
openclaw-manager snapshot <instanceId>
```

### Diff two snapshots

```bash
openclaw-manager config diff <snapshot-id-1> <snapshot-id-2>
```

### List agents on a gateway

```bash
openclaw-manager agents <instanceId>
```

## Related

- [`@minions-openclaw/sdk`](https://www.npmjs.com/package/@minions-openclaw/sdk) — TypeScript SDK
- [`minions-sdk`](https://www.npmjs.com/package/minions-sdk) — core Minions SDK
- 📘 [Documentation](https://minions-openclaw.help)

## License

[MIT](https://github.com/mxn2020/minions-openclaw/blob/main/LICENSE) — Copyright (c) 2024 Mehdi Nabhani.
