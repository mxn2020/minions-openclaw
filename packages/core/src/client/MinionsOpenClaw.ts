import { Minions } from 'minions-sdk';
import { OpenClawPlugin } from './OpenClawPlugin.js';

/**
 * Standalone Central Client for the OpenClaw SDK.
 * Inherits from `Minions` and automatically includes the `OpenClawPlugin`.
 */
export class MinionsOpenClaw extends Minions {
    // We specify the plugin type explicitly for TS autocomplete support
    declare public openclaw: ReturnType<OpenClawPlugin['init']>;

    constructor() {
        super({ plugins: [new OpenClawPlugin()] });
    }
}
