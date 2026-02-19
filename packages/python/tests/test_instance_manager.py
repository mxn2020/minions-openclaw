import pytest
import json
from pathlib import Path
from minions_openclaw.instance_manager import InstanceManager, DATA_FILE


@pytest.fixture(autouse=True)
def clean_storage():
    yield
    if DATA_FILE.exists():
        DATA_FILE.unlink()


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
