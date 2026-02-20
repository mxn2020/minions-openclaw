"""Tests for SnapshotManager."""

import pytest
import json
from pathlib import Path
from minions_openclaw.snapshot_manager import SnapshotManager
from minions_openclaw.instance_manager import InstanceManager
from minions import Minion
from datetime import datetime, timezone

DATA_FILE = Path.home() / '.openclaw-manager' / 'data.json'

SAMPLE_GATEWAY_DATA = {
    'agents': [{'id': 'a1', 'name': 'Main'}, {'id': 'a2', 'name': 'Sub'}],
    'channels': [{'id': 'c1', 'type': 'telegram'}],
    'models': [{'id': 'm1', 'provider': 'anthropic'}],
    'config': {'version': '1.0', 'port': 18789},
}


@pytest.fixture(autouse=True)
def clean_storage():
    DATA_FILE.unlink(missing_ok=True)
    yield
    DATA_FILE.unlink(missing_ok=True)


@pytest.fixture
def manager():
    return SnapshotManager()


@pytest.fixture
def instance_manager():
    return InstanceManager()


def test_capture_snapshot_creates_minion(manager, instance_manager):
    instance = instance_manager.register('Test', 'ws://localhost:8080')
    snapshot = manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)

    assert snapshot is not None
    assert snapshot.fields['agentCount'] == 2
    assert snapshot.fields['channelCount'] == 1
    assert snapshot.fields['modelCount'] == 1
    assert snapshot.fields['instanceId'] == instance.id


def test_capture_snapshot_stores_config_as_json(manager, instance_manager):
    instance = instance_manager.register('Test', 'ws://localhost:8080')
    snapshot = manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)

    config = json.loads(snapshot.fields['config'])
    assert config['port'] == 18789


def test_list_snapshots_returns_captured_snapshots(manager, instance_manager):
    instance = instance_manager.register('Test', 'ws://localhost:8080')
    manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    manager.capture_snapshot(instance.id, {**SAMPLE_GATEWAY_DATA, 'agents': [{'id': 'a1'}]})

    snapshots = manager.list_snapshots(instance.id)
    assert len(snapshots) >= 1


def test_diff_snapshots_detects_changes():
    manager = SnapshotManager()
    now = datetime.now(timezone.utc).isoformat()

    snap1 = Minion(
        id='s1', title='Snap 1',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 2, 'channelCount': 1},
        created_at=now, updated_at=now,
    )
    snap2 = Minion(
        id='s2', title='Snap 2',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 3, 'channelCount': 1},
        created_at=now, updated_at=now,
    )

    diff = manager.diff_snapshots(snap1, snap2)
    assert 'agentCount' in diff
    assert diff['agentCount']['from'] == 2
    assert diff['agentCount']['to'] == 3
    assert 'channelCount' not in diff


def test_diff_snapshots_detects_added_fields():
    manager = SnapshotManager()
    now = datetime.now(timezone.utc).isoformat()

    snap1 = Minion(
        id='s1', title='Snap 1',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 1},
        created_at=now, updated_at=now,
    )
    snap2 = Minion(
        id='s2', title='Snap 2',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 1, 'newField': 'added'},
        created_at=now, updated_at=now,
    )

    diff = manager.diff_snapshots(snap1, snap2)
    assert 'newField' in diff
    assert diff['newField']['to'] == 'added'
