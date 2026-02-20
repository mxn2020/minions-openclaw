# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅         |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, email **security@minions.dev** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You will receive a response within **72 hours**. If the issue is confirmed, we aim to release a patch within **14 days** and will credit you in the release notes (unless you prefer to remain anonymous).

## Scope

This security policy covers:

- `@minions-openclaw/sdk` (npm package)
- `minions-openclaw` (PyPI package)
- `@minions-openclaw/cli` (npm package)
- The minions-openclaw web dashboard
- The minions-openclaw documentation site

## Security-Sensitive Areas

OpenClaw manages gateway connections with RSA key authentication. Particular care should be taken with:

- **Device tokens** stored in `~/.openclaw-manager/data.json` — file permissions should be `600`
- **RSA private keys** used for challenge signing — never include in version control
- **WebSocket connections** — always use `wss://` in production environments
- **Gateway URLs** — validate and sanitize before connecting

## Out of Scope

- Vulnerabilities in third-party dependencies (please report those upstream)
- Issues without a realistic exploit path
- Security of the remote OpenClaw Gateway itself (report to gateway maintainers)
