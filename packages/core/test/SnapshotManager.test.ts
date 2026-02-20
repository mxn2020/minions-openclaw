import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { SnapshotManager } from '../src/SnapshotManager.js';
import { InstanceManager } from '../src/InstanceManager.js';
import type { Minion } from 'minions-sdk';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { openclawSnapshotType } from '../src/types.js';

const DATA_FILE = join(homedir(), '.openclaw-manager', 'data.json');

const sampleGatewayData = {
  agents: [{ id: 'a1', name: 'Main' }, { id: 'a2', name: 'Sub' }],
  channels: [{ id: 'c1', type: 'telegram' }],
  models: [{ id: 'm1', provider: 'anthropic' }],
  config: { version: '1.0', port: 18789 },
};

describe('SnapshotManager', () => {
  let manager: SnapshotManager;
  let instanceManager: InstanceManager;

  beforeEach(async () => {
    manager = new SnapshotManager();
    instanceManager = new InstanceManager();
    try { await fs.unlink(DATA_FILE); } catch { /* no-op */ }
  });

  afterEach(async () => {
    try { await fs.unlink(DATA_FILE); } catch { /* no-op */ }
  });

  // --- Existing tests (preserved) ---

  test('captureSnapshot creates a snapshot minion', async () => {
    const instance = await instanceManager.register('Test', 'ws://localhost:8080');
    const snapshot = await manager.captureSnapshot(instance.id, sampleGatewayData);

    expect(snapshot).toBeDefined();
    expect(snapshot.fields['agentCount']).toBe(2);
    expect(snapshot.fields['channelCount']).toBe(1);
    expect(snapshot.fields['modelCount']).toBe(1);
    expect(snapshot.fields['instanceId']).toBe(instance.id);
  });

  test('captureSnapshot stores config as JSON string', async () => {
    const instance = await instanceManager.register('Test', 'ws://localhost:8080');
    const snapshot = await manager.captureSnapshot(instance.id, sampleGatewayData);

    const config = JSON.parse(snapshot.fields['config'] as string);
    expect(config.port).toBe(18789);
  });

  test('listSnapshots returns captured snapshots for instance', async () => {
    const instance = await instanceManager.register('Test', 'ws://localhost:8080');
    await manager.captureSnapshot(instance.id, sampleGatewayData);
    await manager.captureSnapshot(instance.id, { ...sampleGatewayData, agents: [{ id: 'a1' }] });

    const snapshots = await manager.listSnapshots(instance.id);
    expect(snapshots.length).toBeGreaterThanOrEqual(1);
  });

  test('getLatestSnapshot returns a snapshot for the instance', async () => {
    const instance = await instanceManager.register('Test', 'ws://localhost:8080');
    await manager.captureSnapshot(instance.id, sampleGatewayData);
    await manager.captureSnapshot(instance.id, {
      ...sampleGatewayData,
      agents: [{ id: 'a1' }],
    });

    const latest = await manager.getLatestSnapshot(instance.id);
    expect(latest).toBeDefined();
    expect(latest!.fields['instanceId']).toBe(instance.id);
  });

  test('diffSnapshots detects field changes between two snapshots', () => {
    const makeSnap = (id: string, fields: Record<string, unknown>): Minion => ({
      id,
      title: 'Snapshot',
      minionTypeId: 'openclaw-snapshot',
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snap1 = makeSnap('s1', { agentCount: 2, channelCount: 1 });
    const snap2 = makeSnap('s2', { agentCount: 3, channelCount: 1 });

    const diff = manager.diffSnapshots(snap1, snap2);
    expect(diff['agentCount']).toBeDefined();
    expect(diff['agentCount']!.from).toBe(2);
    expect(diff['agentCount']!.to).toBe(3);
    expect(diff['channelCount']).toBeUndefined();
  });

  test('diffSnapshots detects added fields', () => {
    const makeSnap = (id: string, fields: Record<string, unknown>): Minion => ({
      id,
      title: 'Snapshot',
      minionTypeId: 'openclaw-snapshot',
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snap1 = makeSnap('s1', { agentCount: 1 });
    const snap2 = makeSnap('s2', { agentCount: 1, newField: 'added' });

    const diff = manager.diffSnapshots(snap1, snap2);
    expect(diff['newField']).toBeDefined();
    expect(diff['newField']!.from).toBeUndefined();
    expect(diff['newField']!.to).toBe('added');
  });

  // --- New tests ---

  test('captureSnapshot twice for same instance gives second snapshot a follows relation to first', async () => {
    const instance = await instanceManager.register('Follows Test', 'ws://localhost:8080');
    const snap1 = await manager.captureSnapshot(instance.id, sampleGatewayData);
    const snap2 = await manager.captureSnapshot(instance.id, sampleGatewayData);

    // Read storage directly to check the follows relation
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const storage = JSON.parse(raw) as { minions: Minion[]; relations: Array<{ sourceId: string; targetId: string; type: string }> };
    const followsRelation = storage.relations.find(
      r => r.sourceId === snap2.id && r.targetId === snap1.id && r.type === 'follows'
    );
    expect(followsRelation).toBeDefined();
  });

  test('listSnapshots for unknown instance id returns empty array', async () => {
    const snapshots = await manager.listSnapshots('non-existent-instance-id');
    expect(snapshots).toEqual([]);
  });

  test('getLatestSnapshot with no snapshots for instance returns undefined', async () => {
    const instance = await instanceManager.register('Empty', 'ws://localhost:8080');
    const result = await manager.getLatestSnapshot(instance.id);
    expect(result).toBeUndefined();
  });

  test('snapshot agentCount equals actual agent array length', async () => {
    const instance = await instanceManager.register('AgentCount', 'ws://localhost:8080');
    const data = {
      agents: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
      channels: [],
      models: [],
      config: {},
    };
    const snapshot = await manager.captureSnapshot(instance.id, data);
    expect(snapshot.fields['agentCount']).toBe(data.agents.length);
  });

  test('snapshot modelCount equals actual model array length', async () => {
    const instance = await instanceManager.register('ModelCount', 'ws://localhost:8080');
    const data = {
      agents: [],
      channels: [],
      models: [{ id: 'm1' }, { id: 'm2' }],
      config: {},
    };
    const snapshot = await manager.captureSnapshot(instance.id, data);
    expect(snapshot.fields['modelCount']).toBe(data.models.length);
  });

  test('config JSON round-trips: parse(snapshot.fields.config).version equals original version', async () => {
    const instance = await instanceManager.register('ConfigRoundtrip', 'ws://localhost:8080');
    const data = {
      agents: [],
      channels: [],
      models: [],
      config: { version: '2.5', port: 9999 },
    };
    const snapshot = await manager.captureSnapshot(instance.id, data);
    const parsed = JSON.parse(snapshot.fields['config'] as string);
    expect(parsed.version).toBe('2.5');
  });

  test('diffSnapshots detects removed fields (field in snap1 not in snap2)', () => {
    const makeSnap = (id: string, fields: Record<string, unknown>): Minion => ({
      id,
      title: 'Snapshot',
      minionTypeId: 'openclaw-snapshot',
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const snap1 = makeSnap('s1', { agentCount: 5, removedField: 'was-here' });
    const snap2 = makeSnap('s2', { agentCount: 5 });

    const diff = manager.diffSnapshots(snap1, snap2);
    expect(diff['removedField']).toBeDefined();
    expect(diff['removedField']!.from).toBe('was-here');
    expect(diff['removedField']!.to).toBeUndefined();
  });

  test('two instances have separate snapshot histories', async () => {
    const instance1 = await instanceManager.register('Instance 1', 'ws://localhost:8081');
    const instance2 = await instanceManager.register('Instance 2', 'ws://localhost:8082');

    await manager.captureSnapshot(instance1.id, sampleGatewayData);
    await manager.captureSnapshot(instance2.id, {
      ...sampleGatewayData,
      agents: [{ id: 'x1' }, { id: 'x2' }, { id: 'x3' }],
    });

    const snaps1 = await manager.listSnapshots(instance1.id);
    const snaps2 = await manager.listSnapshots(instance2.id);

    expect(snaps1).toHaveLength(1);
    expect(snaps2).toHaveLength(1);
    expect(snaps1[0].id).not.toBe(snaps2[0].id);
    expect(snaps1[0].fields['agentCount']).toBe(2);
    expect(snaps2[0].fields['agentCount']).toBe(3);
  });

  test('getHistory returns snapshots in chronological order (oldest first via follows chain)', async () => {
    const instance = await instanceManager.register('History', 'ws://localhost:8080');

    // Capture three snapshots sequentially; the source builds a follows chain newest->older
    const snap1 = await manager.captureSnapshot(instance.id, { ...sampleGatewayData, agents: [{ id: 'a1' }] });
    await new Promise(r => setTimeout(r, 10));
    const snap2 = await manager.captureSnapshot(instance.id, { ...sampleGatewayData, agents: [{ id: 'a1' }, { id: 'a2' }] });
    await new Promise(r => setTimeout(r, 10));
    const snap3 = await manager.captureSnapshot(instance.id, { ...sampleGatewayData, agents: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] });

    const history = await manager.getHistory(instance.id);
    // getHistory walks the follows chain from head (newest) to oldest
    expect(history).toHaveLength(3);
    // The head is snap3 (newest, not referenced as target in any follows relation)
    expect(history[0].id).toBe(snap3.id);
    expect(history[history.length - 1].id).toBe(snap1.id);
  });

  test('captureSnapshot sets minionTypeId to the openclaw-snapshot type id', async () => {
    const instance = await instanceManager.register('TypeCheck', 'ws://localhost:8080');
    const snapshot = await manager.captureSnapshot(instance.id, sampleGatewayData);
    expect(snapshot.minionTypeId).toBe(openclawSnapshotType.id);
  });
});
