"""Snapshot manager."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from minions import Minion, Relation, create_minion, generate_id, now
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
            {
                "title": f"Snapshot {now()}",
                "fields": {
                    'instanceId': instance_id,
                    'capturedAt': now(),
                    'config': json.dumps(gateway_data.get('config', {})),
                    'agentCount': len(gateway_data.get('agents', [])),
                    'channelCount': len(gateway_data.get('channels', [])),
                    'modelCount': len(gateway_data.get('models', [])),
                }
            },
            openclaw_snapshot_type
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

    def get_history(self, instance_id: str) -> List[Dict[str, Any]]:
        """Return snapshots for instance ordered newest → oldest via follows chain."""
        storage = _read_storage()
        snapshot_ids = {
            r['targetId'] for r in storage['relations']
            if r.get('sourceId') == instance_id and r.get('type') == 'parent_of'
        }
        snapshots = [
            m for m in storage['minions']
            if m.get('id') in snapshot_ids
            and m.get('minionTypeId') == openclaw_snapshot_type.id
            and not m.get('deletedAt')
        ]

        # Build follows map: snapshot_id → previous_snapshot_id
        follows_map: Dict[str, str] = {}
        for r in storage['relations']:
            if r.get('type') == 'follows' and r.get('sourceId') in snapshot_ids:
                follows_map[r['sourceId']] = r['targetId']

        targets = set(follows_map.values())
        head = next((s for s in snapshots if s['id'] not in targets), None)
        if not head:
            return sorted(snapshots, key=lambda m: m.get('createdAt', ''), reverse=True)

        by_id = {s['id']: s for s in snapshots}
        ordered: List[Dict[str, Any]] = []
        current: Optional[Dict[str, Any]] = head
        while current:
            ordered.append(current)
            next_id = follows_map.get(current['id'])
            current = by_id.get(next_id) if next_id else None
        return ordered

    def compare(self, snapshot_id1: str, snapshot_id2: str) -> Dict[str, Dict[str, Any]]:
        """Load two snapshots by ID and return their diff."""
        storage = _read_storage()
        by_id = {m['id']: m for m in storage['minions']}
        raw_a = by_id.get(snapshot_id1)
        raw_b = by_id.get(snapshot_id2)
        if not raw_a:
            raise ValueError(f"Snapshot not found: {snapshot_id1}")
        if not raw_b:
            raise ValueError(f"Snapshot not found: {snapshot_id2}")

        def _to_minion(d: Dict[str, Any]) -> Minion:
            return Minion(
                id=d['id'],
                title=d.get('title', ''),
                minion_type_id=d.get('minionTypeId', ''),
                fields=d.get('fields', {}),
                created_at=d.get('createdAt', ''),
                updated_at=d.get('updatedAt', ''),
                tags=d.get('tags', []),
                status=d.get('status', 'active'),
                priority=d.get('priority', 'medium'),
                description=d.get('description', ''),
            )

        return self.diff_snapshots(_to_minion(raw_a), _to_minion(raw_b))

    def diff_snapshots(self, a: Minion, b: Minion) -> Dict[str, Dict[str, Any]]:
        """Compare two snapshots and return a dict of changed fields.

        Args:
            a: The first (baseline) snapshot minion.
            b: The second (comparison) snapshot minion.

        Returns:
            Dict mapping field name to {'from': old_value, 'to': new_value}
            for each field that differs between the two snapshots.
        """
        import json as _json
        diff: Dict[str, Dict[str, Any]] = {}
        all_keys = set(list(a.fields.keys()) + list(b.fields.keys()))
        for key in all_keys:
            va = a.fields.get(key)
            vb = b.fields.get(key)
            if _json.dumps(va, sort_keys=True, default=str) != _json.dumps(vb, sort_keys=True, default=str):
                diff[key] = {'from': va, 'to': vb}
        return diff
