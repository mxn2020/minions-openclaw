---
title: Installation
description: Install the OpenClaw Manager CLI, TypeScript SDK, and Python SDK.
---

# Installation

## Prerequisites

- **Node.js** 20 or later
- **Python** 3.10 or later (for the Python SDK)
- A running [OpenClaw Gateway](https://github.com/mxn2020/openclaw) instance (for live commands)
- **pnpm** (recommended) or npm

## TypeScript / CLI

Install the CLI globally:

```bash
npm install -g @minions-openclaw/cli
# or
pnpm add -g @minions-openclaw/cli
```

Verify the installation:

```bash
openclaw-manager --version
```

Install the TypeScript core package in your project:

```bash
pnpm add @minions-openclaw/sdk
```

## Python SDK

```bash
pip install minions-openclaw
```

The Python SDK requires `minions-sdk>=0.2.0` and `websockets>=12.0`, which are installed automatically.

## From Source (monorepo)

If you are working in the `minions-ecosystem` monorepo:

```bash
cd minions-openclaw
pnpm install
pnpm build
```

To use the CLI directly from the built output:

```bash
node packages/cli/dist/index.js --help
```

## Storage

OpenClaw Manager stores all data in `~/.openclaw-manager/data.json`. No external database is required.
