"""Snapshot manager."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from ._minions_stub import Minion, Relation, create_minion, generate_id, now
from .types import openclaw_snapshot_type

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


class SnapshotManager:
    def capture_snapshot(self, instance_id: str, gateway_data: Dict[str, Any]) -> Minion:
        storage = _read_storage()
        minion, _ = create_minion(
            f"Snapshot {now()}",
            openclaw_snapshot_type,
            {
                'instanceId': instance_id,
                'capturedAt': now(),
                'config': json.dumps(gateway_data.get('config', {})),
                'agentCount': len(gateway_data.get('agents', [])),
                'channelCount': len(gateway_data.get('channels', [])),
                'modelCount': len(gateway_data.get('models', [])),
            }
        )
        minion_dict = {
            'id': minion.id,
            'title': minion.title,
            'minionTypeId': minion.minion_type_id,
            'fields': minion.fields,
            'createdAt': minion.created_at,
            'updatedAt': minion.updated_at,
            'tags': minion.tags,
            'status': minion.status,
            'priority': minion.priority,
            'description': minion.description,
        }
        storage['minions'].append(minion_dict)
        storage['relations'].append({
            'id': generate_id(),
            'sourceId': instance_id,
            'targetId': minion.id,
            'type': 'parent_of',
            'createdAt': now(),
            'metadata': {},
        })
        _write_storage(storage)
        return minion

    def list_snapshots(self, instance_id: str) -> List[Dict[str, Any]]:
        storage = _read_storage()
        snapshot_ids = {
            r['targetId'] for r in storage['relations']
            if r.get('sourceId') == instance_id and r.get('type') == 'parent_of'
        }
        return [
            m for m in storage['minions']
            if m.get('id') in snapshot_ids
            and m.get('minionTypeId') == openclaw_snapshot_type.id
            and not m.get('deletedAt')
        ]
