import { registry, openclawInstanceType, allOpenClawTypes } from '../src/types.js';

describe('OpenClaw Types', () => {
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
});
