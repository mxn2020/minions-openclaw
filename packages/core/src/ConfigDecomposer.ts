import { createMinion, generateId } from 'minions-sdk';
import type { Minion, Relation, MinionType } from 'minions-sdk';
import { homedir } from 'os';
import { join } from 'path';
import {
  openclawAgentType,
  openclawChannelType,
  openclawModelProviderType,
  openclawSkillType,
  openclawToolConfigType,
  openclawSessionConfigType,
  openclawGatewayConfigType,
  openclawTalkConfigType,
  openclawBrowserConfigType,
  openclawHookType,
  openclawCronJobType,
  openclawDiscoveryConfigType,
  openclawIdentityConfigType,
  openclawCanvasConfigType,
  openclawLoggingConfigType,
  openclawUiConfigType,
} from './types.js';
import { promises as fs } from 'fs';

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

export interface OpenClawConfig {
  agents?: Array<{ name: string; model: string; systemPrompt?: string; tools?: string[]; channels?: string[]; skills?: string[]; enabled?: boolean }>;
  channels?: Array<{ type: string; name: string; config?: Record<string, unknown>; enabled?: boolean }>;
  modelProviders?: Array<{ provider: string; model: string; apiKey?: string; baseUrl?: string; enabled?: boolean }>;
  skills?: Array<{ name: string; description?: string; enabled?: boolean; config?: Record<string, unknown> }>;
  tools?: Array<{ name: string; type: string; config?: Record<string, unknown>; enabled?: boolean }>;
  sessionConfig?: { maxSessions?: number; sessionTimeout?: number; persistSessions?: boolean };
  gatewayConfig?: { host?: string; port?: number; tlsEnabled?: boolean; certPath?: string; keyPath?: string };
  talkConfig?: { provider?: string; voice?: string; enabled?: boolean };
  browserConfig?: { enabled?: boolean; headless?: boolean; timeout?: number };
  hooks?: Array<{ url: string; events?: string[]; secret?: string; enabled?: boolean }>;
  cronJobs?: Array<{ name: string; schedule: string; action: string; enabled?: boolean }>;
  discoveryConfig?: { enabled?: boolean; port?: number; interfaces?: string[] };
  identityConfig?: { name?: string; deviceId?: string; publicKey?: string };
  canvasConfig?: { enabled?: boolean; port?: number; authEnabled?: boolean };
  loggingConfig?: { level?: string; format?: string; outputs?: string[] };
  uiConfig?: { enabled?: boolean; port?: number; theme?: string };
}

export interface DecomposedConfig {
  minions: Minion[];
  relations: Relation[];
}

