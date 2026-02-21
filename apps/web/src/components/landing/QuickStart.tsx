import { CodeBlock } from '../shared/CodeBlock';
import { TabGroup } from '../shared/TabGroup';

const tsCode = `import { OpenClawClient } from '@minions-openclaw/sdk';

// Connect to a gateway instance
const client = new OpenClawClient({
  url: 'https://gateway.example.com',
  apiKey: process.env.GATEWAY_API_KEY,
});

// Take a snapshot of your current config
const snapshot = await client.createSnapshot({ label: 'pre-deploy' });

// List all agents on this gateway
const agents = await client.listAgents();
for (const agent of agents) {
  console.log(\`\${agent.name} — \${agent.status}\`);
}`;

const pyCode = `from minions_openclaw import OpenClawClient

# Connect to a gateway instance
client = OpenClawClient(
    url="https://gateway.example.com",
    api_key=os.environ["GATEWAY_API_KEY"],
)

# Take a snapshot of your current config
snapshot = client.create_snapshot(label="pre-deploy")

# List all agents on this gateway
agents = client.list_agents()
for agent in agents:
    print(f"{agent.name} — {agent.status}")`;

export default function QuickStart() {
    return (
        <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-primary mb-4">Get started in minutes</h2>
                    <p className="text-muted max-w-xl mx-auto">
                        Connect to your gateway, take a snapshot, and start managing your infrastructure with confidence.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <TabGroup
                        tabs={[
                            { label: 'TypeScript', content: <CodeBlock code={tsCode} title="TypeScript" /> },
                            { label: 'Python', content: <CodeBlock code={pyCode} title="Python" /> },
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
