"""Instance manager - Python equivalent of TypeScript InstanceManager."""
from __future__ import annotations
import json
from pathlib import Path
from typing import List, Optional, Dict, Any

from ._minions_stub import Minion, Relation, create_minion, soft_delete, generate_id, now
from .types import openclaw_instance_type

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


def _minion_from_dict(d: Dict[str, Any]) -> Minion:
    return Minion(
        id=d['id'],
        title=d['title'],
        minion_type_id=d['minionTypeId'],
        fields=d.get('fields', {}),
        created_at=d.get('createdAt', now()),
        updated_at=d.get('updatedAt', now()),
        tags=d.get('tags', []),
        status=d.get('status', 'active'),
        priority=d.get('priority', 'medium'),
        description=d.get('description', ''),
        deleted_at=d.get('deletedAt'),
    )


def _minion_to_dict(m: Minion) -> Dict[str, Any]:
    d: Dict[str, Any] = {
        'id': m.id,
        'title': m.title,
        'minionTypeId': m.minion_type_id,
        'fields': m.fields,
        'createdAt': m.created_at,
        'updatedAt': m.updated_at,
        'tags': m.tags,
        'status': m.status,
        'priority': m.priority,
        'description': m.description,
    }
    if m.deleted_at:
        d['deletedAt'] = m.deleted_at
    return d


class InstanceManager:
    def register(self, name: str, url: str, token: Optional[str] = None) -> Minion:
        fields: Dict[str, Any] = {'url': url, 'status': 'registered'}
        if token:
            fields['token'] = token
        minion, validation = create_minion(name, openclaw_instance_type, fields)
        if not validation.valid:
            raise ValueError(f"Validation failed: {[e.message for e in validation.errors]}")
        storage = _read_storage()
        storage['minions'].append(_minion_to_dict(minion))
        _write_storage(storage)
        return minion

    def list(self) -> List[Minion]:
        storage = _read_storage()
        return [
            _minion_from_dict(m) for m in storage['minions']
            if m.get('minionTypeId') == openclaw_instance_type.id
            and not m.get('deletedAt')
        ]

    def get_by_id(self, id: str) -> Optional[Minion]:
        storage = _read_storage()
        for m in storage['minions']:
            if m.get('id') == id and not m.get('deletedAt'):
                return _minion_from_dict(m)
        return None

    def remove(self, id: str) -> None:
        storage = _read_storage()
        for i, m in enumerate(storage['minions']):
            if m.get('id') == id:
                minion = _minion_from_dict(m)
                deleted = soft_delete(minion)
                storage['minions'][i] = _minion_to_dict(deleted)
                _write_storage(storage)
                return
        raise ValueError(f"Instance {id} not found")
