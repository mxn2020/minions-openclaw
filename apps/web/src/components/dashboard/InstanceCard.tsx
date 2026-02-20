import { Badge } from '../shared/Badge';
import { Server, Wifi, WifiOff, Clock } from 'lucide-react';

interface Instance {
    id: string;
    title: string;
    fields: Record<string, unknown>;
    createdAt: string;
}

interface InstanceCardProps {
    instance: Instance;
    onSelect: (id: string) => void;
    isSelected: boolean;
}

export function InstanceCard({ instance, onSelect, isSelected }: InstanceCardProps) {
    const status = instance.fields['status'] as string | undefined;
    const url = instance.fields['url'] as string | undefined;
    const lastPing = instance.fields['lastPingAt'] as string | undefined;
    const latency = instance.fields['lastPingLatencyMs'] as number | undefined;

    const statusVariant = status === 'reachable' ? 'success' : status === 'unreachable' ? 'error' : 'default';

    return (
        <button
            onClick={() => onSelect(instance.id)}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
                isSelected ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-white/5'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Server className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-primary">{instance.title}</p>
                        <p className="text-xs text-muted font-mono truncate max-w-[200px]">{url}</p>
                    </div>
                </div>
                <Badge variant={statusVariant}>{status ?? 'registered'}</Badge>
            </div>
            {lastPing && (
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                    {latency !== undefined ? (
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" />{latency}ms</span>
                    ) : (
                        <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" />No ping</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(lastPing).toLocaleString()}</span>
                </div>
            )}
        </button>
    );
}
