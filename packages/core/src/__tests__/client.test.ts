import { describe, it, expect } from 'vitest';
import { MinionsOpenClaw, OpenClawPlugin } from '../client/index.js';
import { Minions } from 'minions-sdk';

describe('OpenClaw SDK Client', () => {
    it('should initialize MinionsOpenClaw and access openclaw module', () => {
        const client = new MinionsOpenClaw();
        expect(client.openclaw).toBeDefined();
        expect(client.openclaw.instances).toBeDefined();
        expect(client.openclaw.snapshots).toBeDefined();
        expect(client.openclaw.config).toBeDefined();
        expect(client.openclaw.createGatewayClient).toBeDefined();
    });

    it('should be mountable as a plugin on core Minions client', () => {
        const minions = new Minions({ plugins: [new OpenClawPlugin()] });
        expect((minions as any).openclaw).toBeDefined();
        expect((minions as any).openclaw.instances).toBeDefined();
    });
});
