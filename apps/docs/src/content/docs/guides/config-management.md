---
title: Config Management
description: Export, import, and diff OpenClaw Gateway configurations using the CLI and SDK.
---

# Config Management

## Export

Export the last captured config for an instance:

```bash
openclaw-manager config export <instance-id>
```

With pretty-printing:

```bash
openclaw-manager config export <instance-id> --format pretty
```

Save to file:

```bash
openclaw-manager config export <instance-id> --format pretty > openclaw-backup.json
```

## Import

Import a config file and decompose it into the instance's minion tree:

```bash
openclaw-manager config import <instance-id> --file openclaw.json
```

Output:
```
Imported: 12 config items
```

This stores all agents, channels, model providers, etc. as individual Minions linked to the instance.

## Show Current Config

```bash
openclaw-manager config show <instance-id>
```

Displays the raw config JSON from the latest snapshot.

## Diff Two Snapshots

```bash
openclaw-manager config diff <snapshot-id-1> <snapshot-id-2>
```

Output:
```
  agentCount:
    - 3
    + 5
```

## TypeScript SDK

```typescript
import { ConfigDecomposer } from '@minions-openclaw/sdk';

const decomposer = new ConfigDecomposer();

// Load and decompose a config file
const config = await decomposer.loadFromFile('openclaw.json');
const { minions, relations } = decomposer.decompose(config, instanceId);
console.log(`Decomposed into ${minions.length} minions`);

// Compose config back from storage
const recomposed = await decomposer.compose(instanceId);
console.log(JSON.stringify(recomposed, null, 2));

// Diff two config files
const configA = await decomposer.loadFromFile('openclaw-v1.json');
const configB = await decomposer.loadFromFile('openclaw-v2.json');
const delta = decomposer.diff(configA, configB);

console.log('Added agents:', delta.added.agents ?? []);
console.log('Changed gateway port:', delta.changed.gatewayConfig);
```

## Python SDK

```python
from minions_openclaw import ConfigDecomposer

decomposer = ConfigDecomposer()

# Load and decompose
config = decomposer.load_from_file('openclaw.json')
minions, relations = decomposer.decompose(config, instance_id)
print(f'Decomposed into {len(minions)} minions')

# Compose back
recomposed = decomposer.compose(instance_id)
import json; print(json.dumps(recomposed, indent=2))

# Diff
config_a = decomposer.load_from_file('openclaw-v1.json')
config_b = decomposer.load_from_file('openclaw-v2.json')
delta = decomposer.diff(config_a, config_b)

print('Added agents:', delta['added'].get('agents', []))
print('Changed gateway config:', delta['changed'].get('gatewayConfig', {}))
```

## Full Workflow Example

```bash
# 1. Capture current state
openclaw-manager snapshot capture <instance-id>

# 2. Export current config for editing
openclaw-manager config export <instance-id> --format pretty > openclaw-edit.json

# 3. Edit openclaw-edit.json manually ...

# 4. Import updated config
openclaw-manager config import <instance-id> --file openclaw-edit.json

# 5. Capture again to record the change
openclaw-manager snapshot capture <instance-id>

# 6. Diff the two captures to verify
openclaw-manager config diff <snap-before-id> <snap-after-id>
```
