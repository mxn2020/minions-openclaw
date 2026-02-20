---
title: Config Decomposition
description: How OpenClaw Manager maps an openclaw.json config file to a minion tree — and back.
---

# Config Decomposition

**Config decomposition** is the process of converting a flat `openclaw.json` configuration file into a structured **minion tree** where every section becomes a typed Minion with a `parent_of` relation to its instance.

## Why Decompose?

A raw JSON file is opaque — you can't diff two configs at the section level, and you can't query "which instances have more than 3 agents". By decomposing into Minions:

- Every agent, channel, model provider, skill, etc. becomes a queryable, typed record
- Field-level diffs are automatic via `ConfigDecomposer.diff()`
- The full config can be recomposed from the tree at any time via `compose()`

## Decomposition Mapping

| Config key | Minion type | Cardinality |
|-----------|-------------|-------------|
| `agents[]` | `openclaw-agent` | array |
| `channels[]` | `openclaw-channel` | array |
| `modelProviders[]` | `openclaw-model-provider` | array |
| `skills[]` | `openclaw-skill` | array |
| `tools[]` | `openclaw-tool-config` | array |
| `hooks[]` | `openclaw-hook` | array |
| `cronJobs[]` | `openclaw-cron-job` | array |
| `sessionConfig` | `openclaw-session-config` | singleton |
| `gatewayConfig` | `openclaw-gateway-config` | singleton |
| `talkConfig` | `openclaw-talk-config` | singleton |
| `browserConfig` | `openclaw-browser-config` | singleton |
| `discoveryConfig` | `openclaw-discovery-config` | singleton |
| `identityConfig` | `openclaw-identity-config` | singleton |
| `canvasConfig` | `openclaw-canvas-config` | singleton |
| `loggingConfig` | `openclaw-logging-config` | singleton |
| `uiConfig` | `openclaw-ui-config` | singleton |

JSON-array fields (like `tools`, `channels`, `skills` within an agent) are stringified when stored and parsed back on `compose()`.

## Example

Given `openclaw.json`:

```json
{
  "agents": [{ "name": "assistant", "model": "gpt-4o", "enabled": true }],
  "gatewayConfig": { "host": "0.0.0.0", "port": 3001, "tlsEnabled": false }
}
```

`decompose()` produces:
- 1 Minion of type `openclaw-agent` with title `assistant`
- 1 Minion of type `openclaw-gateway-config` with title `Gateway Config`
- 2 `parent_of` relations linking them to the instance

`compose()` reverses the process, reconstructing the original config structure.

## Diff

```typescript
const decomposer = new ConfigDecomposer();
const configA = await decomposer.loadFromFile('openclaw-v1.json');
const configB = await decomposer.loadFromFile('openclaw-v2.json');
const delta = decomposer.diff(configA, configB);
// { added: { agents: [...] }, removed: {}, changed: { gatewayConfig: { port: { from: 3001, to: 3002 } } } }
```
