import { describe, it, expect } from 'vitest';
import { ConfigDecomposer } from '../ConfigDecomposer.js';
import type { OpenClawConfig } from '../ConfigDecomposer.js';

describe('ConfigDecomposer', () => {
    const decomposer = new ConfigDecomposer();
    const parentId = 'test-instance-001';

    describe('decompose()', () => {
        it('should decompose agents into minions with parent_of relations', () => {
            const config: OpenClawConfig = {
                agents: [
                    { name: 'assistant', model: 'gpt-4', systemPrompt: 'You are a helpful assistant' },
                    { name: 'researcher', model: 'claude-3' },
                ],
            };

            const result = decomposer.decompose(config, parentId);

            expect(result.minions).toHaveLength(2);
            expect(result.relations).toHaveLength(2);

            expect(result.minions[0]!.title).toBe('assistant');
            expect(result.minions[0]!.fields['model']).toBe('gpt-4');
            expect(result.minions[0]!.fields['systemPrompt']).toBe('You are a helpful assistant');

            expect(result.minions[1]!.title).toBe('researcher');
            expect(result.minions[1]!.fields['model']).toBe('claude-3');

            // All relations should be parent_of from the instance
            for (const rel of result.relations) {
                expect(rel.sourceId).toBe(parentId);
                expect(rel.type).toBe('parent_of');
            }
        });

        it('should decompose channels', () => {
            const config: OpenClawConfig = {
                channels: [
                    { type: 'slack', name: 'general', config: { webhook: 'https://...' } },
                ],
            };

            const result = decomposer.decompose(config, parentId);

            expect(result.minions).toHaveLength(1);
            expect(result.minions[0]!.title).toBe('general');
            expect(result.minions[0]!.fields['type']).toBe('slack');
        });

        it('should decompose model providers', () => {
            const config: OpenClawConfig = {
                modelProviders: [
                    { provider: 'openai', model: 'gpt-4', apiKey: 'sk-test', enabled: true },
                ],
            };

            const result = decomposer.decompose(config, parentId);

            expect(result.minions).toHaveLength(1);
            expect(result.minions[0]!.title).toBe('openai/gpt-4');
            expect(result.minions[0]!.fields['provider']).toBe('openai');
        });

        it('should decompose singleton configs (session, gateway)', () => {
            const config: OpenClawConfig = {
                sessionConfig: { maxSessions: 50, sessionTimeout: 7200, persistSessions: true },
                gatewayConfig: { host: '0.0.0.0', port: 9090, tlsEnabled: true },
            };

            const result = decomposer.decompose(config, parentId);

            expect(result.minions).toHaveLength(2);

            const sessionMinion = result.minions.find(m => m.title === 'Session Config');
            expect(sessionMinion).toBeDefined();
            expect(sessionMinion!.fields['maxSessions']).toBe(50);
            expect(sessionMinion!.fields['persistSessions']).toBe(true);

            const gatewayMinion = result.minions.find(m => m.title === 'Gateway Config');
            expect(gatewayMinion).toBeDefined();
            expect(gatewayMinion!.fields['host']).toBe('0.0.0.0');
            expect(gatewayMinion!.fields['port']).toBe(9090);
        });

        it('should handle empty config', () => {
            const config: OpenClawConfig = {};
            const result = decomposer.decompose(config, parentId);

            expect(result.minions).toHaveLength(0);
            expect(result.relations).toHaveLength(0);
        });

        it('should decompose a full config with all sections', () => {
            const config: OpenClawConfig = {
                agents: [{ name: 'bot', model: 'gpt-4' }],
                channels: [{ type: 'web', name: 'chat' }],
                modelProviders: [{ provider: 'openai', model: 'gpt-4' }],
                skills: [{ name: 'search', description: 'Web search' }],
                tools: [{ name: 'calculator', type: 'function' }],
                hooks: [{ url: 'https://hooks.example.com' }],
                cronJobs: [{ name: 'cleanup', schedule: '0 * * * *', action: 'cleanSessions' }],
                sessionConfig: { maxSessions: 10 },
                gatewayConfig: { port: 8080 },
                talkConfig: { enabled: false },
                browserConfig: { headless: true },
                discoveryConfig: { enabled: true },
                identityConfig: { name: 'prod-device' },
                canvasConfig: { enabled: false },
                loggingConfig: { level: 'debug' },
                uiConfig: { enabled: true, port: 3001 },
            };

            const result = decomposer.decompose(config, parentId);

            // 7 array items + 9 singleton sections = 16 minions
            expect(result.minions).toHaveLength(16);
            expect(result.relations).toHaveLength(16);
        });

        it('should apply default values for optional fields', () => {
            const config: OpenClawConfig = {
                agents: [{ name: 'bot', model: 'gpt-4' }],
            };

            const result = decomposer.decompose(config, parentId);
            const agent = result.minions[0]!;

            expect(agent.fields['enabled']).toBe(true);
            expect(agent.fields['systemPrompt']).toBe('');
        });
    });

    describe('diff()', () => {
        it('should detect added array items', () => {
            const configA: OpenClawConfig = {
                agents: [{ name: 'bot1', model: 'gpt-4' }],
            };
            const configB: OpenClawConfig = {
                agents: [
                    { name: 'bot1', model: 'gpt-4' },
                    { name: 'bot2', model: 'claude-3' },
                ],
            };

            const diff = decomposer.diff(configA, configB);

            expect(diff.added.agents).toHaveLength(1);
            expect((diff.added.agents as Array<{ name: string }>)[0]!.name).toBe('bot2');
            expect(diff.removed.agents).toBeUndefined();
        });

        it('should detect removed array items', () => {
            const configA: OpenClawConfig = {
                agents: [
                    { name: 'bot1', model: 'gpt-4' },
                    { name: 'bot2', model: 'claude-3' },
                ],
            };
            const configB: OpenClawConfig = {
                agents: [{ name: 'bot1', model: 'gpt-4' }],
            };

            const diff = decomposer.diff(configA, configB);

            expect(diff.removed.agents).toHaveLength(1);
            expect((diff.removed.agents as Array<{ name: string }>)[0]!.name).toBe('bot2');
        });

        it('should detect added singleton configs', () => {
            const configA: OpenClawConfig = {};
            const configB: OpenClawConfig = {
                sessionConfig: { maxSessions: 10 },
            };

            const diff = decomposer.diff(configA, configB);

            expect(diff.added.sessionConfig).toBeDefined();
            expect((diff.added.sessionConfig as { maxSessions: number }).maxSessions).toBe(10);
        });

        it('should detect changed singleton configs', () => {
            const configA: OpenClawConfig = {
                gatewayConfig: { port: 8080 },
            };
            const configB: OpenClawConfig = {
                gatewayConfig: { port: 9090 },
            };

            const diff = decomposer.diff(configA, configB);

            expect(diff.changed.gatewayConfig).toBeDefined();
        });

        it('should return empty diff for identical configs', () => {
            const config: OpenClawConfig = {
                agents: [{ name: 'bot', model: 'gpt-4' }],
                sessionConfig: { maxSessions: 10 },
            };

            const diff = decomposer.diff(config, config);

            expect(Object.keys(diff.added)).toHaveLength(0);
            expect(Object.keys(diff.removed)).toHaveLength(0);
            expect(Object.keys(diff.changed)).toHaveLength(0);
        });
    });
});
