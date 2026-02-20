import { useState } from 'react';
import { DEMO_INSTANCES, DEMO_SNAPSHOTS } from './examples';

export type DashboardTab = 'agents' | 'channels' | 'models' | 'config';

export interface DashboardInstance {
    id: string;
    title: string;
    fields: Record<string, unknown>;
    minionTypeId: string;
}

export function useDashboardState() {
    const [selectedInstanceId, setSelectedInstanceId] = useState<string>(
        DEMO_INSTANCES[0]?.id ?? ''
    );
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
        DEMO_SNAPSHOTS[0]?.id ?? ''
    );
    const [activeTab, setActiveTab] = useState<DashboardTab>('agents');

    const selectedInstance = DEMO_INSTANCES.find(i => i.id === selectedInstanceId) ?? null;
    const selectedSnapshot = DEMO_SNAPSHOTS.find(s => s.id === selectedSnapshotId) ?? null;

    return {
        selectedInstanceId,
        setSelectedInstanceId,
        selectedSnapshotId,
        setSelectedSnapshotId,
        activeTab,
        setActiveTab,
        selectedInstance,
        selectedSnapshot,
    };
}
