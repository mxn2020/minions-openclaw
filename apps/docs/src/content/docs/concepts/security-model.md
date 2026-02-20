---
title: Security Model
description: Token storage in ~/.openclaw-manager/data.json, RSA keys, file permissions, and the threat model.
---

`minions-openclaw` is designed for environments where the management client runs on a developer's workstation or a trusted CI machine. The security model makes two core assumptions:

1. The file system path `~/.openclaw-manager/` is accessible only to the process owner.
2. The network connection to the gateway may be untrusted (e.g., over `ws://`), so authentication must not rely on channel confidentiality.

Given these constraints, the system uses RSA asymmetric cryptography for authentication and restricts sensitive files using OS file permissions.

## Authentication Flow

When `GatewayClient.openConnection()` is called, it performs a 7-step handshake:

1. **Connect** — WebSocket connection to `ws://gateway:18789`
2. **Receive challenge** — Gateway sends a random nonce string
3. **Sign challenge** — Client signs the nonce with its RSA PKCS1v15 SHA-256 private key
4. **Send signature** — Client returns `{ type: 'register', signature, token? }`
5. **Receive device token** — Gateway issues a device token for future sessions
6. **Authenticated** — Connection is ready for RPC calls
7. **Persist token** — Token is saved in `~/.openclaw-manager/data.json` for reuse

On subsequent connections, the saved device token is sent in step 4, skipping RSA re-signing if the gateway accepts the token.

## Token Storage

Device tokens are stored in `~/.openclaw-manager/data.json` alongside instance registrations. This file contains:

```json
{
  "minions": [
    {
      "id": "...",
      "minionTypeId": "openclaw-instance",
      "fields": {
        "url": "ws://192.168.1.100:18789",
        "token": "eyJhbGciOiJSUzI1NiJ9...",
        "status": "connected"
      }
    }
  ]
}
```

**Recommended file permissions:** Set `~/.openclaw-manager/data.json` to mode `600` (owner read/write only):

```bash
chmod 600 ~/.openclaw-manager/data.json
chmod 700 ~/.openclaw-manager/
```

## RSA Key Management

The `devicePrivateKey` parameter to `GatewayClient` should be a PEM-encoded RSA private key (minimum 2048 bits):

```typescript
import { readFileSync } from 'fs';

const privateKey = readFileSync('~/.ssh/openclaw_rsa', 'utf-8');
const client = new GatewayClient('ws://gateway:18789', undefined, privateKey);
```

**Never commit private keys to version control.** Use environment variables or a secrets manager:

```typescript
const privateKey = process.env.OPENCLAW_PRIVATE_KEY;
const client = new GatewayClient(url, token, privateKey);
```

## Transport Security

- **Local network only**: OpenClaw Gateway is designed for LAN use. Avoid exposing port 18789 to the internet.
- **Use WSS in production**: If you must connect over the internet, tunnel through nginx with TLS:
  ```nginx
  location /openclaw {
    proxy_pass http://127.0.0.1:18789;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }
  ```
- **Firewall rules**: Restrict port 18789 to known management hosts.

## Data Minimization

minions-openclaw stores the minimum data needed:

- Instance URL and connection status
- Device token for re-authentication
- Snapshot field counts (not the raw agent/channel/model objects)
- Config JSON string within snapshots (for diff purposes)

The raw agent list, channel details, and model credentials are **never persisted** outside of snapshot config blobs.

## Threat Model

| Threat | Mitigation |
|---|---|
| Network eavesdropping on `ws://` | Use `wss://` in production. RSA challenge-response prevents auth compromise even on unencrypted channels. |
| `data.json` read by another user | `0600` file permissions prevent this on single-user systems. Use OS keychain storage on shared systems. |
| Stolen session token | Short expiry limits the exposure window. Revoke the device immediately if suspected. |
| Replay of a captured auth message | Nonce is single-use; the gateway rejects replayed signatures. |
| Private key exfiltration | Use keychain storage. Do not commit `data.json` to version control. |

## OS Keychain Storage (Optional)

For higher-security environments, configure private keys to be stored in the OS keychain:

```typescript
const manager = new InstanceManager({ keyStorage: 'keychain' });
```

With keychain storage the `devicePrivateKey` field in `data.json` is set to `'[keychain]'`. The actual key is stored in Keychain (macOS), libsecret (Linux), or DPAPI (Windows) and loaded on demand for each signing operation. Even if `data.json` is read by an unauthorised process, the private key is not exposed.
