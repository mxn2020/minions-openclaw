import { createMinion, generateId } from 'minions-sdk';
import type { Minion, Relation } from 'minions-sdk';
import { openclawSnapshotType } from './types.js';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const DATA_DIR = join(homedir(), '.openclaw-manager');
const DATA_FILE = join(DATA_DIR, 'data.json');

interface StorageData {
  minions: Minion[];
  relations: Relation[];
}

async function readStorage(): Promise<StorageData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as StorageData;
  } catch {
    return { minions: [], relations: [] };
  }
}

async function writeStorage(data: StorageData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export interface GatewaySnapshot {
  agents: unknown[];
  channels: unknown[];
  models: unknown[];
  config: Record<string, unknown>;
}

export class SnapshotManager {
  async captureSnapshot(instanceId: string, gatewayData: GatewaySnapshot): Promise<Minion> {
    const storage = await readStorage();

    const previousSnapshots = storage.minions
      .filter(m => m.minionTypeId === openclawSnapshotType.id && m.deletedAt == null)
      .filter(m => storage.relations.some(r => r.sourceId === instanceId && r.targetId === m.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const { minion } = createMinion(
      {
        title: `Snapshot ${new Date().toISOString()}`,
        fields: {
          instanceId,
          capturedAt: new Date().toISOString(),
          config: JSON.stringify(gatewayData.config),
          agentCount: gatewayData.agents.length,
          channelCount: gatewayData.channels.length,
          modelCount: gatewayData.models.length,
        },
        tags: [],
      },
      openclawSnapshotType
    );

    storage.minions.push(minion);

    storage.relations.push({
      id: generateId(),
      sourceId: instanceId,
      targetId: minion.id,
      type: 'parent_of',
      createdAt: new Date().toISOString(),
      metadata: {},
    });

    if (previousSnapshots.length > 0) {
      storage.relations.push({
        id: generateId(),
        sourceId: minion.id,
        targetId: previousSnapshots[0].id,
        type: 'follows',
        createdAt: new Date().toISOString(),
        metadata: {},
      });
    }

    await writeStorage(storage);
    return minion;
  }

  async listSnapshots(instanceId: string): Promise<Minion[]> {
    const storage = await readStorage();
    const snapshotIds = storage.relations
      .filter(r => r.sourceId === instanceId && r.type === 'parent_of')
      .map(r => r.targetId);
    return storage.minions
      .filter(m => snapshotIds.includes(m.id) && m.minionTypeId === openclawSnapshotType.id && (m.deletedAt === undefined || m.deletedAt === null))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLatestSnapshot(instanceId: string): Promise<Minion | undefined> {
    const snapshots = await this.listSnapshots(instanceId);
    return snapshots[0];
  }

  async getHistory(instanceId: string): Promise<Minion[]> {
    const storage = await readStorage();
    const snapshotIds = storage.relations
      .filter(r => r.sourceId === instanceId && r.type === 'parent_of')
      .map(r => r.targetId);
    const snapshots = storage.minions.filter(
      m => snapshotIds.includes(m.id) && m.minionTypeId === openclawSnapshotType.id && (m.deletedAt === undefined || m.deletedAt === null)
    );

    // Walk the follows chain to order newest → oldest
    const followsMap = new Map<string, string>();
    for (const r of storage.relations) {
      if (r.type === 'follows' && snapshotIds.includes(r.sourceId)) {
        followsMap.set(r.sourceId, r.targetId);
      }
    }

    // Find the head: the snapshot not referenced as a target in any follows relation
    const targets = new Set(followsMap.values());
    const head = snapshots.find(s => !targets.has(s.id));
    if (!head) return snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const ordered: Minion[] = [];
    const byId = new Map(snapshots.map(s => [s.id, s]));
    let current: Minion | undefined = head;
    while (current) {
      ordered.push(current);
      const nextId = followsMap.get(current.id);
      current = nextId ? byId.get(nextId) : undefined;
    }
    return ordered;
  }

  async compare(snapshotId1: string, snapshotId2: string): Promise<Record<string, { from: unknown; to: unknown }>> {
    const storage = await readStorage();
    const a = storage.minions.find(m => m.id === snapshotId1);
    const b = storage.minions.find(m => m.id === snapshotId2);
    if (!a || !b) throw new Error(`Snapshot not found: ${!a ? snapshotId1 : snapshotId2}`);
    return this.diffSnapshots(a, b);
  }

  diffSnapshots(a: Minion, b: Minion): Record<string, { from: unknown; to: unknown }> {
    const diff: Record<string, { from: unknown; to: unknown }> = {};
    const allKeys = new Set([...Object.keys(a.fields), ...Object.keys(b.fields)]);
    for (const key of allKeys) {
      const va = a.fields[key];
      const vb = b.fields[key];
      if (JSON.stringify(va) !== JSON.stringify(vb)) {
        diff[key] = { from: va, to: vb };
      }
    }
    return diff;
  }
}
