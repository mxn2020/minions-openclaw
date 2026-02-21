import { describe, it, expect } from 'vitest';
import { SnapshotManager } from '../SnapshotManager.js';
import type { Minion } from 'minions-sdk';
import { generateId, now } from 'minions-sdk';

function makeSnapshotMinion(fields: Record<string, unknown>, overrides?: Partial<Minion>): Minion {
    return {
        id: generateId(),
        title: 'Test Snapshot',
        minionTypeId: 'snapshot-type',
        fields,
        tags: [],
        createdAt: now(),
        updatedAt: now(),
        version: 1,
        ...overrides,
    };
}

describe('SnapshotManager', () => {
    const manager = new SnapshotManager();

    describe('diffSnapshots()', () => {
        it('should detect no changes for identical snapshots', () => {
            const fields = { instanceId: 'inst-1', config: '{}', agentCount: 3 };
            const a = makeSnapshotMinion(fields);
            const b = makeSnapshotMinion(fields);

            const diff = manager.diffSnapshots(a, b);

            expect(Object.keys(diff)).toHaveLength(0);
        });

        it('should detect changed fields', () => {
            const a = makeSnapshotMinion({ config: '{"port": 8080}', agentCount: 3 });
            const b = makeSnapshotMinion({ config: '{"port": 9090}', agentCount: 5 });

            const diff = manager.diffSnapshots(a, b);

            expect(diff['config']).toBeDefined();
            expect(diff['config']!.from).toBe('{"port": 8080}');
            expect(diff['config']!.to).toBe('{"port": 9090}');

            expect(diff['agentCount']).toBeDefined();
            expect(diff['agentCount']!.from).toBe(3);
            expect(diff['agentCount']!.to).toBe(5);
        });

        it('should detect added fields', () => {
            const a = makeSnapshotMinion({ config: '{}' });
            const b = makeSnapshotMinion({ config: '{}', agentCount: 3 });

            const diff = manager.diffSnapshots(a, b);

            expect(diff['agentCount']).toBeDefined();
            expect(diff['agentCount']!.from).toBeUndefined();
            expect(diff['agentCount']!.to).toBe(3);
        });

        it('should detect removed fields', () => {
            const a = makeSnapshotMinion({ config: '{}', agentCount: 3 });
            const b = makeSnapshotMinion({ config: '{}' });

            const diff = manager.diffSnapshots(a, b);

            expect(diff['agentCount']).toBeDefined();
            expect(diff['agentCount']!.from).toBe(3);
            expect(diff['agentCount']!.to).toBeUndefined();
        });

        it('should handle complex field values', () => {
            const a = makeSnapshotMinion({
                config: JSON.stringify({ agents: [{ name: 'bot1' }], port: 8080 }),
            });
            const b = makeSnapshotMinion({
                config: JSON.stringify({ agents: [{ name: 'bot1' }, { name: 'bot2' }], port: 8080 }),
            });

            const diff = manager.diffSnapshots(a, b);

            expect(diff['config']).toBeDefined();
        });
    });
});
