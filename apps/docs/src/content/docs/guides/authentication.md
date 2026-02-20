---
title: Authentication
description: RSA key generation, token storage, and device registration flow for minions-openclaw.
---

## Overview

`minions-openclaw` uses asymmetric RSA cryptography to authenticate clients against an OpenClaw gateway. Instead of a shared password, each client device generates a key pair. The public key is registered on the gateway; the private key never leaves the client machine. Authentication happens via a signed challenge — the gateway issues a random nonce, the client signs it with its private key, and the gateway verifies the signature.

---

## RSA key generation

Keys are generated automatically by `InstanceManager.register()`. If you need to generate them manually (e.g., for pre-provisioning or scripting), use the `generateKeyPair` utility:

### TypeScript

```typescript
import { generateKeyPair } from '@minions-openclaw/core';

const { publicKey, privateKey } = await generateKeyPair();
// publicKey  — PEM-encoded RSA public key (2048-bit)
// privateKey — PEM-encoded RSA private key (2048-bit)
```

### Python

```python
from minions_openclaw import generate_key_pair

public_key, private_key = generate_key_pair()
```

### Using Node.js crypto directly

```typescript
import { generateKeyPairSync } from 'node:crypto';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
```

Key size of 2048 bits is the minimum. Use 4096 bits for higher-security environments.

---

## Token storage

All credentials are stored in `~/.openclaw-manager/data.json`. The file is created with mode `0600` (owner read/write only) on first write. The structure is:

```json
{
  "instances": {
    "<instance-id>": {
      "id": "<instance-id>",
      "fields": {
        "url": "ws://localhost:3000",
        "deviceId": "dev_01HXYZ...",
        "devicePublicKey": "-----BEGIN PUBLIC KEY-----\n...",
        "devicePrivateKey": "-----BEGIN PRIVATE KEY-----\n...",
        "token": "<last-session-token>",
        "status": "connected"
      }
    }
  }
}
```

The `devicePrivateKey` is stored in plaintext. On shared machines, consider:

- Setting a restrictive `umask` before starting the manager process.
- Mounting `~/.openclaw-manager` on an encrypted volume.
- Using the `keyring` option to store the private key in the OS keychain instead.

### OS keychain storage (optional)

```typescript
const manager = new InstanceManager({ keyStorage: 'keychain' });
```

When `keychain` is selected, the private key is stored via the system keychain (Keychain on macOS, libsecret on Linux, DPAPI on Windows) and omitted from `data.json`.

---

## Device registration flow

Registration is a one-time operation per gateway instance. `InstanceManager.register()` runs these steps:

1. **Generate key pair** — an RSA 2048-bit key pair is generated.
2. **Connect to the gateway** — a temporary WebSocket connection is opened.
3. **Complete initial handshake** — for first-time registration the gateway accepts a `register` message instead of `auth`:

```json
{
  "type": "register",
  "deviceId": "dev_01HXYZ...",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
}
```

4. **Receive registration token** — the gateway responds with a `registered` message containing the `deviceId` and an initial session token.
5. **Persist credentials** — `data.json` is updated with the device ID, both keys, and the session token.
6. **Close temporary connection** — subsequent connections use the full 7-step authenticated handshake.

```typescript
import { InstanceManager } from '@minions-openclaw/core';

const manager = new InstanceManager();

// Full registration (runs steps 1-6 automatically)
const instance = await manager.register({
  url: 'wss://gateway.example.com',
  label: 'production',
});

console.log('Device ID:', instance.fields.deviceId);
console.log('Registered successfully');
```

---

## Re-registration

If a device's credentials are lost or corrupted, remove the instance and re-register:

```typescript
await manager.remove(instance.id);
const newInstance = await manager.register({ url: 'wss://gateway.example.com' });
```

The gateway treats this as a new device. If the old `deviceId` needs to be removed from the gateway's device list, use the gateway's admin API or UI.

---

## Verifying credentials manually

To check that stored credentials are valid without a full connection:

```typescript
import { verifyCredentials } from '@minions-openclaw/core';

const result = await verifyCredentials(instance);
if (result.valid) {
  console.log('Credentials OK, device is registered on the gateway');
} else {
  console.error('Credentials invalid:', result.reason);
}
```

---

## Revoking a device

To permanently revoke a device's access, delete it from the gateway's device registry:

```typescript
const client = new GatewayClient(instance);
await client.connect();
await client.call('devices.revoke', { deviceId: instance.fields.deviceId });
await client.disconnect();

// Clean up local record
await manager.remove(instance.id);
```

After revocation, any subsequent connection attempt from that `deviceId` will be rejected with close code `4401`.
