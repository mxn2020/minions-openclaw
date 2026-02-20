# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-20

### Added
- **TypeScript SDK** (`@minions-openclaw/sdk`): Gateway management library
  - `InstanceManager` — register, connect, ping, disconnect, list, and remove gateway instances
  - `SnapshotManager` — capture, list, compare point-in-time gateway state snapshots
  - `ConfigDecomposer` — decompose/compose openclaw.json between flat config and minion tree
  - `GatewayClient` — authenticated WebSocket client with RSA challenge-response auth
  - 18 MinionType definitions covering all OpenClaw domain entities
  - File-based persistence in `~/.openclaw-manager/data.json`
- **Python SDK** (`minions-openclaw`): Complete Python port with async WebSocket support
  - `InstanceManager`, `SnapshotManager`, `ConfigDecomposer`, `GatewayClient`
  - All 18 type definitions matching TypeScript SDK
  - `asyncio`-compatible `GatewayClient` using `websockets` library
  - pytest + pytest-asyncio test suite
- **CLI** (`@minions-openclaw/cli`): Command-line interface for gateway management
  - `register` — register a new gateway instance
  - `list` — list all registered instances
  - `snapshot` — capture a snapshot of a gateway
  - `diff` — compare two snapshots
  - `connect` — establish a persistent connection
- **Documentation site**: Starlight-based docs with guides and API reference
- **Web dashboard**: Visual interface for managing gateway instances and snapshots
- **Examples**: TypeScript and Python usage examples

### Fixed
- Snapshot `follows` relation correctly links sequential snapshots
- Config decompose handles empty sections gracefully (no minions/relations created)

### Changed
- Python `requires-python` set to `>=3.11` to align with CI matrix
