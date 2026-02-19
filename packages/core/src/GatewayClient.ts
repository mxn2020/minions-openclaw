import WebSocket from 'ws';
import { createSign } from 'crypto';
import { generateId } from 'minions-sdk';

export interface GatewayPresence {
  agents: unknown[];
  channels: unknown[];
  models: unknown[];
  config: Record<string, unknown>;
}

interface GatewayMessage {
  type: string;
  payload: Record<string, unknown>;
  id?: string;
}

export class GatewayClient {
  private ws: WebSocket | null = null;
  private deviceToken: string | null = null;
  private connected = false;

  constructor(
    private readonly url: string,
    private readonly token?: string,
    private readonly devicePrivateKey?: string
  ) {}

  async openConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url, {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });

        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
          this.ws?.close();
        }, 10000);

        this.ws.on('message', async (data: WebSocket.RawData) => {
          try {
            const msg = JSON.parse(data.toString()) as GatewayMessage;
            await this.handleMessage(
              msg,
              () => { clearTimeout(timeout); resolve(); },
              (err) => { clearTimeout(timeout); reject(err); }
            );
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });

        this.ws.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        this.ws.on('close', () => {
          if (!this.connected) {
            clearTimeout(timeout);
            resolve();
          }
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  private async handleMessage(
    msg: GatewayMessage,
    resolve: () => void,
    reject: (err: Error) => void
  ): Promise<void> {
    if (msg.type === 'connect.challenge') {
      const nonce = msg.payload['nonce'] as string;
      const timestamp = msg.payload['timestamp'] as string;
      const signature = this.signChallenge(nonce, timestamp);
      this.send({
        type: 'connect',
        payload: {
          role: 'operator',
          scopes: ['operator.read'],
          signature,
          timestamp,
          nonce,
          ...(this.deviceToken ? { deviceToken: this.deviceToken } : {}),
        },
      });
    } else if (msg.type === 'hello-ok') {
      this.connected = true;
      if (msg.payload['deviceToken']) {
        this.deviceToken = msg.payload['deviceToken'] as string;
      }
      resolve();
    } else if (msg.type === 'hello-error') {
      reject(new Error(`Auth failed: ${JSON.stringify(msg.payload)}`));
    }
  }

  /**
   * Sign the challenge nonce using RSA PKCS1v15 with SHA-256.
   * PKCS1v15 is used here for broad compatibility with existing gateway
   * implementations; matches the Python gateway_client.py behaviour.
   */
  private signChallenge(nonce: string, timestamp: string): string {
    if (!this.devicePrivateKey) return '';
    try {
      const sign = createSign('SHA256');
      sign.update(`${nonce}:${timestamp}`);
      return sign.sign(this.devicePrivateKey, 'base64');
    } catch {
      return '';
    }
  }

  send(msg: Omit<GatewayMessage, 'id'> & { id?: string }): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not open');
    }
    this.ws.send(JSON.stringify(msg));
  }

  async call(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }
      const id = generateId();
      const timeout = setTimeout(() => reject(new Error(`Timeout calling ${method}`)), 10000);

      const handler = (data: WebSocket.RawData) => {
        const msg = JSON.parse(data.toString()) as GatewayMessage;
        if (msg.id === id) {
          clearTimeout(timeout);
          this.ws?.off('message', handler);
          resolve(msg.payload);
        }
      };
      this.ws.on('message', handler);
      this.ws.send(JSON.stringify({ type: 'call', id, method, params }));
    });
  }

  async fetchPresence(): Promise<GatewayPresence> {
    const [agentsRaw, channelsRaw, modelsRaw, configRaw] = await Promise.allSettled([
      this.call('agents.list'),
      this.call('channels.list'),
      this.call('models.list'),
      this.call('system-presence'),
    ]);

    return {
      agents: (agentsRaw.status === 'fulfilled' ? (agentsRaw.value as { items?: unknown[] })?.items ?? [] : []),
      channels: (channelsRaw.status === 'fulfilled' ? (channelsRaw.value as { items?: unknown[] })?.items ?? [] : []),
      models: (modelsRaw.status === 'fulfilled' ? (modelsRaw.value as { items?: unknown[] })?.items ?? [] : []),
      config: (configRaw.status === 'fulfilled' ? configRaw.value as Record<string, unknown> : {}),
    };
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        resolve();
        return;
      }
      this.ws.once('close', () => resolve());
      this.ws.close();
    });
  }

  getDeviceToken(): string | null {
    return this.deviceToken;
  }
}
