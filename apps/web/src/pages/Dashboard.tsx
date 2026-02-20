import { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { InstanceList } from '../components/dashboard/InstanceList';
import { SnapshotTimeline } from '../components/dashboard/SnapshotTimeline';
import { AgentsList } from '../components/dashboard/AgentsList';
import { ChannelsList } from '../components/dashboard/ChannelsList';
import { ModelsList } from '../components/dashboard/ModelsList';
import { ConfigViewer } from '../components/dashboard/ConfigViewer';

// Demo data for the dashboard UI (read-only display)
const DEMO_INSTANCES = [
    {
        id: 'inst-001',
        title: 'Home Gateway',
        fields: { url: 'ws://192.168.1.10:3001', status: 'reachable', lastPingAt: new Date().toISOString(), lastPingLatencyMs: 12 },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 'inst-002',
        title: 'Office Gateway',
        fields: { url: 'wss://office.example.com:3001', status: 'registered' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

const DEMO_SNAPSHOTS = [
    { id: 'snap-003', fields: { agentCount: 5, channelCount: 3, modelCount: 2, config: '{}' }, createdAt: new Date().toISOString() },
    { id: 'snap-002', fields: { agentCount: 4, channelCount: 3, modelCount: 1, config: '{}' }, createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: 'snap-001', fields: { agentCount: 3, channelCount: 2, modelCount: 1, config: '{}' }, createdAt: new Date(Date.now() - 1800000).toISOString() },
];

const DEMO_AGENTS = [
    { name: 'assistant', model: 'gpt-4o', enabled: true },
    { name: 'researcher', model: 'claude-sonnet-4-6', enabled: true },
    { name: 'coder', model: 'gpt-4o', enabled: false },
];

const DEMO_CHANNELS = [
    { name: 'web-ui', type: 'http', enabled: true },
    { name: 'slack', type: 'slack', enabled: true },
    { name: 'discord', type: 'discord', enabled: false },
];

const DEMO_MODELS = [
    { provider: 'openai', model: 'gpt-4o', enabled: true },
    { provider: 'anthropic', model: 'claude-sonnet-4-6', enabled: true },
];

const TABS = ['Agents', 'Channels', 'Models', 'Config'] as const;
type Tab = typeof TABS[number];

export default function Dashboard() {
    const [selectedInstance, setSelectedInstance] = useState<string>(DEMO_INSTANCES[0].id);
    const [selectedSnapshot, setSelectedSnapshot] = useState<string>(DEMO_SNAPSHOTS[0].id);
    const [activeTab, setActiveTab] = useState<Tab>('Agents');

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
                    <p className="text-sm text-muted mt-1">Demo data — connect the CLI to load real instances</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Instances column */}
                    <div className="lg:col-span-1">
                        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Instances</h2>
                        <InstanceList
                            instances={DEMO_INSTANCES}
                            selectedId={selectedInstance}
                            onSelect={setSelectedInstance}
                        />
                    </div>

                    {/* Snapshots column */}
                    <div className="lg:col-span-1">
                        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Snapshots</h2>
                        <SnapshotTimeline
                            snapshots={DEMO_SNAPSHOTS}
                            selectedId={selectedSnapshot}
                            onSelect={setSelectedSnapshot}
                        />
                    </div>

                    {/* Detail panel */}
                    <div className="lg:col-span-2">
                        <div className="flex gap-2 mb-4 border-b border-border pb-3">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        activeTab === tab ? 'bg-accent/10 text-accent' : 'text-muted hover:text-primary hover:bg-white/5'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'Agents' && <AgentsList agents={DEMO_AGENTS} />}
                        {activeTab === 'Channels' && <ChannelsList channels={DEMO_CHANNELS} />}
                        {activeTab === 'Models' && <ModelsList models={DEMO_MODELS} />}
                        {activeTab === 'Config' && <ConfigViewer config={{ gatewayConfig: { host: '0.0.0.0', port: 3001 } }} />}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
