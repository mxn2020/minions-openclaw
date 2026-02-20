---
title: Config Schema Reference
description: Complete reference for the openclaw.json configuration file format and all its sections.
---

## Overview

`openclaw.json` is the single source of truth for a gateway's configuration. It is read on startup and can be updated at runtime via the management API or by editing the file and sending a `SIGHUP` to the gateway process.

All sections are optional. The gateway starts with sensible defaults for any omitted section.

---

## Top-level structure

```json
{
  "agents": [],
  "channels": [],
  "modelProviders": [],
  "skills": [],
  "tools": [],
  "sessionConfig": {},
  "gatewayConfig": {},
  "talkConfig": {},
  "browserConfig": {},
  "hooks": [],
  "cronJobs": [],
  "discoveryConfig": {},
  "identityConfig": {},
  "canvasConfig": {},
  "loggingConfig": {},
  "uiConfig": {}
}
```

---

## agents

An array of agent definitions. Each agent binds a model to a set of channels, tools, and skills.

```json
{
  "agents": [
    {
      "name": "support-bot",
      "model": "gpt-4o",
      "systemPrompt": "You are a helpful support agent.",
      "tools": ["web-search", "ticket-lookup"],
      "channels": ["slack-support"],
      "skills": ["summarize"],
      "enabled": true
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Unique agent name |
| `model` | string | yes | Model identifier matching a `modelProviders` entry |
| `systemPrompt` | string | no | System prompt text |
| `tools` | string[] | no | Tool names from the `tools` section |
| `channels` | string[] | no | Channel names from the `channels` section |
| `skills` | string[] | no | Skill names from the `skills` section |
| `enabled` | boolean | no | Default: `true` |

---

## channels

Input/output channels the gateway listens on.

```json
{
  "channels": [
    {
      "type": "slack",
      "name": "slack-support",
      "config": {
        "botToken": "xoxb-...",
        "signingSecret": "abc123"
      },
      "enabled": true
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes | `'slack'`, `'webhook'`, `'websocket'`, `'cli'`, `'discord'` |
| `name` | string | yes | Unique channel name |
| `config` | object | no | Channel-type-specific options |
| `enabled` | boolean | no | Default: `true` |

---

## modelProviders

LLM provider configurations.

```json
{
  "modelProviders": [
    {
      "provider": "openai",
      "model": "gpt-4o",
      "apiKey": "sk-...",
      "enabled": true
    },
    {
      "provider": "ollama",
      "model": "llama3",
      "baseUrl": "http://localhost:11434",
      "enabled": true
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | string | yes | `'openai'`, `'anthropic'`, `'ollama'`, `'groq'`, `'azure-openai'` |
| `model` | string | yes | Model identifier |
| `apiKey` | string | no | API key (use env var references: `"$OPENAI_API_KEY"`) |
| `baseUrl` | string | no | Override the default API base URL |
| `enabled` | boolean | no | Default: `true` |

---

## skills

Reusable capabilities available to agents.

```json
{
  "skills": [
    {
      "name": "summarize",
      "description": "Summarizes long text into bullet points.",
      "enabled": true,
      "config": {}
    }
  ]
}
```

---

## tools

External tool integrations (function calls, MCP tools).

```json
{
  "tools": [
    {
      "name": "web-search",
      "type": "mcp",
      "config": { "serverUrl": "http://localhost:5010" },
      "enabled": true
    }
  ]
}
```

---

## sessionConfig

```json
{
  "sessionConfig": {
    "maxSessions": 100,
    "sessionTimeout": 3600,
    "persistSessions": false
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `maxSessions` | number | `0` (unlimited) | Maximum concurrent sessions |
| `sessionTimeout` | number | `3600` | Idle timeout in seconds |
| `persistSessions` | boolean | `false` | Restore sessions on restart |

---

## gatewayConfig

```json
{
  "gatewayConfig": {
    "host": "0.0.0.0",
    "port": 3000,
    "tlsEnabled": false,
    "certPath": "/etc/ssl/certs/gateway.crt",
    "keyPath": "/etc/ssl/private/gateway.key"
  }
}
```

---

## talkConfig

```json
{
  "talkConfig": {
    "provider": "openai",
    "voice": "alloy",
    "enabled": false
  }
}
```

---

## browserConfig

```json
{
  "browserConfig": {
    "enabled": false,
    "headless": true,
    "timeout": 30000
  }
}
```

---

## hooks

```json
{
  "hooks": [
    {
      "url": "https://example.com/webhooks/openclaw",
      "events": ["session.start", "session.end", "agent.error"],
      "secret": "my-hmac-secret",
      "enabled": true
    }
  ]
}
```

---

## cronJobs

```json
{
  "cronJobs": [
    {
      "name": "daily-report",
      "schedule": "0 9 * * *",
      "action": "reports.generate",
      "enabled": true
    }
  ]
}
```

---

## discoveryConfig

```json
{
  "discoveryConfig": {
    "enabled": true,
    "port": 5353,
    "interfaces": ["en0", "eth0"]
  }
}
```

---

## identityConfig

```json
{
  "identityConfig": {
    "name": "office-gateway",
    "deviceId": "dev_01HXYZ...",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```

---

## canvasConfig

```json
{
  "canvasConfig": {
    "enabled": true,
    "port": 4000,
    "authEnabled": true
  }
}
```

---

## loggingConfig

```json
{
  "loggingConfig": {
    "level": "info",
    "format": "json",
    "outputs": ["stdout", { "type": "file", "path": "/var/log/openclaw.log" }]
  }
}
```

---

## uiConfig

```json
{
  "uiConfig": {
    "enabled": true,
    "port": 8080,
    "theme": "dark"
  }
}
```

---

## Environment variable references

String field values prefixed with `$` are resolved from environment variables at startup:

```json
{
  "modelProviders": [
    { "provider": "openai", "model": "gpt-4o", "apiKey": "$OPENAI_API_KEY" }
  ]
}
```

This prevents secrets from being stored in plaintext in the config file.
