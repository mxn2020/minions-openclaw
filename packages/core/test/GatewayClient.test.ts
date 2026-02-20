import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GatewayClient } from '../src/GatewayClient.js';

// Mock the 'ws' module so no real network connections are made.
// The mock factory returns a minimal EventEmitter-like class that matches
// the WebSocket API surface used by GatewayClient.
vi.mock('ws', () => {
  const OPEN = 1;
  const CLOSED = 3;

  class MockWebSocket {
    static OPEN = OPEN;
    static CLOSED = CLOSED;

    readyState: number;
    private handlers: Map<string, Array<(...args: unknown[]) => void>>;

    constructor() {
      // Start in a non-OPEN state so "not connected" assertions hold
      this.readyState = CLOSED;
      this.handlers = new Map();
    }

    on(event: string, handler: (...args: unknown[]) => void) {
      if (!this.handlers.has(event)) this.handlers.set(event, []);
      this.handlers.get(event)!.push(handler);
    }

    once(event: string, handler: (...args: unknown[]) => void) {
      const wrapper = (...args: unknown[]) => {
        handler(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    }

    off(event: string, handler: (...args: unknown[]) => void) {
      const list = this.handlers.get(event) ?? [];
      this.handlers.set(event, list.filter(h => h !== handler));
    }

    emit(event: string, ...args: unknown[]) {
      for (const h of this.handlers.get(event) ?? []) {
        h(...args);
      }
    }

    send(_data: string) {
      // no-op in mock
    }

    close() {
      this.readyState = CLOSED;
      this.emit('close');
    }
  }

  return { default: MockWebSocket };
});

describe('GatewayClient', () => {
  let client: GatewayClient;

  beforeEach(() => {
    client = new GatewayClient('ws://localhost:8080', undefined, undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Constructor sets url correctly (accessible via getDeviceToken being a known method;
  //         the url itself is private but construction without throwing confirms it was accepted)
  test('GatewayClient constructor does not throw for a valid ws:// URL', () => {
    expect(() => new GatewayClient('ws://localhost:8080')).not.toThrow();
  });

  // Test 2: close() can be called without throwing on a client that never connected
  test('close() resolves without throwing when client has never connected', async () => {
    const freshClient = new GatewayClient('ws://localhost:9999');
    // ws is null initially, so close() should resolve immediately
    await expect(freshClient.close()).resolves.toBeUndefined();
  });

  // Test 3: getDeviceToken() returns null initially (no stored token)
  test('getDeviceToken() returns null before any connection has been established', () => {
    const token = client.getDeviceToken();
    expect(token).toBeNull();
  });

  // Test 4: call() rejects if not connected (ws is null / readyState is not OPEN)
  test('call() rejects with "Not connected" error when not connected', async () => {
    // The mock WebSocket starts with readyState CLOSED, and openConnection is never called,
    // so ws is null — call() will reject.
    await expect(client.call('agents.list')).rejects.toThrow('Not connected');
  });

  // Test 5: fetchPresence() resolves to the expected shape even when not connected.
  // Because fetchPresence() uses Promise.allSettled internally, rejected calls are swallowed
  // and it returns empty arrays / empty object — a valid GatewayPresence shape.
  test('fetchPresence() resolves to empty presence shape when not connected', async () => {
    const presence = await client.fetchPresence();
    expect(presence).toHaveProperty('agents');
    expect(presence).toHaveProperty('channels');
    expect(presence).toHaveProperty('models');
    expect(presence).toHaveProperty('config');
    expect(Array.isArray(presence.agents)).toBe(true);
    expect(Array.isArray(presence.channels)).toBe(true);
    expect(Array.isArray(presence.models)).toBe(true);
    expect(typeof presence.config).toBe('object');
  });
});
