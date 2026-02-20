import { useState } from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { InstanceList } from '../components/dashboard/InstanceList';
import { SnapshotTimeline } from '../components/dashboard/SnapshotTimeline';
import { AgentsList } from '../components/dashboard/AgentsList';
import { ChannelsList } from '../components/dashboard/ChannelsList';
import { ModelsList } from '../components/dashboard/ModelsList';
import { ConfigViewer } from '../components/dashboard/ConfigViewer';
import {
    DEMO_INSTANCES,
    DEMO_SNAPSHOTS,
    DEMO_AGENTS,
    DEMO_CHANNELS,
    DEMO_MODELS,
} from '../lib/examples';

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
