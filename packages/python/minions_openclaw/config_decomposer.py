"""Config decomposer - parses openclaw.json into minion tree."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

from ._minions_stub import Minion, Relation, create_minion, generate_id, now
from .types import (
    openclaw_agent_type, openclaw_snapshot_type,
    registry,
)


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

        for agent in config.get('agents', []):
            t = registry.get_by_slug('openclaw-agent') or openclaw_agent_type
            m, _ = create_minion(agent.get('name', 'agent'), t, {
                'name': agent.get('name', ''),
                'model': agent.get('model', ''),
                'systemPrompt': agent.get('systemPrompt', ''),
                'tools': json.dumps(agent.get('tools', [])),
                'channels': json.dumps(agent.get('channels', [])),
                'skills': json.dumps(agent.get('skills', [])),
                'enabled': agent.get('enabled', True),
            })
            add_child(m)

        return minions, relations
