import { describe, test, expect, beforeEach } from 'vitest';
import { ConfigDecomposer } from '../src/ConfigDecomposer.js';
import { generateId } from 'minions-sdk';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  openclawAgentType,
  openclawChannelType,
  openclawSkillType,
  openclawSessionConfigType,
} from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURE_CONFIG_PATH = join(__dirname, 'fixtures', 'sample-config.json');

describe('ConfigDecomposer', () => {
  let decomposer: ConfigDecomposer;
  const parentId = generateId();

  beforeEach(() => {
    decomposer = new ConfigDecomposer();
  });

  // --- Existing tests (preserved) ---

  test('decomposes agents', () => {
    const { minions, relations } = decomposer.decompose({
      agents: [
        { name: 'MyAgent', model: 'gpt-4', enabled: true },
      ],
    }, parentId);
    expect(minions).toHaveLength(1);
    expect(minions[0].fields['name']).toBe('MyAgent');
    expect(relations[0].sourceId).toBe(parentId);
    expect(relations[0].type).toBe('parent_of');
  });

  test('decomposes multiple config sections', () => {
    const { minions, relations } = decomposer.decompose({
      agents: [{ name: 'A1', model: 'gpt-4' }],
      channels: [{ type: 'slack', name: 'general' }],
      sessionConfig: { maxSessions: 5 },
    }, parentId);
    expect(minions.length).toBeGreaterThanOrEqual(3);
    expect(relations.length).toBeGreaterThanOrEqual(3);
  });

  test('empty config produces no minions', () => {
    const { minions, relations } = decomposer.decompose({}, parentId);
    expect(minions).toHaveLength(0);
    expect(relations).toHaveLength(0);
  });

  // --- New tests ---

  test('decompose channels section creates channel minions', () => {
    const { minions } = decomposer.decompose({
      channels: [
        { type: 'telegram', name: 'tg-main', enabled: true },
        { type: 'slack', name: 'slack-ops', enabled: false },
      ],
    }, parentId);
    expect(minions).toHaveLength(2);
    const channelMinion = minions.find(m => m.minionTypeId === openclawChannelType.id);
    expect(channelMinion).toBeDefined();
    expect(channelMinion!.fields['type']).toBeTruthy();
  });

  test('decompose skills section creates skill minions', () => {
    const { minions } = decomposer.decompose({
      skills: [
        { name: 'WebSearch', description: 'Search the web', enabled: true },
        { name: 'CodeRunner', description: 'Execute code', enabled: true },
      ],
    }, parentId);
    expect(minions).toHaveLength(2);
    const skillMinion = minions.find(m => m.minionTypeId === openclawSkillType.id);
    expect(skillMinion).toBeDefined();
    expect(skillMinion!.fields['name']).toBeTruthy();
  });

  test('compose reconstitutes agents from minion storage', async () => {
    const instanceId = generateId();
    const config = {
      agents: [
        { name: 'ComposedAgent', model: 'claude-3', enabled: true },
      ],
    };
    const { minions, relations } = decomposer.decompose(config, instanceId);

    // Build an in-memory storage structure and pass it to compose
    const storage = { minions, relations };
    const reconstituted = await decomposer.compose(instanceId, storage);

    expect(reconstituted.agents).toBeDefined();
    expect(reconstituted.agents).toHaveLength(1);
    expect((reconstituted.agents![0] as { name?: string }).name).toBe('ComposedAgent');
  });

  test('diff with identical configs returns empty added/removed/changed', () => {
    const config = {
      agents: [{ name: 'AgentA', model: 'gpt-4' }],
      sessionConfig: { maxSessions: 5 },
    };
    const { added, removed, changed } = decomposer.diff(config, config);
    expect(Object.keys(added)).toHaveLength(0);
    expect(Object.keys(removed)).toHaveLength(0);
    expect(Object.keys(changed)).toHaveLength(0);
  });

  test('diff with added agent contains the new agent name in added', () => {
    const configA = {
      agents: [{ name: 'ExistingAgent', model: 'gpt-4' }],
    };
    const configB = {
      agents: [
        { name: 'ExistingAgent', model: 'gpt-4' },
        { name: 'NewAgent', model: 'gpt-4' },
      ],
    };
    const { added } = decomposer.diff(configA, configB);
    expect(added.agents).toBeDefined();
    const addedAgents = added.agents as Array<{ name?: string }>;
    expect(addedAgents.some(a => a.name === 'NewAgent')).toBe(true);
  });

  test('diff with removed channel produces non-empty removed array', () => {
    const configA = {
      channels: [
        { type: 'telegram', name: 'tg-channel' },
        { type: 'slack', name: 'slack-channel' },
      ],
    };
    const configB = {
      channels: [
        { type: 'slack', name: 'slack-channel' },
      ],
    };
    const { removed } = decomposer.diff(configA, configB);
    expect(removed.channels).toBeDefined();
    expect((removed.channels as unknown[]).length).toBeGreaterThan(0);
  });

  test('diff with changed field (port number) reports changed', () => {
    const configA = {
      gatewayConfig: { host: 'localhost', port: 8080 },
    };
    const configB = {
      gatewayConfig: { host: 'localhost', port: 9090 },
    };
    const { changed } = decomposer.diff(configA, configB);
    expect(changed.gatewayConfig).toBeDefined();
    const changedFields = changed.gatewayConfig as Record<string, { from: unknown; to: unknown }>;
    expect(changedFields['port']).toBeDefined();
    expect(changedFields['port'].from).toBe(8080);
    expect(changedFields['port'].to).toBe(9090);
  });

  test('loadFromFile reads a valid JSON file', async () => {
    const config = await decomposer.loadFromFile(FIXTURE_CONFIG_PATH);
    expect(config).toBeDefined();
    expect(config.agents).toBeDefined();
    expect(Array.isArray(config.agents)).toBe(true);
    expect(config.agents![0].name).toBe('FixtureAgent');
  });

  test('minion type for agent minions equals openclaw-agent type id', () => {
    const { minions } = decomposer.decompose({
      agents: [{ name: 'TypedAgent', model: 'gpt-4' }],
    }, parentId);
    expect(minions[0].minionTypeId).toBe(openclawAgentType.id);
  });

  test('decompose sessionConfig creates a sessionConfig minion', () => {
    const { minions } = decomposer.decompose({
      sessionConfig: { maxSessions: 20, sessionTimeout: 7200, persistSessions: true },
    }, parentId);
    expect(minions).toHaveLength(1);
    const sessionMinion = minions.find(m => m.minionTypeId === openclawSessionConfigType.id);
    expect(sessionMinion).toBeDefined();
    expect(sessionMinion!.fields['maxSessions']).toBe(20);
    expect(sessionMinion!.fields['persistSessions']).toBe(true);
  });
});
