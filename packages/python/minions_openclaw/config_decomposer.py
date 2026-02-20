"""Config decomposer - parses openclaw.json into minion tree."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from minions import Minion, Relation, create_minion, generate_id, now
from .types import (
    openclaw_agent_type,
    openclaw_channel_type,
    openclaw_model_provider_type,
    openclaw_skill_type,
    openclaw_tool_config_type,
    openclaw_session_config_type,
    openclaw_gateway_config_type,
    openclaw_talk_config_type,
    openclaw_browser_config_type,
    openclaw_hook_type,
    openclaw_cron_job_type,
    openclaw_discovery_config_type,
    openclaw_identity_config_type,
    openclaw_canvas_config_type,
    openclaw_logging_config_type,
    openclaw_ui_config_type,
    registry,
)

DATA_DIR = Path.home() / '.openclaw-manager'
DATA_FILE = DATA_DIR / 'data.json'


def _read_storage() -> Dict[str, Any]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        return json.loads(DATA_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {'minions': [], 'relations': []}


def _write_storage(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(data, indent=2))


_ARRAY_KEYS = {'agents', 'channels', 'modelProviders', 'skills', 'tools', 'hooks', 'cronJobs'}
_SINGLETON_KEYS = {
    'sessionConfig', 'gatewayConfig', 'talkConfig', 'browserConfig',
    'discoveryConfig', 'identityConfig', 'canvasConfig', 'loggingConfig', 'uiConfig',
}


class ConfigDecomposer:
    def load_from_file(self, path: str) -> Dict[str, Any]:
        return json.loads(Path(path).read_text())

    def decompose(self, config: Dict[str, Any], parent_instance_id: str) -> Tuple[List[Minion], List[Relation]]:
        minions: List[Minion] = []
        relations: List[Relation] = []

        def add_child(minion: Minion) -> None:
            minions.append(minion)
            relations.append(Relation(
                id=generate_id(),
                source_id=parent_instance_id,
                target_id=minion.id,
                type='parent_of',
                created_at=now(),
            ))

        def make(type_, title: str, fields: Dict[str, Any]) -> Minion:
            m, _ = create_minion({"title": title, "fields": fields}, type_)
            return m

        for agent in config.get('agents', []):
            add_child(make(openclaw_agent_type, agent.get('name', 'agent'), {
                'name': agent.get('name', ''),
                'model': agent.get('model', ''),
                'systemPrompt': agent.get('systemPrompt', ''),
                'tools': json.dumps(agent.get('tools', [])),
                'channels': json.dumps(agent.get('channels', [])),
                'skills': json.dumps(agent.get('skills', [])),
                'enabled': agent.get('enabled', True),
            }))

        for ch in config.get('channels', []):
            add_child(make(openclaw_channel_type, ch.get('name', 'channel'), {
                'type': ch.get('type', ''),
                'name': ch.get('name', ''),
                'config': json.dumps(ch.get('config', {})),
                'enabled': ch.get('enabled', True),
            }))

        for mp in config.get('modelProviders', []):
            add_child(make(openclaw_model_provider_type, f"{mp.get('provider', '')}/{mp.get('model', '')}", {
                'provider': mp.get('provider', ''),
                'model': mp.get('model', ''),
                'apiKey': mp.get('apiKey', ''),
                'baseUrl': mp.get('baseUrl', ''),
                'enabled': mp.get('enabled', True),
            }))

        for skill in config.get('skills', []):
            add_child(make(openclaw_skill_type, skill.get('name', 'skill'), {
                'name': skill.get('name', ''),
                'description': skill.get('description', ''),
                'enabled': skill.get('enabled', True),
                'config': json.dumps(skill.get('config', {})),
            }))

        for tool in config.get('tools', []):
            add_child(make(openclaw_tool_config_type, tool.get('name', 'tool'), {
                'name': tool.get('name', ''),
                'type': tool.get('type', ''),
                'config': json.dumps(tool.get('config', {})),
                'enabled': tool.get('enabled', True),
            }))

        if sc := config.get('sessionConfig'):
            add_child(make(openclaw_session_config_type, 'Session Config', {
                'maxSessions': sc.get('maxSessions', 10),
                'sessionTimeout': sc.get('sessionTimeout', 3600),
                'persistSessions': sc.get('persistSessions', False),
            }))

        if gc := config.get('gatewayConfig'):
            add_child(make(openclaw_gateway_config_type, 'Gateway Config', {
                'host': gc.get('host', 'localhost'),
                'port': gc.get('port', 8080),
                'tlsEnabled': gc.get('tlsEnabled', False),
                'certPath': gc.get('certPath', ''),
                'keyPath': gc.get('keyPath', ''),
            }))

        if tc := config.get('talkConfig'):
            add_child(make(openclaw_talk_config_type, 'Talk Config', {
                'provider': tc.get('provider', ''),
                'voice': tc.get('voice', ''),
                'enabled': tc.get('enabled', False),
            }))

        if bc := config.get('browserConfig'):
            add_child(make(openclaw_browser_config_type, 'Browser Config', {
                'enabled': bc.get('enabled', False),
                'headless': bc.get('headless', True),
                'timeout': bc.get('timeout', 30000),
            }))

        for hook in config.get('hooks', []):
            add_child(make(openclaw_hook_type, hook.get('url', 'hook'), {
                'url': hook.get('url', ''),
                'events': json.dumps(hook.get('events', [])),
                'secret': hook.get('secret', ''),
                'enabled': hook.get('enabled', True),
            }))

        for cron in config.get('cronJobs', []):
            add_child(make(openclaw_cron_job_type, cron.get('name', 'cron'), {
                'name': cron.get('name', ''),
                'schedule': cron.get('schedule', ''),
                'action': cron.get('action', ''),
                'enabled': cron.get('enabled', True),
            }))

        if dc := config.get('discoveryConfig'):
            add_child(make(openclaw_discovery_config_type, 'Discovery Config', {
                'enabled': dc.get('enabled', False),
                'port': dc.get('port', 5353),
                'interfaces': json.dumps(dc.get('interfaces', [])),
            }))

        if ic := config.get('identityConfig'):
            add_child(make(openclaw_identity_config_type, ic.get('name', 'Identity'), {
                'name': ic.get('name', ''),
                'deviceId': ic.get('deviceId', ''),
                'publicKey': ic.get('publicKey', ''),
            }))

        if cc := config.get('canvasConfig'):
            add_child(make(openclaw_canvas_config_type, 'Canvas Config', {
                'enabled': cc.get('enabled', False),
                'port': cc.get('port', 3000),
                'authEnabled': cc.get('authEnabled', True),
            }))

        if lc := config.get('loggingConfig'):
            add_child(make(openclaw_logging_config_type, 'Logging Config', {
                'level': lc.get('level', 'info'),
                'format': lc.get('format', 'json'),
                'outputs': json.dumps(lc.get('outputs', ['stdout'])),
            }))

        if uc := config.get('uiConfig'):
            add_child(make(openclaw_ui_config_type, 'UI Config', {
                'enabled': uc.get('enabled', False),
                'port': uc.get('port', 3001),
                'theme': uc.get('theme', 'default'),
            }))

        return minions, relations

    def compose(self, instance_id: str, storage: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Reconstruct an OpenClawConfig from a minion tree."""
        data = storage or _read_storage()

        child_ids = {
            r['targetId'] for r in data['relations']
            if r.get('sourceId') == instance_id and r.get('type') == 'parent_of'
        }
        children = [m for m in data['minions'] if m.get('id') in child_ids and not m.get('deletedAt')]

        type_to_key: Dict[str, str] = {
            openclaw_agent_type.id: 'agents',
            openclaw_channel_type.id: 'channels',
            openclaw_model_provider_type.id: 'modelProviders',
            openclaw_skill_type.id: 'skills',
            openclaw_tool_config_type.id: 'tools',
            openclaw_session_config_type.id: 'sessionConfig',
            openclaw_gateway_config_type.id: 'gatewayConfig',
            openclaw_talk_config_type.id: 'talkConfig',
            openclaw_browser_config_type.id: 'browserConfig',
            openclaw_hook_type.id: 'hooks',
            openclaw_cron_job_type.id: 'cronJobs',
            openclaw_discovery_config_type.id: 'discoveryConfig',
            openclaw_identity_config_type.id: 'identityConfig',
            openclaw_canvas_config_type.id: 'canvasConfig',
            openclaw_logging_config_type.id: 'loggingConfig',
            openclaw_ui_config_type.id: 'uiConfig',
        }

        config: Dict[str, Any] = {}
        for child in children:
            key = type_to_key.get(child.get('minionTypeId', ''))
            if not key:
                continue
            fields: Dict[str, Any] = {}
            for k, v in child.get('fields', {}).items():
                if isinstance(v, str):
                    try:
                        fields[k] = json.loads(v)
                    except (json.JSONDecodeError, ValueError):
                        fields[k] = v
                else:
                    fields[k] = v

            if key in _ARRAY_KEYS:
                config.setdefault(key, []).append(fields)
            else:
                config[key] = fields

        return config

    def diff(
        self,
        config_a: Dict[str, Any],
        config_b: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Return added/removed/changed sections between two configs."""
        added: Dict[str, Any] = {}
        removed: Dict[str, Any] = {}
        changed: Dict[str, Any] = {}

        for key in _ARRAY_KEYS:
            a_items: List[Dict[str, Any]] = config_a.get(key, [])
            b_items: List[Dict[str, Any]] = config_b.get(key, [])
            a_names = {item.get('name', json.dumps(item)) for item in a_items}
            b_names = {item.get('name', json.dumps(item)) for item in b_items}
            added_items = [i for i in b_items if i.get('name', json.dumps(i)) not in a_names]
            removed_items = [i for i in a_items if i.get('name', json.dumps(i)) not in b_names]
            if added_items:
                added[key] = added_items
            if removed_items:
                removed[key] = removed_items

        for key in _SINGLETON_KEYS:
            a_val = config_a.get(key)
            b_val = config_b.get(key)
            if not a_val and b_val:
                added[key] = b_val
            elif a_val and not b_val:
                removed[key] = a_val
            elif a_val and b_val:
                changed_fields: Dict[str, Any] = {}
                all_keys = set(list(a_val.keys()) + list(b_val.keys()))
                for k in all_keys:
                    if json.dumps(a_val.get(k), sort_keys=True, default=str) != json.dumps(b_val.get(k), sort_keys=True, default=str):
                        changed_fields[k] = {'from': a_val.get(k), 'to': b_val.get(k)}
                if changed_fields:
                    changed[key] = changed_fields

        return {'added': added, 'removed': removed, 'changed': changed}
