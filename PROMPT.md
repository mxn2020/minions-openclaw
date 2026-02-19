**MINIONS OPENCLAW — OPENCLAW INSTANCE MANAGER**

You are tasked with creating the complete initial foundation for **minions-openclaw** — a structured management layer for [OpenClaw](https://github.com/openclaw/openclaw) instances, built on the Minions SDK. OpenClaw is an open-source personal AI assistant by [@steipete](https://github.com/steipete) that runs on your own devices and connects to messaging channels like WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Microsoft Teams, Google Chat, and more.

---

**PROJECT OVERVIEW**

`minions-openclaw` lets users register, configure, monitor, and manage one or more OpenClaw Gateway instances using structured minions. Each instance's full configuration — agents, channels, models, tools, sessions, skills, plugins, gateway settings, and more — is modeled as a tree of related minions, giving you version history, validation, diff, and migration capabilities on top of OpenClaw's `~/.openclaw/openclaw.json` configuration file.

The core value proposition: instead of hand-editing a large JSON config file, you model the entire OpenClaw configuration as structured, validated, relatable minions. This enables programmatic management, multi-instance orchestration, configuration snapshots, rollback, and A/B testing of agent configurations.

---

**CONCEPT OVERVIEW**

This project is built on the Minions SDK (`minions-sdk`), which provides the foundational primitives: Minion (structured object instance), Minion Type (schema), and Relation (typed link between minions).

An OpenClaw instance's configuration is decomposed into a tree of minion types mirroring the `openclaw.json` schema: a root `openclaw-instance` minion relates to child `openclaw-agent`, `openclaw-channel`, `openclaw-model-provider`, `openclaw-tool-config`, `openclaw-session`, `openclaw-skill`, `openclaw-plugin`, `openclaw-gateway`, and other configuration minions via `parent_of` relations. Configuration snapshots are captured as `openclaw-snapshot` minions linked via `follows` relations, enabling full version history.

The system supports both TypeScript and Python SDKs with cross-language interoperability (both serialize to the same JSON format). All documentation includes dual-language code examples with tabbed interfaces.

---

**MINIONS SDK REFERENCE — REQUIRED DEPENDENCY**

This project depends on `minions-sdk`, a published package that provides the foundational primitives. The GH Agent building this project MUST install it from the public registries and use the APIs documented below — do NOT reimplement minions primitives from scratch.

**Installation:**
```bash
# TypeScript (npm)
npm install minions-sdk
# or: pnpm add minions-sdk

# Python (PyPI)
pip install minions-sdk
```

**TypeScript SDK — Core Imports:**
```typescript
import {
  // Types
  type Minion, type MinionType, type Relation,
  type FieldDefinition, type FieldValidation, type FieldType,
  type CreateMinionInput, type UpdateMinionInput, type CreateRelationInput,
  type MinionStatus, type MinionPriority, type RelationType,
  type ExecutionResult, type Executable,
  type ValidationError, type ValidationResult,

  // Validation
  validateField, validateFields,

  // Built-in Schemas (10 types)
  noteType, linkType, fileType, contactType,
  agentType, teamType, thoughtType, promptTemplateType, testCaseType, taskType,
  builtinTypes,

  // Registry
  TypeRegistry,

  // Relations
  RelationGraph,

  // Lifecycle
  createMinion, updateMinion, softDelete, hardDelete, restoreMinion,

  // Evolution
  migrateMinion,

  // Utilities
  generateId, now, SPEC_VERSION,
} from 'minions-sdk';
```

**Python SDK — Core Imports:**
```python
from minions import (
    # Types
    Minion, MinionType, Relation, FieldDefinition, FieldValidation,
    CreateMinionInput, UpdateMinionInput, CreateRelationInput,
    ExecutionResult, Executable, ValidationError, ValidationResult,
    # Validation
    validate_field, validate_fields,
    # Built-in Schemas (10 types)
    note_type, link_type, file_type, contact_type,
    agent_type, team_type, thought_type, prompt_template_type,
    test_case_type, task_type, builtin_types,
    # Registry
    TypeRegistry,
    # Relations
    RelationGraph,
    # Lifecycle
    create_minion, update_minion, soft_delete, hard_delete, restore_minion,
    # Evolution
    migrate_minion,
    # Utilities
    generate_id, now, SPEC_VERSION,
)
```

**Key Concepts:**
- A `MinionType` defines a schema (list of `FieldDefinition`s) for a kind of minion
- A `Minion` is an instance of a `MinionType` with `id`, `title`, `minionTypeId`, `fields`, timestamps
- A `Relation` is a typed directional link between two minions (12 types: `parent_of`, `depends_on`, `implements`, `relates_to`, `inspired_by`, `triggers`, `references`, `blocks`, `alternative_to`, `part_of`, `follows`, `integration_link`)
- `TypeRegistry` stores and retrieves `MinionType`s by id or slug
- `RelationGraph` manages relations with traversal utilities (`getChildren`, `getParents`, `getTree`, `getNetwork`)
- `createMinion(input, type)` validates fields and returns `(minion, validation)`
- All field types: `string`, `number`, `boolean`, `date`, `select`, `multi-select`, `url`, `email`, `textarea`, `tags`, `json`, `array`
- The `_legacy` namespace preserves removed field data during schema evolution

**Creating Custom MinionTypes for this project:**
```typescript
// TypeScript
const openclawInstanceType = new MinionType({
  id: 'openclaw-instance',
  name: 'OpenClaw Instance',
  slug: 'openclaw-instance',
  schema: [
    { name: 'url', type: 'url', label: 'Gateway URL', required: true },
    { name: 'token', type: 'string', label: 'Auth Token' },
    { name: 'status', type: 'select', label: 'Status', options: ['unknown', 'online', 'offline', 'pairing'] },
    { name: 'protocolVersion', type: 'string', label: 'Protocol Version' },
    { name: 'lastSeenAt', type: 'date', label: 'Last Seen' },
  ],
  isSystem: false,
});
const registry = new TypeRegistry();
registry.register(openclawInstanceType);
const { minion, validation } = createMinion(
  { title: 'Home Server', fields: { url: 'ws://192.168.1.10:18789', status: 'unknown' } },
  openclawInstanceType,
);
```
```python
# Python
from minions import MinionType, FieldDefinition, TypeRegistry, create_minion

openclaw_instance_type = MinionType(
    id="openclaw-instance",
    name="OpenClaw Instance",
    slug="openclaw-instance",
    schema=[
        FieldDefinition(name="url", type="url", label="Gateway URL", required=True),
        FieldDefinition(name="token", type="string", label="Auth Token"),
        FieldDefinition(name="status", type="select", label="Status", options=["unknown", "online", "offline", "pairing"]),
        FieldDefinition(name="protocolVersion", type="string", label="Protocol Version"),
        FieldDefinition(name="lastSeenAt", type="date", label="Last Seen"),
    ],
)
registry = TypeRegistry()
registry.register(openclaw_instance_type)
minion, validation = create_minion(
    {"title": "Home Server", "fields": {"url": "ws://192.168.1.10:18789", "status": "unknown"}},
    openclaw_instance_type,
)
```

**Cross-SDK JSON Interop:**
Both SDKs serialize to identical camelCase JSON. TypeScript uses `camelCase` natively; Python provides `to_dict()` / `from_dict()` methods that handle `snake_case ↔ camelCase` conversion automatically.

**IMPORTANT:** Do NOT recreate these primitives. Import them from `minions-sdk` (npm) / `minions` (PyPI). Build your domain-specific types and utilities ON TOP of the SDK.

---

**CORE PRIMITIVES**

This project defines the following Minion Types, mapping the full OpenClaw `openclaw.json` configuration schema into structured minions:

### Instance & Snapshot

- **`openclaw-instance`** — A registered OpenClaw Gateway instance with connection details and live status
- **`openclaw-snapshot`** — A point-in-time capture of an instance's live state (agents, models, channels, nodes, presence)
- **`openclaw-config`** — The root configuration object (`openclaw.json`) for an instance, linking to all sub-configuration minions

### Agents

- **`openclaw-agent`** — An agent definition within an OpenClaw instance (from `agents.list[]`), with identity, model, workspace, sandbox, tools, and subagent settings
- **`openclaw-agent-defaults`** — Default agent settings applied to all agents (`agents.defaults`): workspace, model, heartbeat, compaction, context pruning, sandbox, block streaming, typing indicators
- **`openclaw-agent-identity`** — Agent identity configuration: name, theme, emoji, avatar
- **`openclaw-agent-binding`** — Channel-to-agent routing binding (from `agents.bindings[]`): match criteria, access profiles

### Channels

- **`openclaw-channel`** — A messaging channel configuration (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, BlueBubbles, Microsoft Teams, Matrix, Mattermost, Zalo, WebChat)
- **`openclaw-channel-whatsapp`** — WhatsApp-specific config: Baileys integration, phone number, data directory
- **`openclaw-channel-telegram`** — Telegram-specific config: bot token, grammY integration
- **`openclaw-channel-slack`** — Slack-specific config: Bolt integration, app token, bot token, signing secret
- **`openclaw-channel-discord`** — Discord-specific config: discord.js integration, bot token, guild settings
- **`openclaw-channel-googlechat`** — Google Chat-specific config: Chat API, service account
- **`openclaw-channel-signal`** — Signal-specific config: signal-cli integration, phone number
- **`openclaw-channel-imessage`** — iMessage/BlueBubbles-specific config
- **`openclaw-channel-msteams`** — Microsoft Teams-specific config
- **`openclaw-channel-matrix`** — Matrix-specific config: homeserver, access token

### Models & Providers

- **`openclaw-model-provider`** — A model provider configuration (Anthropic, OpenAI, Google, custom): base URL, API key, model list
- **`openclaw-model`** — A specific model entry: provider, model ID, display name, capabilities

### Sessions

- **`openclaw-session-config`** — Session management settings: scope, DM scope, identity links, reset policies, maintenance, send policy
- **`openclaw-session-reset`** — Session reset policy: mode (daily/idle), schedule, triggers

### Tools

- **`openclaw-tool-config`** — Tool configuration root: profiles, groups, allow/deny lists, elevated tools, execution settings
- **`openclaw-tool-profile`** — A named tool profile (e.g., `coding`, `research`): bundled tool sets
- **`openclaw-tool-exec`** — Tool execution settings: shell, timeout, working directory
- **`openclaw-tool-web`** — Web tool settings: search engine, API keys
- **`openclaw-tool-media`** — Media tool settings: image generation, transcription
- **`openclaw-tool-subagent`** — Subagent tool settings: delegation, spawning rules
- **`openclaw-tool-loop-detection`** — Tool loop detection settings: max iterations, cooldown

### Skills & Plugins

- **`openclaw-skill`** — A skill entry in the skills registry: enabled, API key, environment variables, bundled/managed/workspace classification
- **`openclaw-skill-config`** — Global skill settings: allowed bundled skills, load directories, install preferences
- **`openclaw-plugin`** — A plugin entry: enabled, config, load paths
- **`openclaw-plugin-config`** — Global plugin settings: allow/deny lists, load paths

### Gateway

- **`openclaw-gateway-config`** — Gateway server settings: mode (local/remote), port, bind address, auth, Tailscale, Control UI, remote connection, trusted proxies
- **`openclaw-gateway-auth`** — Gateway authentication: mode (none/token/password/trusted-proxy), token, rate limiting
- **`openclaw-gateway-tailscale`** — Tailscale integration: mode (off/serve/funnel), reset on exit
- **`openclaw-gateway-control-ui`** — Control UI settings: enabled, base path

### Messages & Talk

- **`openclaw-message-config`** — Message handling: response prefix, ack reaction, inbound debounce, TTS settings
- **`openclaw-talk-config`** — Talk (voice/TTS) settings: ElevenLabs voice ID, model, output format, API key, voice aliases, interrupt on speech

### Browser

- **`openclaw-browser-config`** — Browser control settings: enabled, evaluate enabled, default profile, profiles (CDP ports, colors), executable path, headless mode

### Hooks & Cron

- **`openclaw-hook`** — Webhook/event hook configuration (e.g., Gmail integration)
- **`openclaw-cron-job`** — Scheduled job configuration: schedule, agent, command, enabled

### Identity, Canvas & Logging

- **`openclaw-identity-config`** — Instance-level identity: name, theme, emoji, avatar, owner metadata
- **`openclaw-canvas-config`** — Canvas/A2UI host settings: enabled, port, allowed origins, sandbox mode
- **`openclaw-logging-config`** — Log configuration: log level, format, file output, rotation

### Discovery & Environment

- **`openclaw-discovery-config`** — Network discovery settings: mDNS/Bonjour, DNS-SD
- **`openclaw-env-config`** — Environment variable configuration: inline env vars, env var substitution, auth storage

### UI

- **`openclaw-ui-config`** — UI settings: seam color, assistant name/avatar overrides

---

**FIELD SCHEMAS**

Define these Minion Types with full JSON Schema definitions:

**`openclaw-instance`**
```typescript
{
  id: string;
  title: string;                       // User-friendly label (e.g., "Home Server", "VPS")
  url: string;                         // Gateway WebSocket URL (e.g., ws://192.168.1.10:18789)
  token?: string;                      // Optional gateway auth token
  deviceId?: string;                   // Stable fingerprint generated on first connect
  devicePublicKey?: string;            // Base64 encoded public key for signing challenge nonces
  deviceToken?: string;                // Device token returned by hello-ok.auth.deviceToken
  status: 'unknown' | 'online' | 'offline' | 'pairing';
  lastCheckedAt?: Date;
  lastSeenAt?: Date;
  protocolVersion?: string;            // Negotiated protocol version
  sortOrder?: number;                  // Sidebar ordering
  createdAt: Date;
  updatedAt: Date;
}
```

**`openclaw-snapshot`**
```typescript
{
  id: string;
  title: string;                       // e.g., "Snapshot 2025-02-19T18:30:00Z"
  agents: object[];                    // [{ id, name, model, application, bindings[] }]
  models: object[];                    // [{ id, provider, name }]
  channels: object[];                  // [{ id, type, accountId, status }]
  nodes: object[];                     // [{ deviceId, roles[], scopes[], caps[], platform }]
  presence: object[];                  // Raw presence entries from system-presence
  snapshotAt: Date;
  error?: string;                      // Last fetch error
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `references` → `openclaw-instance` (which instance this snapshot belongs to)
Relations: `follows` → previous `openclaw-snapshot` (version chain)

**`openclaw-agent`**
```typescript
{
  id: string;
  title: string;                       // Agent display name
  agentId: string;                     // Stable agent id (e.g., "main")
  isDefault: boolean;                  // Whether this is the default agent
  model: string;                       // Model string (e.g., "anthropic/claude-opus-4-6")
  modelFallbacks?: string[];           // Fallback model list
  workspace?: string;                  // Agent workspace path
  agentDir?: string;                   // Agent directory path
  groupChat?: object;                  // { mentionPatterns[] }
  sandbox?: object;                    // { mode: "off" | "non-main" | "always", ... }
  subagents?: object;                  // { allowAgents[] }
  tools?: object;                      // { profile, allow[], deny[], elevated: { enabled } }
  skipBootstrap?: boolean;
  bootstrapMaxChars?: number;
  imageMaxDimensionPx?: number;
  userTimezone?: string;
  timeFormat?: string;
  heartbeat?: object;                  // { enabled, intervalMs }
  compaction?: object;                 // { enabled, ... }
  contextPruning?: object;            // { enabled, ... }
  blockStreaming?: object;             // { enabled, minBlocks }
  typingIndicators?: object;           // { enabled }
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `parent_of` → `openclaw-agent-identity`, `openclaw-tool-config`
Relations: `part_of` → `openclaw-instance`

**`openclaw-channel`**
```typescript
{
  id: string;
  title: string;                       // e.g., "WhatsApp", "Telegram"
  channelType: 'whatsapp' | 'telegram' | 'slack' | 'discord' | 'googlechat' | 'signal' | 'imessage' | 'bluebubbles' | 'msteams' | 'matrix' | 'mattermost' | 'zalo' | 'zalo-personal' | 'webchat';
  enabled: boolean;
  accountId?: string;                  // Multi-account support
  dmPolicy?: 'pairing' | 'open';      // DM access policy
  allowFrom?: string[];                // Allowed sender list
  groupPolicy?: string;               // Group chat handling
  mentionPatterns?: string[];          // Patterns that trigger the bot in groups
  config?: object;                     // Channel-specific configuration (token, phone, etc.)
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-model-provider`**
```typescript
{
  id: string;
  title: string;                       // e.g., "Anthropic", "OpenAI", "Google"
  providerId: string;                  // e.g., "anthropic", "openai", "google"
  baseUrl?: string;                    // Custom API base URL
  apiKey?: string;                     // Provider API key (env var reference)
  models?: string[];                   // Available model IDs
  isCustom: boolean;                   // Whether this is a user-defined provider
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-session-config`**
```typescript
{
  id: string;
  title: string;
  scope: string;                       // "per-sender"
  dmScope: 'main' | 'per-peer' | 'per-channel-peer' | 'per-account-channel-peer';
  identityLinks?: object;             // { canonical_id: ["provider:peer_id", ...] }
  resetMode: 'daily' | 'idle';
  resetAtHour?: number;                // Hour for daily reset
  resetIdleMinutes?: number;           // Minutes for idle reset
  resetTriggers?: string[];            // e.g., ["/new", "/reset"]
  store?: string;                      // Session store path
  maintenance?: object;               // { mode, pruneAfter, maxEntries, rotateBytes }
  agentToAgent?: object;              // { maxPingPongTurns }
  sendPolicy?: object;                // { rules[], default }
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-gateway-config`**
```typescript
{
  id: string;
  title: string;
  mode: 'local' | 'remote';
  port: number;                        // Default: 18789
  bind: 'auto' | 'loopback' | 'lan' | 'tailnet' | string;
  authMode: 'none' | 'token' | 'password' | 'trusted-proxy';
  authToken?: string;
  authAllowTailscale?: boolean;
  rateLimit?: object;                  // { maxAttempts, windowMs, lockoutMs, exemptLoopback }
  tailscaleMode: 'off' | 'serve' | 'funnel';
  tailscaleResetOnExit?: boolean;
  controlUiEnabled?: boolean;
  controlUiBasePath?: string;          // Default: "/openclaw"
  remoteUrl?: string;                  // For remote mode
  remoteTransport?: 'ssh' | 'direct';
  trustedProxies?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-skill`**
```typescript
{
  id: string;
  title: string;                       // Skill name (e.g., "gemini", "peekaboo")
  skillKey: string;                    // Registry key
  enabled: boolean;
  apiKey?: string;                     // Convenience primary API key
  env?: object;                        // { ENV_VAR_NAME: "value" }
  category: 'bundled' | 'managed' | 'workspace';
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-tool-config`**
```typescript
{
  id: string;
  title: string;
  profile?: string;                    // Named profile (e.g., "coding", "research")
  allowedTools?: string[];             // Tool allowlist
  deniedTools?: string[];              // Tool denylist
  elevatedEnabled?: boolean;           // Elevated tool prompting
  execShell?: string;                  // Shell for tool execution
  execTimeout?: number;                // Execution timeout in ms
  loopDetection?: object;             // { maxIterations, cooldownMs }
  webSearchEngine?: string;            // Search engine for web tool
  mediaConfig?: object;               // Image generation, transcription settings
  subagentConfig?: object;            // Delegation and spawning rules
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance` or `openclaw-agent`

**`openclaw-talk-config`**
```typescript
{
  id: string;
  title: string;
  voiceId?: string;                    // ElevenLabs voice ID
  voiceAliases?: object;              // { friendly_name: "elevenlabs_id" }
  modelId?: string;                    // e.g., "eleven_v3"
  outputFormat?: string;               // e.g., "mp3_44100_128"
  apiKey?: string;                     // ElevenLabs API key
  interruptOnSpeech?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-browser-config`**
```typescript
{
  id: string;
  title: string;
  enabled: boolean;
  evaluateEnabled?: boolean;
  defaultProfile?: string;             // e.g., "chrome"
  profiles?: object;                   // { name: { cdpPort, cdpUrl, color } }
  headless?: boolean;
  noSandbox?: boolean;
  executablePath?: string;
  attachOnly?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-hook`**
```typescript
{
  id: string;
  title: string;
  hookType: string;                    // e.g., "gmail"
  enabled: boolean;
  config?: object;                     // Hook-specific configuration
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-cron-job`**
```typescript
{
  id: string;
  title: string;
  schedule: string;                    // Cron expression
  agentId?: string;                    // Target agent
  command: string;                     // Command to execute
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-discovery-config`**
```typescript
{
  id: string;
  title: string;
  mdnsEnabled?: boolean;               // mDNS/Bonjour
  dnssdEnabled?: boolean;              // Wide-area DNS-SD
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-identity-config`**
```typescript
{
  id: string;
  title: string;
  name?: string;                       // Instance display name (e.g., "Samantha")
  theme?: string;                      // Identity theme (e.g., "helpful sloth")
  emoji?: string;                      // Identity emoji (e.g., "🦥")
  avatar?: string;                     // Avatar: workspace-relative path, http(s) URL, or data: URI
  owner?: string;                      // Owner name or identifier
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-canvas-config`**
```typescript
{
  id: string;
  title: string;
  enabled?: boolean;                   // Whether Canvas/A2UI host is active
  port?: number;                       // Canvas host port (derived from gateway.port, default 18791)
  allowedOrigins?: string[];           // CORS origins for canvas connections
  sandboxMode?: string;                // Canvas sandbox mode
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-logging-config`**
```typescript
{
  id: string;
  title: string;
  level?: 'debug' | 'info' | 'warn' | 'error'; // Log level
  format?: 'json' | 'text';           // Log output format
  file?: string;                       // Log file path
  rotate?: boolean;                    // Whether to rotate log files
  maxSize?: string;                    // Max log file size (e.g., "10mb")
  maxFiles?: number;                   // Max number of rotated log files
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

**`openclaw-ui-config`**
```typescript
{
  id: string;
  title: string;
  seamColor?: string;                  // Accent color for native app UI chrome
  assistantName?: string;              // Control UI identity override
  assistantAvatar?: string;            // Emoji, short text, image URL, or data URI
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `part_of` → `openclaw-instance`

---

**WHAT YOU NEED TO CREATE**

**1. THE SPECIFICATION** (`/spec`)

Write a complete markdown specification document covering:

- Motivation — why structured management of OpenClaw instances matters
- Glossary of terms: Gateway, Channel, Agent, Skill, Plugin, Session, Node, Presence
- Core type definitions for all OpenClaw minion types with full field schemas
- Relation patterns — how instances relate to agents, channels, models, tools, etc.
- Gateway WebSocket protocol overview — connect, challenge/response, hello-ok handshake
- Configuration decomposition — how `openclaw.json` maps to minion types
- Snapshot semantics — point-in-time captures vs live state
- Multi-instance management patterns
- Security considerations — token management, device pairing, DM policies
- Conformance checklist for implementations

**2. THE CORE LIBRARY** (`/packages/core`)

A framework-agnostic TypeScript library built on `minions-sdk`. Must include:

- Full TypeScript type definitions for all OpenClaw-specific minion types
- `InstanceManager` class:
  - `register(name, url, token?)` — register a new instance
  - `connect(instanceId)` — establish Gateway WebSocket connection with challenge/response
  - `ping(instanceId)` — check instance health and latency
  - `disconnect(instanceId)` — close connection
- `ConfigDecomposer` class:
  - `decompose(openclawJson)` — parse `openclaw.json` into a tree of minions
  - `compose(instanceId)` — reconstruct `openclaw.json` from minion tree
  - `diff(config1, config2)` — structured diff between two configurations
- `SnapshotManager` class:
  - `capture(instanceId)` — fetch live state from Gateway and create snapshot minion
  - `getHistory(instanceId)` — return snapshot chain via `follows` relations
  - `compare(snapshot1, snapshot2)` — diff two snapshots
- `GatewayClient` class:
  - `openConnection(url, token)` — WebSocket connect + challenge/response handshake
  - `listAgents()` — fetch agent list from Gateway
  - `listModels()` — fetch model list
  - `listChannels()` — fetch channel list
  - `getPresence()` — fetch system presence
- Validation utilities for all schemas
- Clean public API with comprehensive JSDoc documentation

**3. THE PYTHON SDK** (`/packages/python`)

A complete Python port of the core library with identical functionality:

- Python type hints for all classes and methods
- `InstanceManager`, `ConfigDecomposer`, `SnapshotManager`, `GatewayClient` classes
- Same method signatures as TypeScript version (following Python naming conventions)
- Serializes to identical JSON format as TypeScript SDK
- Full docstrings compatible with Sphinx documentation generation
- Published to PyPI as `minions-openclaw`

**4. THE CLI** (`/packages/cli`)

A command-line tool called `openclaw-manager` that provides:

```bash
openclaw-manager register "Home Server" --url ws://192.168.1.10:18789 --token <token>
# Register a new OpenClaw instance

openclaw-manager ping <instance-id>
# Check instance health, latency, and protocol version

openclaw-manager snapshot <instance-id>
# Capture current state (agents, models, channels, nodes)

openclaw-manager config show <instance-id>
# Display instance configuration as structured minion tree

openclaw-manager config diff <instance-id-1> <instance-id-2>
# Compare configurations of two instances

openclaw-manager config export <instance-id> --format json
# Export configuration as openclaw.json

openclaw-manager config import <instance-id> --file openclaw.json
# Import openclaw.json and decompose into minion tree

openclaw-manager list
# List all registered instances with status

openclaw-manager history <instance-id>
# Show snapshot history chain

openclaw-manager agents <instance-id>
# List agents for an instance

openclaw-manager channels <instance-id>
# List channels for an instance

openclaw-manager models <instance-id>
# List model providers for an instance
```

**5. THE DOCUMENTATION SITE** (`/apps/docs`)

Built with Astro Starlight. Must include:

- Landing page — "Structured management for OpenClaw instances"
- Getting started guide with both TypeScript and Python examples
- Core concepts:
  - OpenClaw architecture (Gateway, Channels, Agents, Tools, Sessions)
  - How configuration maps to minions
  - Snapshot and version history
  - Multi-instance management
- API reference for both TypeScript and Python
  - Dual-language code tabs for all examples
- Guides:
  - Registering and connecting to an instance
  - Configuration management workflows
  - Snapshot-based monitoring
  - Multi-instance orchestration
  - Security best practices
- CLI reference with example commands
- Integration with ClawControl (management UI)

**6. OPTIONAL: THE WEB APP** (`/apps/web`)

A visual instance management dashboard:

- Instance list with live status indicators
- Configuration tree browser
- Snapshot diff viewer
- Agent/Channel/Model detail views
- Connection test interface

---

**PROJECT STRUCTURE**

Standard Minions ecosystem monorepo structure:

```
minions-openclaw/
  packages/
    core/                 # TypeScript core library
      src/
        types.ts          # Type definitions for all OpenClaw minion types
        InstanceManager.ts
        ConfigDecomposer.ts
        SnapshotManager.ts
        GatewayClient.ts
        index.ts          # Public API surface
      test/
      package.json
    python/               # Python SDK
      minions_openclaw/
        __init__.py
        types.py
        instance_manager.py
        config_decomposer.py
        snapshot_manager.py
        gateway_client.py
      tests/
      pyproject.toml
    cli/                  # CLI tool
      src/
        commands/
          register.ts
          ping.ts
          snapshot.ts
          config.ts
          list.ts
          history.ts
          agents.ts
          channels.ts
          models.ts
        index.ts
      package.json
  apps/
    docs/                 # Astro Starlight documentation
      src/
        content/
          docs/
            index.md
            getting-started.md
            concepts/
            guides/
            api/
              typescript/
              python/
            cli/
      astro.config.mjs
      package.json
    web/                  # Optional management dashboard
      src/
      package.json
  spec/
    v0.1.md              # Full specification
  examples/
    typescript/
      register-instance.ts
      capture-snapshot.ts
      config-management.ts
      multi-instance.ts
    python/
      register_instance.py
      capture_snapshot.py
      config_management.py
      multi_instance.py
  .github/
    workflows/
      ci.yml             # Lint, test, build for both TS and Python
      publish.yml        # Publish to npm and PyPI
  README.md
  LICENSE                # AGPL-3.0
  package.json           # Workspace root
```

---

**BEYOND STANDARD PATTERN**

These utilities and classes are specific to `minions-openclaw`:

**InstanceManager**
- Manages the lifecycle of OpenClaw instance registrations
- Handles Gateway WebSocket connection with the challenge/response handshake protocol
- Monitors instance health via periodic pings
- Tracks device identity and pairing state

**ConfigDecomposer**
- Parses the large `openclaw.json` configuration into a normalized tree of typed minions
- Supports round-trip: decompose → modify minions → compose back to `openclaw.json`
- Provides structured diffs showing exactly what changed between configurations
- Validates configuration against known OpenClaw schema constraints

**SnapshotManager**
- Captures live Gateway state (agents, models, channels, nodes, presence) into snapshot minions
- Builds version chains via `follows` relations for full history
- Compares snapshots to detect configuration drift or state changes
- Supports scheduled automatic snapshot capture

**GatewayClient**
- Implements the OpenClaw Gateway WebSocket protocol:
  1. Open WS to instance URL
  2. Receive `connect.challenge` → extract nonce + timestamp
  3. Sign nonce with stored device private key
  4. Send `connect` with role: "operator", scopes: ["operator.read"], device identity + signature
  5. Receive `hello-ok` → persist device token if new/rotated
  6. Send method calls: `system-presence`, `agents.list`, `models.list`, `channels.list`
  7. Parse responses, collect payload
  8. Close WS
- Configurable method names (gateway methods may change between protocol versions)

---

**OPENCLAW CONFIGURATION REFERENCE**

The full OpenClaw `openclaw.json` schema covers these top-level sections (each maps to one or more minion types):

| Section | Description | Minion Type(s) |
|---------|-------------|----------------|
| `agents.defaults` | Default agent settings | `openclaw-agent-defaults` |
| `agents.list[]` | Per-agent overrides | `openclaw-agent` |
| `agents.bindings[]` | Channel→agent routing | `openclaw-agent-binding` |
| `channels.*` | Channel configurations | `openclaw-channel`, `openclaw-channel-*` |
| `session` | Session management | `openclaw-session-config` |
| `messages` | Message handling | `openclaw-message-config` |
| `talk` | Voice/TTS (ElevenLabs) | `openclaw-talk-config` |
| `tools` | Tool profiles and settings | `openclaw-tool-config` |
| `skills` | Skill registry | `openclaw-skill-config`, `openclaw-skill` |
| `plugins` | Plugin system | `openclaw-plugin-config`, `openclaw-plugin` |
| `browser` | Browser control (CDP) | `openclaw-browser-config` |
| `gateway` | Gateway server settings | `openclaw-gateway-config` |
| `hooks` | Webhooks/events | `openclaw-hook` |
| `cron` | Scheduled jobs | `openclaw-cron-job` |
| `discovery` | mDNS/DNS-SD | `openclaw-discovery-config` |
| `ui` | UI customization | `openclaw-ui-config` |
| `env` | Environment variables | `openclaw-env-config` |
| `canvas` | Canvas/A2UI host settings | `openclaw-canvas-config` |
| `identity` | Instance identity | `openclaw-identity-config` |
| `logging` | Log configuration | `openclaw-logging-config` |

For the complete field-by-field reference, see: [OpenClaw Configuration Reference](https://docs.openclaw.ai/gateway/configuration-reference)

---

**TONE AND POSITIONING**

This is a management and orchestration layer for OpenClaw. Position it as:

- **Structured configuration management** — no more hand-editing large JSON files
- **Multi-instance orchestration** — manage home server, VPS, and remote gateways from one place
- **Configuration versioning** — snapshot, diff, and rollback instance configurations
- **Live monitoring** — real-time health, presence, and state tracking
- **Security-first** — proper device pairing, token management, and DM policy enforcement

Avoid:
- Reimplementing OpenClaw functionality — this manages instances, not replaces the gateway
- Over-abstracting the configuration — keep the mapping close to `openclaw.json` for familiarity
- Ignoring the Gateway protocol — the client must implement the actual WS handshake correctly

The README should open with a concrete example: registering an instance, capturing a snapshot, and viewing the configuration tree. Make it immediately practical.

---

**DELIVERABLES**

Produce all files necessary to bootstrap this project completely:

1. **Full specification** (`/spec/v0.1.md`) — complete enough to implement from
2. **TypeScript core library** (`/packages/core`) — fully functional, well-tested
3. **Python SDK** (`/packages/python`) — feature parity with TypeScript
4. **CLI tool** (`/packages/cli`) — all commands working with helpful output
5. **Documentation site** (`/apps/docs`) — complete with dual-language examples
6. **README** — compelling, clear, with concrete examples
7. **Examples** — working code in both TypeScript and Python
8. **CI/CD setup** — lint, test, and publish workflows for both languages

Every file should be production quality — not stubs, not placeholders. The spec should be complete. The core libraries should be fully functional. The docs should be ready to publish.

---

**START SYSTEMATICALLY**

1. Write the specification first — nail down the minion type schemas and Gateway protocol interface
2. Implement TypeScript core library with full type definitions
3. Port to Python maintaining exact serialization compatibility
4. Build CLI using the core library
5. Write documentation with dual-language examples throughout
6. Create working examples demonstrating key workflows
7. Write the README with concrete use cases

This project bridges the Minions ecosystem with OpenClaw's powerful personal AI assistant platform. Get the configuration mapping right — it's the foundation everything else builds on.
