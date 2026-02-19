"""Gateway WebSocket client."""
from __future__ import annotations
import asyncio
import json
import hashlib
import hmac
import base64
from typing import Any, Dict, Optional

try:
    import websockets
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False


class GatewayClient:
    def __init__(self, url: str, token: Optional[str] = None, device_private_key: Optional[str] = None) -> None:
        self.url = url
        self.token = token
        self.device_private_key = device_private_key
        self._ws = None
        self._device_token: Optional[str] = None
        self._connected = False

    async def open_connection(self) -> None:
        if not HAS_WEBSOCKETS:
            raise RuntimeError("websockets package not installed. Run: pip install websockets")
        import websockets as ws_lib
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        self._ws = await ws_lib.connect(self.url, additional_headers=headers)
        msg = json.loads(await asyncio.wait_for(self._ws.recv(), timeout=10))
        if msg.get('type') == 'connect.challenge':
            nonce = msg['payload'].get('nonce', '')
            timestamp = msg['payload'].get('timestamp', '')
            signature = self._sign_challenge(nonce, timestamp)
            await self._ws.send(json.dumps({
                'type': 'connect',
                'payload': {
                    'role': 'operator',
                    'scopes': ['operator.read'],
                    'signature': signature,
                    'timestamp': timestamp,
                    'nonce': nonce,
                    **(({'deviceToken': self._device_token}) if self._device_token else {}),
                }
            }))
            response = json.loads(await asyncio.wait_for(self._ws.recv(), timeout=10))
            if response.get('type') == 'hello-ok':
                self._connected = True
                if response['payload'].get('deviceToken'):
                    self._device_token = response['payload']['deviceToken']
            elif response.get('type') == 'hello-error':
                raise RuntimeError(f"Auth failed: {response.get('payload')}")

    def _sign_challenge(self, nonce: str, timestamp: str) -> str:
        if not self.device_private_key:
            return ''
        try:
            key = self.device_private_key.encode()
            msg_bytes = f'{nonce}:{timestamp}'.encode()
            sig = hmac.new(key, msg_bytes, hashlib.sha256).digest()
            return base64.b64encode(sig).decode()
        except Exception:
            return ''

    async def call(self, method: str, params: Optional[Dict[str, Any]] = None) -> Any:
        if not self._ws:
            raise RuntimeError("Not connected")
        from ._minions_stub import generate_id
        call_id = generate_id()
        await self._ws.send(json.dumps({'type': 'call', 'id': call_id, 'method': method, 'params': params or {}}))
        while True:
            raw = await asyncio.wait_for(self._ws.recv(), timeout=10)
            msg = json.loads(raw)
            if msg.get('id') == call_id:
                return msg.get('payload')

    async def fetch_presence(self) -> Dict[str, Any]:
        results = await asyncio.gather(
            self.call('agents.list'),
            self.call('channels.list'),
            self.call('models.list'),
            self.call('system-presence'),
            return_exceptions=True
        )
        agents_r, channels_r, models_r, config_r = results
        return {
            'agents': (agents_r.get('items', []) if isinstance(agents_r, dict) else []),
            'channels': (channels_r.get('items', []) if isinstance(channels_r, dict) else []),
            'models': (models_r.get('items', []) if isinstance(models_r, dict) else []),
            'config': (config_r if isinstance(config_r, dict) else {}),
        }

    async def close(self) -> None:
        if self._ws:
            await self._ws.close()
            self._ws = None
            self._connected = False

    @property
    def device_token(self) -> Optional[str]:
        return self._device_token
