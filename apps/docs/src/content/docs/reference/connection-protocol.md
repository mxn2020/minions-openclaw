---
title: Connection Protocol
description: The 7-step WebSocket handshake used by minions-openclaw to authenticate with an OpenClaw gateway.
---

## Overview

Every connection from `GatewayClient` to an OpenClaw gateway goes through a challenge-response authentication handshake before any RPC calls are permitted. The protocol uses RSA asymmetric cryptography: the gateway issues a random challenge, the client signs it with its private key, and the gateway verifies the signature against the registered public key.

This design means no shared secret needs to be transmitted over the wire. Even if the WebSocket stream is intercepted in plaintext (`ws://`), an attacker cannot forge a valid signature without the client's private key.

---

## The 7-step handshake

```
Client                                      Gateway
  |                                            |
  |  1. TCP + WebSocket upgrade                |
  |  ---------------------------------------->|
  |                                            |
  |  2. {"type":"challenge","nonce":"<uuid>"}  |
  |  <----------------------------------------|
  |                                            |
  |  3. Sign nonce with RSA private key        |
  |     (SHA-256, PKCS#1 v1.5 padding)         |
  |                                            |
  |  4. {"type":"auth",                        |
  |      "deviceId":"<id>",                    |
  |      "signature":"<base64>"}               |
  |  ---------------------------------------->|
  |                                            |
  |  5. Gateway verifies signature             |
  |     against stored public key              |
  |                                            |
  |  6. {"type":"token",                       |
  |      "token":"<session-token>"}            |
  |  <----------------------------------------|
  |                                            |
  |  7. Authenticated — RPC calls now allowed  |
  |  <=======================================> |
```

### Step 1: Connect

The client opens a standard WebSocket connection to the gateway URL (e.g., `ws://localhost:3000` or `wss://gateway.example.com`). The HTTP upgrade handshake follows the RFC 6455 protocol.

### Step 2: Receive challenge

Immediately after the WebSocket connection is established, the gateway sends a `challenge` message without waiting for any client input:

```json
{
  "type": "challenge",
  "nonce": "a3f9e8d2-1b5c-4e7a-9f0d-2c8b1e6a4d3f"
}
```

The `nonce` is a UUID v4 generated fresh for each connection. It is single-use: replaying a captured `auth` message from a previous session will fail.

### Step 3: Sign the nonce

The client signs the raw nonce string using:

- Algorithm: RSA-SHA256
- Padding: PKCS#1 v1.5
- Input: UTF-8 encoded nonce string
- Output: base64-encoded signature

```typescript
import { createSign } from 'node:crypto';

function signChallenge(nonce: string, privateKeyPem: string): string {
  const sign = createSign('SHA256');
  sign.update(nonce, 'utf-8');
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}
```

```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import base64

def sign_challenge(nonce: str, private_key_pem: str) -> str:
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode(), password=None
    )
    signature = private_key.sign(
        nonce.encode("utf-8"),
        padding.PKCS1v15(),
        hashes.SHA256(),
    )
    return base64.b64encode(signature).decode("ascii")
```

### Step 4: Send auth message

The client sends the signed nonce along with its registered device ID:

```json
{
  "type": "auth",
  "deviceId": "dev_01HXYZ...",
  "signature": "Base64EncodedSignatureHere=="
}
```

### Step 5: Gateway verifies

The gateway:

1. Looks up the device record for `deviceId`.
2. Verifies the signature against the stored RSA public key.
3. Checks that the nonce has not been used before.
4. Marks the nonce as consumed.

If verification fails, the gateway closes the WebSocket with code `4401` (Unauthorized).

### Step 6: Receive device token

On success, the gateway issues a short-lived session token:

```json
{
  "type": "token",
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

The token is a signed JWT with a short expiry (typically 1 hour). The client stores this token in memory for the duration of the session.

### Step 7: Authenticated — RPC calls

All subsequent messages on the connection use the token in their header field:

```json
{
  "type": "rpc",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "method": "agents.list",
  "params": {},
  "id": "req_001"
}
```

The gateway responds with:

```json
{
  "type": "response",
  "id": "req_001",
  "result": [ ... ]
}
```

---

## Error codes

| WebSocket close code | Meaning |
|---|---|
| `4400` | Malformed message (missing required fields) |
| `4401` | Authentication failed (bad signature or unknown device) |
| `4403` | Token expired — reconnect and re-authenticate |
| `4429` | Too many auth attempts — back off and retry |

---

## Reconnection behaviour

`GatewayClient` handles reconnection automatically when `autoReconnect: true` is set. After a disconnect, the client:

1. Waits `reconnectDelay` milliseconds.
2. Opens a new WebSocket connection.
3. Repeats the full 7-step handshake.
4. Re-subscribes to any active event listeners.

The existing session token is discarded on disconnect; a new one is issued after each successful handshake.
