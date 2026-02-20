// Demo data for the openclaw dashboard

export const DEMO_INSTANCES = [
    {
        id: 'inst-001',
        title: 'Home Gateway',
        fields: {
            url: 'ws://192.168.1.10:3001',
            status: 'reachable',
            lastPingAt: new Date().toISOString(),
            lastPingLatencyMs: 12,
        },
        minionTypeId: 'openclaw-instance',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'inst-002',
        title: 'Office Gateway',
        fields: {
            url: 'wss://office.example.com:3001',
            status: 'registered',
        },
        minionTypeId: 'openclaw-instance',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

export const DEMO_AGENTS = [
    { name: 'assistant', model: 'gpt-4o', enabled: true },
    { name: 'researcher', model: 'claude-sonnet-4-6', enabled: true },
    { name: 'coder', model: 'gpt-4o', enabled: false },
    { name: 'analyst', model: 'claude-sonnet-4-6', enabled: true },
];

export const DEMO_CHANNELS = [
    { name: 'web-ui', type: 'http', enabled: true },
    { name: 'slack', type: 'slack', enabled: true },
    { name: 'discord', type: 'discord', enabled: false },
];

export const DEMO_MODELS = [
    { provider: 'openai', model: 'gpt-4o', enabled: true },
    { provider: 'anthropic', model: 'claude-sonnet-4-6', enabled: true },
];

export const DEMO_SNAPSHOTS = [
    {
        id: 'snap-003',
        fields: { agentCount: 5, channelCount: 3, modelCount: 2, config: '{}' },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'snap-002',
        fields: { agentCount: 4, channelCount: 3, modelCount: 1, config: '{}' },
        createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
        id: 'snap-001',
        fields: { agentCount: 3, channelCount: 2, modelCount: 1, config: '{}' },
        createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
];

// Code examples for AnimatedCodeCycler
export const CODE_EXAMPLES = [
    {
        label: 'TypeScript',
        code: `import { InstanceManager, SnapshotManager } from '@minions-openclaw/sdk';

const manager = new InstanceManager();
const instance = await manager.register('My Gateway', 'ws://localhost:18789');

const snapshotMgr = new SnapshotManager();
const snapshot = await snapshotMgr.captureSnapshot(instance.id, gatewayData);
console.log('Snapshot captured:', snapshot.fields.agentCount, 'agents');`,
    },
    {
        label: 'Python',
        code: `from minions_openclaw import InstanceManager, SnapshotManager

manager = InstanceManager()
instance = manager.register('My Gateway', 'ws://localhost:18789')

snapshot_mgr = SnapshotManager()
snapshot = snapshot_mgr.capture_snapshot(instance.id, gateway_data)
print(f"Snapshot captured: {snapshot.fields['agentCount']} agents")`,
    },
];
