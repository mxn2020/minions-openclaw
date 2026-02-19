import { generateId, TypeRegistry } from 'minions-sdk';
import type { MinionType, FieldDefinition } from 'minions-sdk';

export const registry = new TypeRegistry(false);

export const openclawInstanceType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Instance',
  slug: 'openclaw-instance',
  description: 'A registered OpenClaw Gateway instance',
  icon: '🔗',
  color: '#4F46E5',
  schema: [
    { name: 'url', type: 'string', required: true, label: 'Gateway URL (ws:// or wss://)' },
    { name: 'token', type: 'string', required: false, label: 'Auth Token' },
    { name: 'deviceId', type: 'string', required: false, label: 'Device ID' },
    { name: 'devicePublicKey', type: 'string', required: false, label: 'Device Public Key' },
    { name: 'devicePrivateKey', type: 'string', required: false, label: 'Device Private Key' },
    { name: 'status', type: 'string', required: false, label: 'Status' },
    { name: 'lastPingAt', type: 'date', required: false, label: 'Last Ping At' },
    { name: 'lastPingLatencyMs', type: 'number', required: false, label: 'Last Ping Latency (ms)' },
    { name: 'version', type: 'string', required: false, label: 'Version' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawSnapshotType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Snapshot',
  slug: 'openclaw-snapshot',
  description: 'Point-in-time state capture of an OpenClaw Gateway',
  icon: '📸',
  color: '#059669',
  schema: [
    { name: 'instanceId', type: 'string', required: true, label: 'Instance ID' },
    { name: 'capturedAt', type: 'date', required: false, label: 'Captured At' },
    { name: 'config', type: 'textarea', required: false, label: 'Config JSON' },
    { name: 'agentCount', type: 'number', required: false, label: 'Agent Count' },
    { name: 'channelCount', type: 'number', required: false, label: 'Channel Count' },
    { name: 'modelCount', type: 'number', required: false, label: 'Model Count' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawAgentType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Agent',
  slug: 'openclaw-agent',
  description: 'An agent definition on the OpenClaw Gateway',
  icon: '🤖',
  color: '#7C3AED',
  schema: [
    { name: 'name', type: 'string', required: true, label: 'Name' },
    { name: 'model', type: 'string', required: true, label: 'Model' },
    { name: 'systemPrompt', type: 'textarea', required: false, label: 'System Prompt' },
    { name: 'tools', type: 'json', required: false, label: 'Tools (JSON)' },
    { name: 'channels', type: 'json', required: false, label: 'Channels (JSON)' },
    { name: 'skills', type: 'json', required: false, label: 'Skills (JSON)' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawChannelType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Channel',
  slug: 'openclaw-channel',
  description: 'A communication channel on the OpenClaw Gateway',
  icon: '📡',
  color: '#0891B2',
  schema: [
    { name: 'type', type: 'string', required: true, label: 'Type' },
    { name: 'name', type: 'string', required: true, label: 'Name' },
    { name: 'config', type: 'json', required: false, label: 'Config (JSON)' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawModelProviderType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Model Provider',
  slug: 'openclaw-model-provider',
  description: 'A model provider configuration',
  icon: '🧠',
  color: '#DC2626',
  schema: [
    { name: 'provider', type: 'string', required: true, label: 'Provider' },
    { name: 'model', type: 'string', required: true, label: 'Model' },
    { name: 'apiKey', type: 'string', required: false, label: 'API Key' },
    { name: 'baseUrl', type: 'string', required: false, label: 'Base URL' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawSessionConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Session Config',
  slug: 'openclaw-session-config',
  description: 'Session configuration for the gateway',
  icon: '⚙️',
  color: '#D97706',
  schema: [
    { name: 'maxSessions', type: 'number', required: false, label: 'Max Sessions' },
    { name: 'sessionTimeout', type: 'number', required: false, label: 'Session Timeout (s)' },
    { name: 'persistSessions', type: 'boolean', required: false, label: 'Persist Sessions' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawGatewayConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Gateway Config',
  slug: 'openclaw-gateway-config',
  description: 'Gateway network configuration',
  icon: '🌐',
  color: '#0284C7',
  schema: [
    { name: 'host', type: 'string', required: false, label: 'Host' },
    { name: 'port', type: 'number', required: false, label: 'Port' },
    { name: 'tlsEnabled', type: 'boolean', required: false, label: 'TLS Enabled' },
    { name: 'certPath', type: 'string', required: false, label: 'Cert Path' },
    { name: 'keyPath', type: 'string', required: false, label: 'Key Path' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawSkillType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Skill',
  slug: 'openclaw-skill',
  description: 'A skill available to agents',
  icon: '🎯',
  color: '#7C3AED',
  schema: [
    { name: 'name', type: 'string', required: true, label: 'Name' },
    { name: 'description', type: 'textarea', required: false, label: 'Description' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
    { name: 'config', type: 'json', required: false, label: 'Config (JSON)' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawToolConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Tool Config',
  slug: 'openclaw-tool-config',
  description: 'Tool configuration',
  icon: '🔧',
  color: '#B45309',
  schema: [
    { name: 'name', type: 'string', required: true, label: 'Name' },
    { name: 'type', type: 'string', required: true, label: 'Type' },
    { name: 'config', type: 'json', required: false, label: 'Config (JSON)' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawTalkConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Talk Config',
  slug: 'openclaw-talk-config',
  description: 'Voice/talk configuration',
  icon: '🎙️',
  color: '#0891B2',
  schema: [
    { name: 'provider', type: 'string', required: false, label: 'Provider' },
    { name: 'voice', type: 'string', required: false, label: 'Voice' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawBrowserConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Browser Config',
  slug: 'openclaw-browser-config',
  description: 'Browser automation configuration',
  icon: '🌍',
  color: '#16A34A',
  schema: [
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
    { name: 'headless', type: 'boolean', required: false, label: 'Headless' },
    { name: 'timeout', type: 'number', required: false, label: 'Timeout (ms)' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawHookType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Hook',
  slug: 'openclaw-hook',
  description: 'Webhook configuration',
  icon: '🪝',
  color: '#9333EA',
  schema: [
    { name: 'url', type: 'string', required: true, label: 'URL' },
    { name: 'events', type: 'json', required: false, label: 'Events (JSON)' },
    { name: 'secret', type: 'string', required: false, label: 'Secret' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawCronJobType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Cron Job',
  slug: 'openclaw-cron-job',
  description: 'Scheduled job configuration',
  icon: '⏰',
  color: '#EA580C',
  schema: [
    { name: 'name', type: 'string', required: true, label: 'Name' },
    { name: 'schedule', type: 'string', required: true, label: 'Schedule (cron)' },
    { name: 'action', type: 'string', required: true, label: 'Action' },
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawDiscoveryConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Discovery Config',
  slug: 'openclaw-discovery-config',
  description: 'mDNS/discovery configuration',
  icon: '🔍',
  color: '#0369A1',
  schema: [
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
    { name: 'port', type: 'number', required: false, label: 'Port' },
    { name: 'interfaces', type: 'json', required: false, label: 'Interfaces (JSON)' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawIdentityConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Identity Config',
  slug: 'openclaw-identity-config',
  description: 'Device identity configuration',
  icon: '🪪',
  color: '#475569',
  schema: [
    { name: 'name', type: 'string', required: false, label: 'Name' },
    { name: 'deviceId', type: 'string', required: false, label: 'Device ID' },
    { name: 'publicKey', type: 'string', required: false, label: 'Public Key' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawCanvasConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Canvas Config',
  slug: 'openclaw-canvas-config',
  description: 'Canvas UI configuration',
  icon: '🎨',
  color: '#BE185D',
  schema: [
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
    { name: 'port', type: 'number', required: false, label: 'Port' },
    { name: 'authEnabled', type: 'boolean', required: false, label: 'Auth Enabled' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawLoggingConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw Logging Config',
  slug: 'openclaw-logging-config',
  description: 'Logging configuration',
  icon: '📋',
  color: '#374151',
  schema: [
    { name: 'level', type: 'string', required: false, label: 'Level' },
    { name: 'format', type: 'string', required: false, label: 'Format' },
    { name: 'outputs', type: 'json', required: false, label: 'Outputs (JSON)' },
  ] as FieldDefinition[],
  behaviors: [],
};

export const openclawUiConfigType: MinionType = {
  id: generateId(),
  name: 'OpenClaw UI Config',
  slug: 'openclaw-ui-config',
  description: 'Web UI configuration',
  icon: '🖥️',
  color: '#1D4ED8',
  schema: [
    { name: 'enabled', type: 'boolean', required: false, label: 'Enabled' },
    { name: 'port', type: 'number', required: false, label: 'Port' },
    { name: 'theme', type: 'string', required: false, label: 'Theme' },
  ] as FieldDefinition[],
  behaviors: [],
};

// Register all types
export const allOpenClawTypes: MinionType[] = [
  openclawInstanceType,
  openclawSnapshotType,
  openclawAgentType,
  openclawChannelType,
  openclawModelProviderType,
  openclawSessionConfigType,
  openclawGatewayConfigType,
  openclawSkillType,
  openclawToolConfigType,
  openclawTalkConfigType,
  openclawBrowserConfigType,
  openclawHookType,
  openclawCronJobType,
  openclawDiscoveryConfigType,
  openclawIdentityConfigType,
  openclawCanvasConfigType,
  openclawLoggingConfigType,
  openclawUiConfigType,
];

for (const type of allOpenClawTypes) {
  registry.register(type);
}
