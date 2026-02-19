from minions_openclaw.types import registry, openclaw_instance_type, ALL_TYPES


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
