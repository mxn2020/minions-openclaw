import { ConfigDecomposer } from '../src/ConfigDecomposer.js';
import { generateId } from 'minions-sdk';

describe('ConfigDecomposer', () => {
  let decomposer: ConfigDecomposer;
  const parentId = generateId();

  beforeEach(() => {
    decomposer = new ConfigDecomposer();
  });

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
});
