---
title: Minion Types Reference
description: All 18 MinionType definitions used by minions-openclaw, with their key fields and descriptions.
---

## Overview

Every piece of data in `minions-openclaw` is stored as a typed minion. There are 18 built-in types, each corresponding to a distinct concept in the OpenClaw gateway. Types are registered via `TypeRegistry` at startup and drive UI rendering, validation, and config decomposition.

---

## openclaw-instance

Represents a registered OpenClaw Gateway endpoint.

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes | WebSocket URL (`ws://` or `wss://`) |
| `token` | string | no | Auth token after device registration |
| `deviceId` | string | no | Unique device identifier |
| `devicePublicKey` | string | no | RSA public key (PEM) |
| `devicePrivateKey` | string | no | RSA private key (PEM) — stored locally only |
| `status` | string | no | `'registered'`, `'connected'`, `'disconnected'`, `'error'` |
| `lastPingAt` | date | no | Timestamp of the most recent ping |
| `lastPingLatencyMs` | number | no | Round-trip latency of the last ping |
| `version` | string | no | Gateway version string |

---

## openclaw-snapshot

A point-in-time capture of a gateway's full running configuration.

| Field | Type | Required | Description |
|---|---|---|---|
| `instanceId` | string | yes | ID of the parent `openclaw-instance` |
| `capturedAt` | date | no | When the snapshot was taken |
| `config` | textarea | no | Full config JSON string |
| `agentCount` | number | no | Number of agents in the config |
| `channelCount` | number | no | Number of channels in the config |
| `modelCount` | number | no | Number of model providers in the config |

---

## openclaw-agent

An agent definition running on the gateway.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Agent name |
| `model` | string | yes | Model identifier (e.g., `gpt-4o`) |
| `systemPrompt` | textarea | no | System prompt text |
| `tools` | json | no | Array of tool names enabled for this agent |
| `channels` | json | no | Array of channel names the agent listens on |
| `skills` | json | no | Array of skill names the agent can invoke |
| `enabled` | boolean | no | Whether the agent is active |

---

## openclaw-channel

A communication channel for receiving input or sending output.

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes | Channel type: `'slack'`, `'webhook'`, `'websocket'`, `'cli'`, etc. |
| `name` | string | yes | Channel name (must be unique) |
| `config` | json | no | Channel-specific configuration object |
| `enabled` | boolean | no | Whether the channel is active |

---

## openclaw-model-provider

A model provider configuration (API key, base URL, model selection).

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | string | yes | Provider name: `'openai'`, `'anthropic'`, `'ollama'`, etc. |
| `model` | string | yes | Model identifier |
| `apiKey` | string | no | API key (omitted from snapshots if `redactSecrets` is set) |
| `baseUrl` | string | no | Custom base URL for self-hosted models |
| `enabled` | boolean | no | Whether this provider is active |

---

## openclaw-session-config

Session lifecycle settings for the gateway.

| Field | Type | Required | Description |
|---|---|---|---|
| `maxSessions` | number | no | Maximum concurrent sessions (0 = unlimited) |
| `sessionTimeout` | number | no | Session idle timeout in seconds |
| `persistSessions` | boolean | no | Whether sessions survive gateway restarts |

---

## openclaw-gateway-config

Network and TLS configuration for the gateway process itself.

| Field | Type | Required | Description |
|---|---|---|---|
| `host` | string | no | Bind host (default `0.0.0.0`) |
| `port` | number | no | WebSocket listen port (default `3000`) |
| `tlsEnabled` | boolean | no | Enable TLS |
| `certPath` | string | no | Path to TLS certificate file |
| `keyPath` | string | no | Path to TLS private key file |

---

## openclaw-skill

A reusable capability that agents can invoke.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Skill name (referenced by agents) |
| `description` | textarea | no | Human description of what the skill does |
| `enabled` | boolean | no | Whether the skill is available |
| `config` | json | no | Skill-specific configuration |

---

## openclaw-tool-config

An external tool integration (function call, MCP tool, etc.).

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Tool name (referenced in agent `tools` arrays) |
| `type` | string | yes | Tool type: `'function'`, `'mcp'`, `'builtin'` |
| `config` | json | no | Type-specific configuration |
| `enabled` | boolean | no | Whether the tool is registered |

---

## openclaw-talk-config

Voice / text-to-speech configuration for the gateway.

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | string | no | TTS provider: `'openai'`, `'elevenlabs'`, etc. |
| `voice` | string | no | Voice identifier |
| `enabled` | boolean | no | Whether voice output is active |

---

## openclaw-browser-config

Headless browser automation settings (Playwright / Puppeteer).

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | no | Whether browser automation is active |
| `headless` | boolean | no | Run browser in headless mode |
| `timeout` | number | no | Default navigation timeout in milliseconds |

---

## openclaw-hook

Webhook configuration — outbound HTTP calls triggered by gateway events.

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes | Destination URL for the webhook |
| `events` | json | no | Array of event names that trigger this hook |
| `secret` | string | no | HMAC secret for request signing |
| `enabled` | boolean | no | Whether the webhook is active |

---

## openclaw-cron-job

A scheduled task that runs on a cron schedule.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Job name |
| `schedule` | string | yes | Cron expression (e.g., `'0 */6 * * *'`) |
| `action` | string | yes | Action identifier to execute on schedule |
| `enabled` | boolean | no | Whether the job is scheduled |

---

## openclaw-discovery-config

mDNS / local network discovery settings.

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | no | Whether mDNS discovery is active |
| `port` | number | no | UDP port for mDNS announcements |
| `interfaces` | json | no | Network interfaces to announce on |

---

## openclaw-identity-config

Device identity settings — the gateway's own identification on the network.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | no | Human-readable device name |
| `deviceId` | string | no | Unique device identifier (auto-generated on first start) |
| `publicKey` | string | no | Gateway's RSA public key (PEM) |

---

## openclaw-canvas-config

Canvas visual UI settings.

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | no | Whether the Canvas UI is active |
| `port` | number | no | HTTP port for the Canvas UI |
| `authEnabled` | boolean | no | Require authentication to access Canvas |

---

## openclaw-logging-config

Log level, format, and output destination configuration.

| Field | Type | Required | Description |
|---|---|---|---|
| `level` | string | no | Log level: `'debug'`, `'info'`, `'warn'`, `'error'` |
| `format` | string | no | Log format: `'json'`, `'pretty'` |
| `outputs` | json | no | Array of output destinations (`'stdout'`, `'file'`, etc.) |

---

## openclaw-ui-config

Web UI configuration for the gateway's built-in management interface.

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | no | Whether the web UI is active |
| `port` | number | no | HTTP port for the web UI |
| `theme` | string | no | UI theme: `'light'`, `'dark'`, `'system'` |
