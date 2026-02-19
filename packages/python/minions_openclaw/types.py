"""OpenClaw-specific MinionType definitions."""
from ._minions_stub import (
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

# Register all types
for _type in [openclaw_instance_type, openclaw_snapshot_type, openclaw_agent_type]:
    registry.register(_type)

ALL_TYPES = [openclaw_instance_type, openclaw_snapshot_type, openclaw_agent_type]
