import { motion } from 'framer-motion';
import { Server, Camera, GitCompare, Settings, Terminal, Globe } from 'lucide-react';

const features = [
    {
        icon: Server,
        title: 'Instance Registry',
        description: 'Register any OpenClaw Gateway with a URL, auth token, and optional RSA device key. All data stored locally.',
    },
    {
        icon: Camera,
        title: 'Snapshot System',
        description: 'Capture point-in-time state (agents, channels, models, config) and build a traversable version chain.',
    },
    {
        icon: GitCompare,
        title: 'Config Diff',
        description: 'Compare any two configs or snapshots at the field level. Detect added/removed agents and changed settings.',
    },
    {
        icon: Settings,
        title: 'Config Decomposition',
        description: 'Map every config section into a typed Minion tree and recompose it back. Full structure preserved.',
    },
    {
        icon: Terminal,
        title: 'CLI & SDK',
        description: 'Unified CLI with TypeScript and Python SDK. Full feature parity across all interfaces.',
    },
    {
        icon: Globe,
        title: 'WebSocket Protocol',
        description: 'Live connection to running gateways via GatewayClient. Fetch agents, channels, and config in real-time.',
    },
];

export default function Features() {
    return (
        <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-primary mb-4">Everything you need to manage OpenClaw</h2>
                    <p className="text-muted max-w-xl mx-auto">
                        Built on the minions structured object system — every instance, snapshot, and config section is a typed, versioned Minion.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <feature.icon className="w-5 h-5 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary">{feature.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
