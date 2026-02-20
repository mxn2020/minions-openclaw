import { createMinion, updateMinion, softDelete, generateId } from 'minions-sdk';
import type { Minion, Relation } from 'minions-sdk';
import { openclawInstanceType } from './types.js';
import { GatewayClient } from './GatewayClient.js';
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

export class InstanceManager {
  private clients = new Map<string, GatewayClient>();

  async register(name: string, url: string, token?: string): Promise<Minion> {
    const { minion, validation } = createMinion(
      {
        title: name,
        fields: {
          url,
          ...(token ? { token } : {}),
          status: 'registered',
        },
        tags: [],
      },
      openclawInstanceType
    );
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    const storage = await readStorage();
    storage.minions.push(minion);
    await writeStorage(storage);
    return minion;
  }

  async connect(instanceId: string): Promise<GatewayClient> {
    const instance = await this.getById(instanceId);
    if (!instance) throw new Error(`Instance ${instanceId} not found`);
    const url = instance.fields['url'] as string;
    const token = instance.fields['token'] as string | undefined;
    const devicePrivateKey = instance.fields['devicePrivateKey'] as string | undefined;
    const client = new GatewayClient(url, token, devicePrivateKey);
    this.clients.set(instanceId, client);
    await client.openConnection();
    return client;
  }

  async ping(instanceId: string): Promise<number> {
    const start = Date.now();
    const client = await this.connect(instanceId);
    const latency = Date.now() - start;
    await client.close();
    this.clients.delete(instanceId);
    const storage = await readStorage();
    const idx = storage.minions.findIndex(m => m.id === instanceId);
    if (idx !== -1) {
      const { minion } = updateMinion(
        storage.minions[idx],
        {
          fields: {
            ...storage.minions[idx].fields,
            lastPingAt: new Date().toISOString(),
            lastPingLatencyMs: latency,
            status: 'online',
          },
        },
        openclawInstanceType
      );
      storage.minions[idx] = minion;
      await writeStorage(storage);
    }
    return latency;
  }

  async disconnect(instanceId: string): Promise<void> {
    const client = this.clients.get(instanceId);
    if (client) {
      await client.close();
      this.clients.delete(instanceId);
    }
  }

  async list(): Promise<Minion[]> {
    const storage = await readStorage();
    return storage.minions.filter(
      m => m.minionTypeId === openclawInstanceType.id && (m.deletedAt === undefined || m.deletedAt === null)
    );
  }

  async getById(id: string): Promise<Minion | undefined> {
    const storage = await readStorage();
    return storage.minions.find(m => m.id === id && (m.deletedAt === undefined || m.deletedAt === null));
  }

  async remove(id: string): Promise<void> {
    const storage = await readStorage();
    const idx = storage.minions.findIndex(m => m.id === id);
    if (idx === -1) throw new Error(`Instance ${id} not found`);
    storage.minions[idx] = softDelete(storage.minions[idx]);
    await writeStorage(storage);
  }
}
