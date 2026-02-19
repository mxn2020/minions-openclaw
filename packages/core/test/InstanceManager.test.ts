import { InstanceManager } from '../src/InstanceManager.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

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
});
