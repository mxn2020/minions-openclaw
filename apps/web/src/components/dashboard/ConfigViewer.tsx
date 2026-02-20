import { CodeBlock } from '../shared/CodeBlock';

interface ConfigViewerProps {
    config: Record<string, unknown> | null;
}

export function ConfigViewer({ config }: ConfigViewerProps) {
    if (!config) {
        return (
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <p className="text-muted text-sm">Select a snapshot to view its config.</p>
            </div>
        );
    }

    return (
        <CodeBlock
            code={JSON.stringify(config, null, 2)}
            title="Config JSON"
        />
    );
}
