from minions_openclaw.types import (
    registry,
    openclaw_instance_type,
    openclaw_snapshot_type,
    openclaw_agent_type,
    ALL_TYPES,
)


def test_registry_has_types():
    types = registry.list()
    slugs = [t.slug for t in types]
    assert 'openclaw-instance' in slugs


def test_instance_type_fields():
    fields = [f.name for f in openclaw_instance_type.schema]
    assert 'url' in fields
    assert 'status' in fields
    assert 'lastPingLatencyMs' in fields


def test_all_types_have_ids():
    for t in ALL_TYPES:
        assert t.id
        assert t.slug


def test_all_types_has_exactly_n_items():
    # types.py defines exactly 18 MinionType entries in ALL_TYPES
    assert len(ALL_TYPES) == 18


def test_registry_list_length_equals_all_types():
    for t in ALL_TYPES:
        assert registry.has(t.id)


def test_registry_get_by_slug_snapshot():
    snapshot_type = registry.get_by_slug('openclaw-snapshot')
    assert snapshot_type is not None
    assert snapshot_type.slug == 'openclaw-snapshot'


def test_registry_get_by_slug_agent():
    agent_type = registry.get_by_slug('openclaw-agent')
    assert agent_type is not None
    assert agent_type.slug == 'openclaw-agent'


def test_openclaw_snapshot_type_has_agent_count_field():
    field_names = [f.name for f in openclaw_snapshot_type.schema]
    assert 'agentCount' in field_names


def test_every_type_has_non_empty_name():
    for t in ALL_TYPES:
        assert t.name and len(t.name) > 0


def test_every_type_has_non_empty_slug():
    for t in ALL_TYPES:
        assert t.slug and len(t.slug) > 0
