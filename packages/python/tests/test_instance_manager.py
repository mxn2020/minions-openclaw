import pytest
import json
from pathlib import Path
from minions_openclaw.instance_manager import InstanceManager, DATA_FILE
from minions_openclaw.types import openclaw_instance_type


@pytest.fixture(autouse=True)
def clean_storage():
    yield
    if DATA_FILE.exists():
        DATA_FILE.unlink()


# ─── Original 4 tests ─────────────────────────────────────────────────────────

def test_register_instance():
    manager = InstanceManager()
    m = manager.register('Test', 'ws://localhost:8080')
    assert m.title == 'Test'
    assert m.fields['url'] == 'ws://localhost:8080'


def test_list_instances():
    manager = InstanceManager()
    manager.register('A', 'ws://localhost:8080')
    manager.register('B', 'ws://localhost:8081')
    assert len(manager.list()) == 2


def test_remove_instance():
    manager = InstanceManager()
    m = manager.register('Delete Me', 'ws://localhost:8080')
    manager.remove(m.id)
    assert len(manager.list()) == 0


def test_get_by_id():
    manager = InstanceManager()
    m = manager.register('Find', 'ws://localhost:8080')
    found = manager.get_by_id(m.id)
    assert found is not None
    assert found.id == m.id


# ─── 10 new tests ─────────────────────────────────────────────────────────────

def test_register_with_token_stores_token_in_fields():
    """register() with token stores it in the minion's fields dict."""
    manager = InstanceManager()
    m = manager.register('Tokened', 'ws://localhost:8080', token='abc-secret')
    assert m.fields.get('token') == 'abc-secret'


def test_get_by_id_unknown_returns_none():
    """get_by_id() with an ID that was never registered returns None."""
    manager = InstanceManager()
    result = manager.get_by_id('nonexistent-id-xyz')
    assert result is None


def test_remove_nonexistent_raises():
    """remove() with an unknown ID raises ValueError rather than silently passing."""
    manager = InstanceManager()
    with pytest.raises(ValueError):
        manager.remove('ghost-id-000')


def test_list_on_fresh_manager_is_empty():
    """A freshly initialised InstanceManager (with no data file) returns an empty list."""
    manager = InstanceManager()
    assert manager.list() == []


def test_register_sets_status_to_registered():
    """register() always initialises the instance status field to 'registered'."""
    manager = InstanceManager()
    m = manager.register('StatusCheck', 'ws://localhost:9090')
    assert m.fields.get('status') == 'registered'


def test_after_remove_get_by_id_returns_none():
    """After remove(), get_by_id() for the same id returns None."""
    manager = InstanceManager()
    m = manager.register('Ephemeral', 'ws://localhost:8080')
    manager.remove(m.id)
    assert manager.get_by_id(m.id) is None


def test_register_multiple_instances_all_listed():
    """Registering three instances means list() returns exactly three entries."""
    manager = InstanceManager()
    manager.register('Alpha', 'ws://localhost:8081')
    manager.register('Beta', 'ws://localhost:8082')
    manager.register('Gamma', 'ws://localhost:8083')
    assert len(manager.list()) == 3


def test_registered_instance_has_openclaw_instance_minion_type():
    """The minion returned by register() has minion_type_id matching openclaw_instance_type."""
    manager = InstanceManager()
    m = manager.register('TypeCheck', 'ws://localhost:8080')
    assert m.minion_type_id == openclaw_instance_type.id


def test_register_same_url_twice_creates_two_separate_instances():
    """Registering the same URL twice produces two distinct minions."""
    manager = InstanceManager()
    m1 = manager.register('First', 'ws://localhost:8080')
    m2 = manager.register('Second', 'ws://localhost:8080')
    assert m1.id != m2.id
    assert len(manager.list()) == 2


def test_registered_instance_title_matches_name():
    """The title property of the returned minion matches the name argument."""
    manager = InstanceManager()
    m = manager.register('MyGateway', 'ws://localhost:8080')
    assert m.title == 'MyGateway'
