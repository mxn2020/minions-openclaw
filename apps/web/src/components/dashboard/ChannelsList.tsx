import { Radio } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface Channel {
    name: string;
    type: string;
    enabled: boolean;
}

interface ChannelsListProps {
    channels: Channel[];
}

export function ChannelsList({ channels }: ChannelsListProps) {
    if (channels.length === 0) {
        return <p className="text-sm text-muted text-center py-4">No channels in this snapshot.</p>;
    }

    return (
        <ul className="space-y-2">
            {channels.map(ch => (
                <li key={ch.name} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
                    <Radio className="w-4 h-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{ch.name}</p>
                        <p className="text-xs text-muted font-mono">{ch.type}</p>
                    </div>
                    <Badge variant={ch.enabled ? 'success' : 'error'}>{ch.enabled ? 'enabled' : 'disabled'}</Badge>
                </li>
            ))}
        </ul>
    );
}
