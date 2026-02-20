---
title: Python API Reference
description: Full API reference for the minions-openclaw Python SDK — InstanceManager, GatewayClient, SnapshotManager, ConfigDecomposer.
---

# Python API Reference

```bash
pip install minions-openclaw
```

All classes mirror the TypeScript API with Python conventions (`snake_case` methods, async/await for I/O-bound operations).

---

## InstanceManager

```python
from minions_openclaw import InstanceManager

manager = InstanceManager()
```

### `register(name, url, token=None)`

```python
def register(self, name: str, url: str, token: Optional[str] = None) -> Minion
```

Creates and persists a new instance Minion. Raises `ValueError` if validation fails.

### `list()`

```python
def list(self) -> List[Minion]
```

Returns all non-deleted instance Minions.

### `get_by_id(id)`

```python
def get_by_id(self, id: str) -> Optional[Minion]
```

### `remove(id)`

```python
def remove(self, id: str) -> None
```

Soft-deletes the instance Minion. Raises `ValueError` if not found.

---

## GatewayClient

```python
from minions_openclaw import GatewayClient
import asyncio

client = GatewayClient(url='ws://localhost:3001', token='my-token', device_private_key=None)
```

All methods are **async** and must be called with `await`.

### `open_connection()`

```python
async def open_connection(self) -> None
```

Connects to the gateway WebSocket. Performs challenge-response auth if the gateway sends a `connect.challenge` message.

Requires: `pip install websockets`

For RSA signing: `pip install cryptography`

### `call(method, params=None)`

```python
async def call(self, method: str, params: Optional[Dict[str, Any]] = None) -> Any
```

### `fetch_presence()`

```python
async def fetch_presence(self) -> Dict[str, Any]
# Returns: { 'agents': [...], 'channels': [...], 'models': [...], 'config': {...} }
```

Fetches all four collections concurrently via `asyncio.gather`.

### `close()`

```python
async def close(self) -> None
```

### `device_token` (property)

```python
@property
def device_token(self) -> Optional[str]
```

### Full Usage Example

```python
import asyncio
from minions_openclaw import GatewayClient, SnapshotManager, InstanceManager

async def capture():
    instances = InstanceManager()
    instance = instances.register('home', 'ws://localhost:3001', token='token123')

    client = GatewayClient(instance.fields['url'], token=instance.fields.get('token'))
    await client.open_connection()
    presence = await client.fetch_presence()
    await client.close()

    snapshots = SnapshotManager()
    snap = snapshots.capture_snapshot(instance.id, presence)
    print(f'Snapshot: {snap.id}')

asyncio.run(capture())
```

---

## SnapshotManager

```python
from minions_openclaw import SnapshotManager

snapshots = SnapshotManager()
```

All methods are **synchronous** (file I/O only).

### `capture_snapshot(instance_id, gateway_data)`

```python
def capture_snapshot(self, instance_id: str, gateway_data: Dict[str, Any]) -> Minion
```

### `list_snapshots(instance_id)`

```python
def list_snapshots(self, instance_id: str) -> List[Dict[str, Any]]
```

### `get_history(instance_id)`

```python
def get_history(self, instance_id: str) -> List[Dict[str, Any]]
```

Returns snapshots in newest → oldest order by traversing the `follows` chain.

### `compare(snapshot_id1, snapshot_id2)`

```python
def compare(self, snapshot_id1: str, snapshot_id2: str) -> Dict[str, Dict[str, Any]]
# Returns: { 'fieldName': { 'from': old_value, 'to': new_value }, ... }
```

### `diff_snapshots(a, b)`

```python
def diff_snapshots(self, a: Minion, b: Minion) -> Dict[str, Dict[str, Any]]
```

Synchronous, takes `Minion` dataclass instances.

---

## ConfigDecomposer

```python
from minions_openclaw import ConfigDecomposer

decomposer = ConfigDecomposer()
```

### `load_from_file(path)`

```python
def load_from_file(self, path: str) -> Dict[str, Any]
```

### `decompose(config, parent_instance_id)`

```python
def decompose(self, config: Dict[str, Any], parent_instance_id: str) -> Tuple[List[Minion], List[Relation]]
```

### `compose(instance_id, storage=None)`

```python
def compose(self, instance_id: str, storage: Optional[Dict[str, Any]] = None) -> Dict[str, Any]
```

Reconstructs the config dict from persisted Minions.

### `diff(config_a, config_b)`

```python
def diff(self, config_a: Dict[str, Any], config_b: Dict[str, Any]) -> Dict[str, Any]
# Returns: { 'added': {...}, 'removed': {...}, 'changed': {...} }
```

### Example

```python
from minions_openclaw import ConfigDecomposer
import json

decomposer = ConfigDecomposer()
config_a = decomposer.load_from_file('openclaw-v1.json')
config_b = decomposer.load_from_file('openclaw-v2.json')

delta = decomposer.diff(config_a, config_b)
print('Added agents:', delta['added'].get('agents', []))
print('Changed gateway:', delta['changed'].get('gatewayConfig', {}))
```
