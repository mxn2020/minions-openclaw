import type { Minions, MinionPlugin } from 'minions-sdk';
import { allOpenClawTypes } from '../types.js';
import { InstanceManager } from '../InstanceManager.js';
import { SnapshotManager } from '../SnapshotManager.js';
import { ConfigDecomposer } from '../ConfigDecomposer.js';
import { GatewayClient } from '../GatewayClient.js';

export class OpenClawPlugin implements MinionPlugin {
    namespace = 'openclaw';

    init(core: Minions) {
        // Register all OpenClaw minion types
        for (const type of allOpenClawTypes) {
            if (core.registry.has(type.id)) continue;
            const existing = core.registry.getBySlug(type.slug);
            if (existing) {
                core.registry.remove(existing.id);
            }
            core.registry.register(type);
        }

        return {
            instances: new InstanceManager(),
            snapshots: new SnapshotManager(),
            config: new ConfigDecomposer(),
            createGatewayClient: (url: string, token?: string, devicePrivateKey?: string) => new GatewayClient(url, token, devicePrivateKey)
        };
    }
}
