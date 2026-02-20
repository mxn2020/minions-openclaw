"""OpenClaw-specific MinionType definitions."""
from minions_sdk import (
    MinionType, FieldDefinition, TypeRegistry, generate_id
)

registry = TypeRegistry()

openclaw_instance_type = MinionType(
    id=generate_id(),
    name='OpenClaw Instance',
    slug='openclaw-instance',
    description='A registered OpenClaw Gateway instance',
    icon='🔗',
    color='#4F46E5',
    schema=[
        FieldDefinition('url', 'url', required=True, label='URL'),
        FieldDefinition('token', 'string', label='Auth Token'),
        FieldDefinition('deviceId', 'string', label='Device ID'),
        FieldDefinition('devicePublicKey', 'string', label='Device Public Key'),
        FieldDefinition('devicePrivateKey', 'string', label='Device Private Key'),
        FieldDefinition('status', 'string', label='Status'),
        FieldDefinition('lastPingAt', 'date', label='Last Ping At'),
        FieldDefinition('lastPingLatencyMs', 'number', label='Last Ping Latency (ms)'),
        FieldDefinition('version', 'string', label='Version'),
    ],
)

openclaw_snapshot_type = MinionType(
    id=generate_id(),
    name='OpenClaw Snapshot',
    slug='openclaw-snapshot',
    description='Point-in-time state capture',
    icon='📸',
    color='#059669',
    schema=[
        FieldDefinition('instanceId', 'string', required=True, label='Instance ID'),
        FieldDefinition('capturedAt', 'date', label='Captured At'),
        FieldDefinition('config', 'textarea', label='Config JSON'),
        FieldDefinition('agentCount', 'number', label='Agent Count'),
        FieldDefinition('channelCount', 'number', label='Channel Count'),
        FieldDefinition('modelCount', 'number', label='Model Count'),
    ],
)

