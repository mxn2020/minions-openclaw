import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { SnapshotManager } from '../src/SnapshotManager.js';
import { InstanceManager } from '../src/InstanceManager.js';
import type { Minion } from 'minions-sdk';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

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
});
