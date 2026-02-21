# minions-openclaw

Python SDK for managing OpenClaw Gateway instances with the Minions SDK.

## Installation

```bash
pip install minions-openclaw
```

## Quick Start

```python
from minions_openclaw import InstanceManager, SnapshotManager, GatewayClient

# Create an instance manager
manager = InstanceManager()

# Register a gateway instance
instance = manager.register("my-gateway", url="ws://localhost:8080")

# Take a snapshot  
snapshots = SnapshotManager()
snapshot = snapshots.capture(instance)

# Connect to a gateway
client = GatewayClient(url="ws://localhost:8080")
```

## Features

- **Instance Management** — Register, list, and manage OpenClaw Gateway instances
- **Snapshot System** — Capture, compare, and restore configuration snapshots
- **Config Decomposition** — Break down complex gateway configs into manageable sections
- **Gateway Client** — WebSocket-based client for real-time gateway communication

## Requirements

- Python >= 3.11
- minions-sdk >= 0.2.1

## License

AGPL-3.0
