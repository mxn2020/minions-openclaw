import { describe, test, expect } from 'vitest';
import {
  registry,
  openclawInstanceType,
  openclawSnapshotType,
  openclawAgentType,
  allOpenClawTypes,
} from '../src/types.js';

describe('OpenClaw Types', () => {
  // --- Existing tests (preserved) ---

  test('registry has all openclaw types registered', () => {
    const types = registry.list();
    const slugs = types.map(t => t.slug);
    expect(slugs).toContain('openclaw-instance');
    expect(slugs).toContain('openclaw-agent');
    expect(slugs).toContain('openclaw-snapshot');
  });

  test('openclaw-instance type has required fields', () => {
    const fields = openclawInstanceType.schema.map(f => f.name);
    expect(fields).toContain('url');
    expect(fields).toContain('status');
    expect(fields).toContain('lastPingLatencyMs');
  });

  test('all types have ids', () => {
    for (const t of allOpenClawTypes) {
      expect(t.id).toBeTruthy();
      expect(t.slug).toBeTruthy();
    }
  });

  // --- New tests ---

  test('allOpenClawTypes array has exactly 18 items', () => {
    expect(allOpenClawTypes).toHaveLength(18);
  });

  test('registry.list() returns the same count as allOpenClawTypes.length', () => {
    const registeredCount = registry.list().length;
    expect(registeredCount).toBe(allOpenClawTypes.length);
  });

  test('registry.getBySlug returns the snapshot type for openclaw-snapshot', () => {
    const type = registry.getBySlug('openclaw-snapshot');
    expect(type).toBeDefined();
    expect(type!.id).toBe(openclawSnapshotType.id);
    expect(type!.slug).toBe('openclaw-snapshot');
  });

  test('registry.getBySlug returns the agent type for openclaw-agent', () => {
    const type = registry.getBySlug('openclaw-agent');
    expect(type).toBeDefined();
    expect(type!.id).toBe(openclawAgentType.id);
    expect(type!.slug).toBe('openclaw-agent');
  });

  test('openclawSnapshotType has agentCount in its schema fields', () => {
    const fieldNames = openclawSnapshotType.schema.map(f => f.name);
    expect(fieldNames).toContain('agentCount');
  });

  test('each type in allOpenClawTypes has a non-empty name string', () => {
    for (const t of allOpenClawTypes) {
      expect(typeof t.name).toBe('string');
      expect(t.name.length).toBeGreaterThan(0);
    }
  });

  test('each type in allOpenClawTypes has a non-empty slug string', () => {
    for (const t of allOpenClawTypes) {
      expect(typeof t.slug).toBe('string');
      expect(t.slug.length).toBeGreaterThan(0);
    }
  });
});
