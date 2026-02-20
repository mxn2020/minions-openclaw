import { InstanceCard } from './InstanceCard';

interface Instance {
    id: string;
    title: string;
    fields: Record<string, unknown>;
    createdAt: string;
}

interface InstanceListProps {
    instances: Instance[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export function InstanceList({ instances, selectedId, onSelect }: InstanceListProps) {
    if (instances.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-muted text-sm">No instances registered yet.</p>
                <p className="text-muted text-xs mt-1">Use the CLI: <span className="font-mono text-accent">openclaw-manager instance register</span></p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {instances.map(instance => (
                <InstanceCard
                    key={instance.id}
                    instance={instance}
                    onSelect={onSelect}
                    isSelected={instance.id === selectedId}
                />
            ))}
        </div>
    );
}
