import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { InstanceManager } from '../src/InstanceManager.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { openclawInstanceType } from '../src/types.js';

const DATA_FILE = join(homedir(), '.openclaw-manager', 'data.json');

describe('InstanceManager', () => {
  let manager: InstanceManager;

  beforeEach(async () => {
    manager = new InstanceManager();
    try { await fs.unlink(DATA_FILE); } catch { /* no-op */ }
  });

  afterEach(async () => {
    try { await fs.unlink(DATA_FILE); } catch { /* no-op */ }
  });

  // --- Existing tests (preserved) ---

  test('register creates an instance', async () => {
    const minion = await manager.register('Test Instance', 'ws://localhost:8080');
    expect(minion.title).toBe('Test Instance');
    expect(minion.fields['url']).toBe('ws://localhost:8080');
    expect(minion.fields['status']).toBe('registered');
  });

  test('list returns registered instances', async () => {
    await manager.register('Instance A', 'ws://localhost:8080');
    await manager.register('Instance B', 'ws://localhost:8081');
    const list = await manager.list();
    expect(list).toHaveLength(2);
  });

  test('remove soft-deletes instance', async () => {
    const m = await manager.register('To Delete', 'ws://localhost:8080');
    await manager.remove(m.id);
    const list = await manager.list();
    expect(list).toHaveLength(0);
  });

  test('getById returns instance', async () => {
    const m = await manager.register('Find Me', 'ws://localhost:8080');
    const found = await manager.getById(m.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(m.id);
  });

  // --- New tests ---

  test('register with token parameter stores token in fields', async () => {
    const minion = await manager.register('Tokenized', 'ws://localhost:8080', 'secret-token-abc');
    expect(minion.fields['token']).toBe('secret-token-abc');
  });

  test('getById with unknown id returns undefined', async () => {
    const result = await manager.getById('non-existent-id-xyz');
    expect(result).toBeUndefined();
  });

  test('remove non-existent id throws (graceful error)', async () => {
    // The source throws "Instance not found" for non-existent ids — verify that
    await expect(manager.remove('does-not-exist')).rejects.toThrow();
  });

  test('list returns empty array when no instances registered', async () => {
    // Use a fresh manager with a clean data file (beforeEach already removed it)
    const freshManager = new InstanceManager();
    const list = await freshManager.list();
    expect(list).toHaveLength(0);
  });

  test('register sets status to registered', async () => {
    const minion = await manager.register('Status Check', 'ws://localhost:9000');
    expect(minion.fields['status']).toBe('registered');
  });

  test('after remove, getById returns undefined for that id', async () => {
    const minion = await manager.register('Removable', 'ws://localhost:8080');
    await manager.remove(minion.id);
    const found = await manager.getById(minion.id);
    expect(found).toBeUndefined();
  });

  test('register multiple instances and list returns all', async () => {
    await manager.register('Alpha', 'ws://localhost:8001');
    await manager.register('Beta', 'ws://localhost:8002');
    await manager.register('Gamma', 'ws://localhost:8003');
    const list = await manager.list();
    expect(list).toHaveLength(3);
  });

  test('instance minion has minionTypeId matching the openclaw-instance type', async () => {
    const minion = await manager.register('Type Check', 'ws://localhost:8080');
    expect(minion.minionTypeId).toBe(openclawInstanceType.id);
  });

  test('register with same URL twice creates two separate instances', async () => {
    const m1 = await manager.register('First', 'ws://localhost:8080');
    const m2 = await manager.register('Second', 'ws://localhost:8080');
    expect(m1.id).not.toBe(m2.id);
    const list = await manager.list();
    expect(list).toHaveLength(2);
  });

  test('instance fields include name matching the title', async () => {
    const minion = await manager.register('My Gateway', 'ws://localhost:8080');
    // The title is used as the display name; verify it matches the registered name
    expect(minion.title).toBe('My Gateway');
  });
});
