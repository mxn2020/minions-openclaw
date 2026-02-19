"""
Stub types for minions-sdk functionality.
The PyPI 'minions' package is a different AI orchestration tool and should NOT be imported.
These stubs provide Python equivalents of the TypeScript minions-sdk types.
"""
from __future__ import annotations
import uuid
import datetime
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Literal

FieldType = Literal['string', 'number', 'boolean', 'date', 'select', 'multi-select', 'url', 'email', 'textarea', 'tags', 'json', 'array']
RelationType = Literal[
    'parent_of', 'depends_on', 'implements', 'relates_to', 'inspired_by',
    'triggers', 'references', 'blocks', 'alternative_to', 'part_of', 'follows', 'integration_link'
]
MinionStatus = Literal['active', 'todo', 'in_progress', 'completed', 'cancelled']
MinionPriority = Literal['low', 'medium', 'high', 'urgent']


@dataclass
class FieldDefinition:
    name: str
    type: str
    required: bool = False
    label: str = ''
    description: str = ''
    default: Any = None
    options: List[str] = field(default_factory=list)


@dataclass
class MinionType:
    id: str
    name: str
    slug: str
    schema: List[FieldDefinition]
    description: str = ''
    icon: str = ''
    color: str = ''
    behaviors: List[str] = field(default_factory=list)


@dataclass
class Minion:
    id: str
    title: str
    minion_type_id: str
    fields: Dict[str, Any]
    created_at: str
    updated_at: str
    tags: List[str] = field(default_factory=list)
    status: str = 'active'
    priority: str = 'medium'
    description: str = ''
    deleted_at: Optional[str] = None


@dataclass
class Relation:
    id: str
    source_id: str
    target_id: str
    type: str
    created_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ValidationError:
    field: str
    message: str
    code: str = ''


@dataclass
class ValidationResult:
    valid: bool
    errors: List[ValidationError] = field(default_factory=list)


def generate_id() -> str:
    return str(uuid.uuid4())


def now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')


class TypeRegistry:
    def __init__(self) -> None:
        self._types: Dict[str, MinionType] = {}

    def register(self, t: MinionType) -> None:
        self._types[t.slug] = t

    def get_by_slug(self, slug: str) -> Optional[MinionType]:
        return self._types.get(slug)

    def get_by_id(self, id: str) -> Optional[MinionType]:
        for t in self._types.values():
            if t.id == id:
                return t
        return None

    def list(self) -> List[MinionType]:
        return list(self._types.values())


def create_minion(title: str, minion_type: MinionType, fields: Dict[str, Any], tags: Optional[List[str]] = None) -> tuple:
    ts = now()
    minion = Minion(
        id=generate_id(),
        title=title,
        minion_type_id=minion_type.id,
        fields=fields,
        created_at=ts,
        updated_at=ts,
        tags=tags or [],
    )
    errors = []
    for fd in minion_type.schema:
        if fd.required and fd.name not in fields:
            errors.append(ValidationError(field=fd.name, message=f'{fd.name} is required'))
    return minion, ValidationResult(valid=len(errors) == 0, errors=errors)


def soft_delete(minion: Minion) -> Minion:
    from dataclasses import replace
    return replace(minion, deleted_at=now(), status='cancelled')
