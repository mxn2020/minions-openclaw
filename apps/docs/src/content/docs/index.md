---
title: Minions OpenClaw Manager
description: Manage, monitor, and version-control your OpenClaw Gateway instances using the minions structured object system.
---

# Minions OpenClaw Manager

**OpenClaw Manager** lets you register, monitor, snapshot, and configure [OpenClaw Gateway](https://github.com/mxn2020/openclaw) instances from a unified CLI, TypeScript SDK, or Python SDK.

Every piece of state — registered instances, configuration snapshots, agent definitions, channel settings — is stored as a **Minion** (a typed, versioned structured object), giving you full audit history and diff capabilities out of the box.

## Why OpenClaw Manager?

| Problem | Solution |
|---------|---------|
| No record of which config version is running | Snapshot capture stores the full gateway state as a linked version chain |
| Can't compare configs across time | `config diff` and `compare()` give field-level diffs instantly |
| Manual JSON wrangling to track agents/channels | Config decomposition maps every section into a typed Minion |
| Scattered CLI scripts for multi-instance ops | Unified `openclaw-manager` CLI manages all instances from one place |

## Key Features

- **Instance Registry** — register any OpenClaw Gateway with a URL, auth token, and optional RSA device key
- **Snapshot System** — capture point-in-time state (agents, channels, models, config) and traverse the version chain
- **Config Decomposition** — decompose a gateway config JSON into a typed minion tree and recompose it back
- **Config Diff** — compare any two configs or snapshots at the field level
- **TypeScript & Python SDKs** — full feature parity across both languages
- **WebSocket Protocol** — live connection to running gateways via the `GatewayClient`

## Quick Links

- [Installation](/getting-started/installation/) — set up in under 5 minutes
- [Quick Start](/getting-started/quick-start/) — register an instance and take your first snapshot
- [CLI Reference](/cli/) — every command with flags and examples
- [API Reference — TypeScript](/api/typescript/)
- [API Reference — Python](/api/python/)
