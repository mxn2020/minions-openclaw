---
title: Instances
description: Understand how OpenClaw Gateway instances are modelled, registered, and authenticated.
---

# Instances

An **instance** represents a single running [OpenClaw Gateway](https://github.com/mxn2020/openclaw). It is stored as a Minion of type `openclaw-instance` in `~/.openclaw-manager/data.json`.

## Instance Fields

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | WebSocket URL (`ws://` or `wss://`) of the gateway |
| `token` | string | Bearer token for HTTP/WS authentication |
| `deviceId` | string | Unique device identifier assigned by the gateway |
| `devicePublicKey` | string | RSA public key (PEM) for challenge-response auth |
| `devicePrivateKey` | string | RSA private key (PEM) — stored locally, never sent |
| `status` | string | `registered`, `reachable`, `unreachable` |
| `lastPingAt` | date | Timestamp of last successful ping |
| `lastPingLatencyMs` | number | Round-trip time in ms |
| `version` | string | Gateway version string |

## Registration

When you run `instance register`, an `openclawInstanceType` Minion is created and written to local storage. The gateway is not contacted at registration time — only at `ping` or `snapshot capture`.

```bash
openclaw-manager instance register my-home-gateway \
  --url ws://192.168.1.100:3001 \
  --token eyJhbGciOiJIUzI1NiJ9...
```

## Authentication

### Bearer Token

The simplest auth method. Pass `--token` at registration time. The token is sent as `Authorization: Bearer <token>` on every WebSocket connection.

### RSA Device Key (Challenge-Response)

For gateways with device-level auth enabled:

1. The gateway sends a `connect.challenge` message with a random nonce and timestamp.
2. The manager signs `nonce:timestamp` with PKCS1v15 + SHA-256 using your private key.
3. The gateway verifies the signature against your registered public key.

Generate a key pair:

```bash
openssl genrsa -out device.pem 2048
openssl rsa -in device.pem -pubout -out device.pub.pem
```

Register with both keys:

```bash
openclaw-manager instance register my-gateway \
  --url ws://localhost:3001 \
  --token <bearer> \
  --private-key "$(cat device.pem)" \
  --public-key "$(cat device.pub.pem)"
```

## Listing and Removing

```bash
openclaw-manager instance list
openclaw-manager instance remove <id>
```

Removal performs a soft-delete (sets `deletedAt`); the Minion remains in storage for audit purposes.
