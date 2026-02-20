import { Bot } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface Agent {
    name: string;
    model: string;
    enabled: boolean;
}

interface AgentsListProps {
    agents: Agent[];
}

export function AgentsList({ agents }: AgentsListProps) {
    if (agents.length === 0) {
        return <p className="text-sm text-muted text-center py-4">No agents in this snapshot.</p>;
    }

    return (
        <ul className="space-y-2">
            {agents.map(agent => (
                <li key={agent.name} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                    <Bot className="w-4 h-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{agent.name}</p>
                        <p className="text-xs text-muted font-mono">{agent.model}</p>
                    </div>
                    <Badge variant={agent.enabled ? 'success' : 'error'}>{agent.enabled ? 'enabled' : 'disabled'}</Badge>
                </li>
            ))}
        </ul>
    );
}
