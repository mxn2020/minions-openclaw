import { Camera, ChevronRight } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface Snapshot {
    id: string;
    fields: Record<string, unknown>;
    createdAt: string;
}

interface SnapshotTimelineProps {
    snapshots: Snapshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export function SnapshotTimeline({ snapshots, selectedId, onSelect }: SnapshotTimelineProps) {
    if (snapshots.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <Camera className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-muted text-sm">No snapshots yet.</p>
                <p className="text-muted text-xs mt-1">Run: <span className="font-mono text-accent">openclaw-manager snapshot capture &lt;id&gt;</span></p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {snapshots.map((snap, i) => (
                <button
                    key={snap.id}
                    onClick={() => onSelect(snap.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors flex items-center gap-3 ${
                        snap.id === selectedId ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-white/5'
                    }`}
                >
                    <div className="relative flex flex-col items-center">
                        <Camera className="w-4 h-4 text-accent" />
                        {i < snapshots.length - 1 && <div className="w-px h-4 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-primary">snap #{snapshots.length - i}</p>
                        <p className="text-xs text-muted">{new Date(snap.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="default">{snap.fields['agentCount'] as number ?? 0}A</Badge>
                        <Badge variant="default">{snap.fields['channelCount'] as number ?? 0}C</Badge>
                        <ChevronRight className="w-4 h-4 text-muted" />
                    </div>
                </button>
            ))}
        </div>
    );
}