export class ConfigDecomposer {
  async loadFromFile(configPath: string): Promise<OpenClawConfig> {
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw) as OpenClawConfig;
  }

  decompose(config: OpenClawConfig, parentInstanceId: string): DecomposedConfig {
    const minions: Minion[] = [];
    const relations: Relation[] = [];

    const addChild = (minion: Minion) => {
      minions.push(minion);
      relations.push({
        id: generateId(),
        sourceId: parentInstanceId,
        targetId: minion.id,
        type: 'parent_of',
        createdAt: new Date().toISOString(),
        metadata: {},
      });
    };

    const makeMinion = (type: MinionType, title: string, fields: Record<string, unknown>): Minion => {
      const { minion } = createMinion({ title, fields, tags: [] }, type);
      return minion;
    };

    for (const agent of config.agents ?? []) {
      addChild(makeMinion(openclawAgentType, agent.name, {
        name: agent.name,
        model: agent.model,
        systemPrompt: agent.systemPrompt ?? '',
        tools: JSON.stringify(agent.tools ?? []),
        channels: JSON.stringify(agent.channels ?? []),
        skills: JSON.stringify(agent.skills ?? []),
        enabled: agent.enabled ?? true,
      }));
    }

    for (const ch of config.channels ?? []) {
      addChild(makeMinion(openclawChannelType, ch.name, {
        type: ch.type,
        name: ch.name,
        config: JSON.stringify(ch.config ?? {}),
        enabled: ch.enabled ?? true,
      }));
    }

    for (const mp of config.modelProviders ?? []) {
      addChild(makeMinion(openclawModelProviderType, `${mp.provider}/${mp.model}`, {
        provider: mp.provider,
        model: mp.model,
        apiKey: mp.apiKey ?? '',
        baseUrl: mp.baseUrl ?? '',
        enabled: mp.enabled ?? true,
      }));
    }

    for (const skill of config.skills ?? []) {
      addChild(makeMinion(openclawSkillType, skill.name, {
        name: skill.name,
        description: skill.description ?? '',
        enabled: skill.enabled ?? true,
        config: JSON.stringify(skill.config ?? {}),
      }));
    }

    for (const tool of config.tools ?? []) {
      addChild(makeMinion(openclawToolConfigType, tool.name, {
        name: tool.name,
        type: tool.type,
        config: JSON.stringify(tool.config ?? {}),
        enabled: tool.enabled ?? true,
      }));
    }

    if (config.sessionConfig) {
      addChild(makeMinion(openclawSessionConfigType, 'Session Config', {
        maxSessions: config.sessionConfig.maxSessions ?? 10,
        sessionTimeout: config.sessionConfig.sessionTimeout ?? 3600,
        persistSessions: config.sessionConfig.persistSessions ?? false,
      }));
    }

    if (config.gatewayConfig) {
      addChild(makeMinion(openclawGatewayConfigType, 'Gateway Config', {
        host: config.gatewayConfig.host ?? 'localhost',
        port: config.gatewayConfig.port ?? 8080,
        tlsEnabled: config.gatewayConfig.tlsEnabled ?? false,
        certPath: config.gatewayConfig.certPath ?? '',
        keyPath: config.gatewayConfig.keyPath ?? '',
      }));
    }

    if (config.talkConfig) {
      addChild(makeMinion(openclawTalkConfigType, 'Talk Config', {
        provider: config.talkConfig.provider ?? '',
        voice: config.talkConfig.voice ?? '',
        enabled: config.talkConfig.enabled ?? false,
      }));
    }

    if (config.browserConfig) {
      addChild(makeMinion(openclawBrowserConfigType, 'Browser Config', {
        enabled: config.browserConfig.enabled ?? false,
        headless: config.browserConfig.headless ?? true,
        timeout: config.browserConfig.timeout ?? 30000,
      }));
    }

    for (const hook of config.hooks ?? []) {
      addChild(makeMinion(openclawHookType, hook.url, {
        url: hook.url,
        events: JSON.stringify(hook.events ?? []),
        secret: hook.secret ?? '',
        enabled: hook.enabled ?? true,
      }));
    }

    for (const cron of config.cronJobs ?? []) {
      addChild(makeMinion(openclawCronJobType, cron.name, {
        name: cron.name,
        schedule: cron.schedule,
        action: cron.action,
        enabled: cron.enabled ?? true,
      }));
    }

    if (config.discoveryConfig) {
      addChild(makeMinion(openclawDiscoveryConfigType, 'Discovery Config', {
        enabled: config.discoveryConfig.enabled ?? false,
        port: config.discoveryConfig.port ?? 5353,
        interfaces: JSON.stringify(config.discoveryConfig.interfaces ?? []),
      }));
    }

    if (config.identityConfig) {
      addChild(makeMinion(openclawIdentityConfigType, config.identityConfig.name ?? 'Identity', {
        name: config.identityConfig.name ?? '',
        deviceId: config.identityConfig.deviceId ?? '',
        publicKey: config.identityConfig.publicKey ?? '',
      }));
    }

    if (config.canvasConfig) {
      addChild(makeMinion(openclawCanvasConfigType, 'Canvas Config', {
        enabled: config.canvasConfig.enabled ?? false,
        port: config.canvasConfig.port ?? 3000,
        authEnabled: config.canvasConfig.authEnabled ?? true,
      }));
    }

    if (config.loggingConfig) {
      addChild(makeMinion(openclawLoggingConfigType, 'Logging Config', {
        level: config.loggingConfig.level ?? 'info',
        format: config.loggingConfig.format ?? 'json',
        outputs: JSON.stringify(config.loggingConfig.outputs ?? ['stdout']),
      }));
    }

    if (config.uiConfig) {
      addChild(makeMinion(openclawUiConfigType, 'UI Config', {
        enabled: config.uiConfig.enabled ?? false,
        port: config.uiConfig.port ?? 3001,
        theme: config.uiConfig.theme ?? 'default',
      }));
    }

    return { minions, relations };
  }

  async compose(instanceId: string, storage?: StorageData): Promise<OpenClawConfig> {
    const data = storage ?? await readStorage();

    const childIds = data.relations
      .filter(r => r.sourceId === instanceId && r.type === 'parent_of')
      .map(r => r.targetId);

    const children = data.minions.filter(m => childIds.includes(m.id) && !m.deletedAt);

    const typeMap: Record<string, string> = {
      [openclawAgentType.id]: 'agents',
      [openclawChannelType.id]: 'channels',
      [openclawModelProviderType.id]: 'modelProviders',
      [openclawSkillType.id]: 'skills',
      [openclawToolConfigType.id]: 'tools',
      [openclawSessionConfigType.id]: 'sessionConfig',
      [openclawGatewayConfigType.id]: 'gatewayConfig',
      [openclawTalkConfigType.id]: 'talkConfig',
      [openclawBrowserConfigType.id]: 'browserConfig',
      [openclawHookType.id]: 'hooks',
      [openclawCronJobType.id]: 'cronJobs',
      [openclawDiscoveryConfigType.id]: 'discoveryConfig',
      [openclawIdentityConfigType.id]: 'identityConfig',
      [openclawCanvasConfigType.id]: 'canvasConfig',
      [openclawLoggingConfigType.id]: 'loggingConfig',
      [openclawUiConfigType.id]: 'uiConfig',
    };

    const arrayKeys = new Set(['agents', 'channels', 'modelProviders', 'skills', 'tools', 'hooks', 'cronJobs']);
    const config: Record<string, unknown> = {};

    for (const child of children) {
      const key = typeMap[child.minionTypeId];
      if (!key) continue;

      const fields: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(child.fields)) {
        if (typeof v === 'string') {
          try { fields[k] = JSON.parse(v); } catch { fields[k] = v; }
        } else {
          fields[k] = v;
        }
      }

      if (arrayKeys.has(key)) {
        if (!config[key]) config[key] = [];
        (config[key] as unknown[]).push(fields);
      } else {
        config[key] = fields;
      }
    }

    return config as OpenClawConfig;
  }

  async saveComposed(instanceId: string, config: OpenClawConfig): Promise<void> {
    const storage = await readStorage();
    const { minions, relations } = this.decompose(config, instanceId);
    storage.minions.push(...minions);
    storage.relations.push(...relations);
    await writeStorage(storage);
  }

  diff(
    configA: OpenClawConfig,
    configB: OpenClawConfig,
  ): { added: Partial<OpenClawConfig>; removed: Partial<OpenClawConfig>; changed: Partial<OpenClawConfig> } {
    const added: Record<string, unknown> = {};
    const removed: Record<string, unknown> = {};
    const changed: Record<string, unknown> = {};

    const arrayKeys: Array<keyof OpenClawConfig> = ['agents', 'channels', 'modelProviders', 'skills', 'tools', 'hooks', 'cronJobs'];
    const singletonKeys: Array<keyof OpenClawConfig> = ['sessionConfig', 'gatewayConfig', 'talkConfig', 'browserConfig', 'discoveryConfig', 'identityConfig', 'canvasConfig', 'loggingConfig', 'uiConfig'];

    for (const key of arrayKeys) {
      const a = (configA[key] as Array<{ name?: string }> | undefined) ?? [];
      const b = (configB[key] as Array<{ name?: string }> | undefined) ?? [];
      const aNames = new Set(a.map(item => item.name ?? JSON.stringify(item)));
      const bNames = new Set(b.map(item => item.name ?? JSON.stringify(item)));
      const addedItems = b.filter(item => !aNames.has(item.name ?? JSON.stringify(item)));
      const removedItems = a.filter(item => !bNames.has(item.name ?? JSON.stringify(item)));
      if (addedItems.length) added[key] = addedItems;
      if (removedItems.length) removed[key] = removedItems;
    }

    for (const key of singletonKeys) {
      const a = configA[key] as Record<string, unknown> | undefined;
      const b = configB[key] as Record<string, unknown> | undefined;
      if (!a && b) { added[key] = b; continue; }
      if (a && !b) { removed[key] = a; continue; }
      if (a && b) {
        const changedFields: Record<string, unknown> = {};
        const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of allKeys) {
          if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) {
            changedFields[k] = { from: a[k], to: b[k] };
          }
        }
        if (Object.keys(changedFields).length) changed[key] = changedFields;
      }
    }

    return { added: added as Partial<OpenClawConfig>, removed: removed as Partial<OpenClawConfig>, changed: changed as Partial<OpenClawConfig> };
  }
}