openclaw_agent_type = MinionType(
    id=generate_id(),
    name='OpenClaw Agent',
    slug='openclaw-agent',
    description='Agent definition',
    icon='🤖',
    color='#7C3AED',
    schema=[
        FieldDefinition('name', 'string', required=True, label='Name'),
        FieldDefinition('model', 'string', required=True, label='Model'),
        FieldDefinition('systemPrompt', 'textarea', label='System Prompt'),
        FieldDefinition('tools', 'json', label='Tools (JSON)'),
        FieldDefinition('channels', 'json', label='Channels (JSON)'),
        FieldDefinition('skills', 'json', label='Skills (JSON)'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_channel_type = MinionType(
    id=generate_id(),
    name='OpenClaw Channel',
    slug='openclaw-channel',
    description='A communication channel on the OpenClaw Gateway',
    icon='📡',
    color='#0891B2',
    schema=[
        FieldDefinition('type', 'string', required=True, label='Type'),
        FieldDefinition('name', 'string', required=True, label='Name'),
        FieldDefinition('config', 'json', label='Config (JSON)'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_model_provider_type = MinionType(
    id=generate_id(),
    name='OpenClaw Model Provider',
    slug='openclaw-model-provider',
    description='A model provider configuration',
    icon='🧠',
    color='#DC2626',
    schema=[
        FieldDefinition('provider', 'string', required=True, label='Provider'),
        FieldDefinition('model', 'string', required=True, label='Model'),
        FieldDefinition('apiKey', 'string', label='API Key'),
        FieldDefinition('baseUrl', 'string', label='Base URL'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_session_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Session Config',
    slug='openclaw-session-config',
    description='Session configuration for the gateway',
    icon='⚙️',
    color='#D97706',
    schema=[
        FieldDefinition('maxSessions', 'number', label='Max Sessions'),
        FieldDefinition('sessionTimeout', 'number', label='Session Timeout (s)'),
        FieldDefinition('persistSessions', 'boolean', label='Persist Sessions'),
    ],
)

openclaw_gateway_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Gateway Config',
    slug='openclaw-gateway-config',
    description='Gateway network configuration',
    icon='🌐',
    color='#0284C7',
    schema=[
        FieldDefinition('host', 'string', label='Host'),
        FieldDefinition('port', 'number', label='Port'),
        FieldDefinition('tlsEnabled', 'boolean', label='TLS Enabled'),
        FieldDefinition('certPath', 'string', label='Cert Path'),
        FieldDefinition('keyPath', 'string', label='Key Path'),
    ],
)

openclaw_skill_type = MinionType(
    id=generate_id(),
    name='OpenClaw Skill',
    slug='openclaw-skill',
    description='A skill available to agents',
    icon='🎯',
    color='#7C3AED',
    schema=[
        FieldDefinition('name', 'string', required=True, label='Name'),
        FieldDefinition('description', 'textarea', label='Description'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
        FieldDefinition('config', 'json', label='Config (JSON)'),
    ],
)

openclaw_tool_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Tool Config',
    slug='openclaw-tool-config',
    description='Tool configuration',
    icon='🔧',
    color='#B45309',
    schema=[
        FieldDefinition('name', 'string', required=True, label='Name'),
        FieldDefinition('type', 'string', required=True, label='Type'),
        FieldDefinition('config', 'json', label='Config (JSON)'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_talk_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Talk Config',
    slug='openclaw-talk-config',
    description='Voice/talk configuration',
    icon='🎙️',
    color='#0891B2',
    schema=[
        FieldDefinition('provider', 'string', label='Provider'),
        FieldDefinition('voice', 'string', label='Voice'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_browser_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Browser Config',
    slug='openclaw-browser-config',
    description='Browser automation configuration',
    icon='🌍',
    color='#16A34A',
    schema=[
        FieldDefinition('enabled', 'boolean', label='Enabled'),
        FieldDefinition('headless', 'boolean', label='Headless'),
        FieldDefinition('timeout', 'number', label='Timeout (ms)'),
    ],
)

openclaw_hook_type = MinionType(
    id=generate_id(),
    name='OpenClaw Hook',
    slug='openclaw-hook',
    description='Webhook configuration',
    icon='🪝',
    color='#9333EA',
    schema=[
        FieldDefinition('url', 'string', required=True, label='URL'),
        FieldDefinition('events', 'json', label='Events (JSON)'),
        FieldDefinition('secret', 'string', label='Secret'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_cron_job_type = MinionType(
    id=generate_id(),
    name='OpenClaw Cron Job',
    slug='openclaw-cron-job',
    description='Scheduled job configuration',
    icon='⏰',
    color='#EA580C',
    schema=[
        FieldDefinition('name', 'string', required=True, label='Name'),
        FieldDefinition('schedule', 'string', required=True, label='Schedule (cron)'),
        FieldDefinition('action', 'string', required=True, label='Action'),
        FieldDefinition('enabled', 'boolean', label='Enabled'),
    ],
)

openclaw_discovery_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Discovery Config',
    slug='openclaw-discovery-config',
    description='mDNS/discovery configuration',
    icon='🔍',
    color='#0369A1',
    schema=[
        FieldDefinition('enabled', 'boolean', label='Enabled'),
        FieldDefinition('port', 'number', label='Port'),
        FieldDefinition('interfaces', 'json', label='Interfaces (JSON)'),
    ],
)

openclaw_identity_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Identity Config',
    slug='openclaw-identity-config',
    description='Device identity configuration',
    icon='🪪',
    color='#475569',
    schema=[
        FieldDefinition('name', 'string', label='Name'),
        FieldDefinition('deviceId', 'string', label='Device ID'),
        FieldDefinition('publicKey', 'string', label='Public Key'),
    ],
)

openclaw_canvas_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Canvas Config',
    slug='openclaw-canvas-config',
    description='Canvas UI configuration',
    icon='🎨',
    color='#BE185D',
    schema=[
        FieldDefinition('enabled', 'boolean', label='Enabled'),
        FieldDefinition('port', 'number', label='Port'),
        FieldDefinition('authEnabled', 'boolean', label='Auth Enabled'),
    ],
)

openclaw_logging_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw Logging Config',
    slug='openclaw-logging-config',
    description='Logging configuration',
    icon='📋',
    color='#374151',
    schema=[
        FieldDefinition('level', 'string', label='Level'),
        FieldDefinition('format', 'string', label='Format'),
        FieldDefinition('outputs', 'json', label='Outputs (JSON)'),
    ],
)

openclaw_ui_config_type = MinionType(
    id=generate_id(),
    name='OpenClaw UI Config',
    slug='openclaw-ui-config',
    description='Web UI configuration',
    icon='🖥️',
    color='#1D4ED8',
    schema=[
        FieldDefinition('enabled', 'boolean', label='Enabled'),
        FieldDefinition('port', 'number', label='Port'),
        FieldDefinition('theme', 'string', label='Theme'),
    ],
)

ALL_TYPES = [
    openclaw_instance_type,
    openclaw_snapshot_type,
    openclaw_agent_type,
    openclaw_channel_type,
    openclaw_model_provider_type,
    openclaw_session_config_type,
    openclaw_gateway_config_type,
    openclaw_skill_type,
    openclaw_tool_config_type,
    openclaw_talk_config_type,
    openclaw_browser_config_type,
    openclaw_hook_type,
    openclaw_cron_job_type,
    openclaw_discovery_config_type,
    openclaw_identity_config_type,
    openclaw_canvas_config_type,
    openclaw_logging_config_type,
    openclaw_ui_config_type,
]

# Register all types
for _type in ALL_TYPES:
    registry.register(_type)
