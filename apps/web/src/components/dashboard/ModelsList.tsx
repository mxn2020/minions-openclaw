import { Brain } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface ModelProvider {
    provider: string;
    model: string;
    enabled: boolean;
}

interface ModelsListProps {
    models: ModelProvider[];
}

export function ModelsList({ models }: ModelsListProps) {
    if (models.length === 0) {
        return <p className="text-sm text-muted text-center py-4">No model providers in this snapshot.</p>;
    }

    return (
        <ul className="space-y-2">
            {models.map((m, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                    <Brain className="w-4 h-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{m.model}</p>
                        <p className="text-xs text-muted font-mono">{m.provider}</p>
                    </div>
                    <Badge variant={m.enabled ? 'success' : 'error'}>{m.enabled ? 'enabled' : 'disabled'}</Badge>
                </li>
            ))}
        </ul>
    );
}
