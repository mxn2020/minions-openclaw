"""Tests for SnapshotManager."""

import pytest
import json
from pathlib import Path
from minions_openclaw.snapshot_manager import SnapshotManager
from minions_openclaw.instance_manager import InstanceManager
from minions_openclaw.types import openclaw_snapshot_type
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


# ─── Original 5 tests ─────────────────────────────────────────────────────────

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


# ─── 12 new tests ─────────────────────────────────────────────────────────────

def test_capture_snapshot_twice_second_follows_first_via_list(manager, instance_manager):
    """Two snapshots for the same instance are both visible in list_snapshots."""
    instance = instance_manager.register('Instance', 'ws://localhost:8080')
    snap1 = manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    snap2 = manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    snapshots = manager.list_snapshots(instance.id)
    ids = [s['id'] for s in snapshots]
    assert snap1.id in ids
    assert snap2.id in ids


def test_list_snapshots_unknown_instance_id_returns_empty(manager):
    """list_snapshots() for an instance ID that has no snapshots returns []."""
    result = manager.list_snapshots('no-such-instance')
    assert result == []


def test_get_latest_snapshot_with_no_snapshots_returns_none(manager, instance_manager):
    """When no snapshots exist for an instance, get_history() returns an empty list."""
    instance = instance_manager.register('Empty', 'ws://localhost:8080')
    history = manager.get_history(instance.id)
    assert history == []


def test_snapshot_agent_count_equals_len_of_agents(manager, instance_manager):
    """agentCount field matches the number of agents in the gateway data."""
    instance = instance_manager.register('AgentCountTest', 'ws://localhost:8080')
    data = {'agents': [{'id': 'x'}, {'id': 'y'}, {'id': 'z'}], 'channels': [], 'models': []}
    snapshot = manager.capture_snapshot(instance.id, data)
    assert snapshot.fields['agentCount'] == 3


def test_snapshot_model_count_equals_len_of_models(manager, instance_manager):
    """modelCount field matches the number of models in the gateway data."""
    instance = instance_manager.register('ModelCountTest', 'ws://localhost:8080')
    data = {'agents': [], 'channels': [], 'models': [{'id': 'm1'}, {'id': 'm2'}]}
    snapshot = manager.capture_snapshot(instance.id, data)
    assert snapshot.fields['modelCount'] == 2


def test_config_json_round_trips_correctly(manager, instance_manager):
    """Config stored in snapshot.fields['config'] deserialises back to the original dict."""
    instance = instance_manager.register('RoundTrip', 'ws://localhost:8080')
    original_config = {'version': '2.0', 'port': 9999, 'debug': True}
    data = {**SAMPLE_GATEWAY_DATA, 'config': original_config}
    snapshot = manager.capture_snapshot(instance.id, data)
    recovered = json.loads(snapshot.fields['config'])
    assert recovered == original_config


def test_diff_snapshots_detects_removed_fields():
    """diff_snapshots reports a field present in snap1 but absent in snap2."""
    mgr = SnapshotManager()
    ts = datetime.now(timezone.utc).isoformat()
    snap1 = Minion(
        id='r1', title='Old',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 5, 'legacyField': 'gone'},
        created_at=ts, updated_at=ts,
    )
    snap2 = Minion(
        id='r2', title='New',
        minion_type_id='openclaw-snapshot',
        fields={'agentCount': 5},
        created_at=ts, updated_at=ts,
    )
    diff = mgr.diff_snapshots(snap1, snap2)
    assert 'legacyField' in diff
    assert diff['legacyField']['from'] == 'gone'
    assert diff['legacyField']['to'] is None


def test_two_instances_have_separate_snapshot_histories(manager, instance_manager):
    """Snapshots captured for instance A do not appear in list_snapshots for instance B."""
    inst_a = instance_manager.register('A', 'ws://localhost:8080')
    inst_b = instance_manager.register('B', 'ws://localhost:8081')
    snap_a = manager.capture_snapshot(inst_a.id, SAMPLE_GATEWAY_DATA)
    snapshots_b = manager.list_snapshots(inst_b.id)
    ids_b = [s['id'] for s in snapshots_b]
    assert snap_a.id not in ids_b


def test_list_snapshots_returns_at_least_two_after_two_captures(manager, instance_manager):
    """After capturing two snapshots, list_snapshots returns at least 2 entries."""
    instance = instance_manager.register('TwoSnaps', 'ws://localhost:8080')
    manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    snapshots = manager.list_snapshots(instance.id)
    assert len(snapshots) >= 2


def test_snapshot_has_openclaw_snapshot_minion_type_id(manager, instance_manager):
    """The snapshot minion's minion_type_id matches openclaw_snapshot_type.id."""
    instance = instance_manager.register('TypeTest', 'ws://localhost:8080')
    snapshot = manager.capture_snapshot(instance.id, SAMPLE_GATEWAY_DATA)
    assert snapshot.minion_type_id == openclaw_snapshot_type.id


def test_capture_snapshot_with_empty_gateway_data_gives_zero_counts(manager, instance_manager):
    """When gateway_data has no agents/channels/models, all counts are 0."""
    instance = instance_manager.register('Empty', 'ws://localhost:8080')
    snapshot = manager.capture_snapshot(instance.id, {})
    assert snapshot.fields['agentCount'] == 0
    assert snapshot.fields['channelCount'] == 0
    assert snapshot.fields['modelCount'] == 0


def test_diff_snapshots_identical_snapshots_returns_empty_diff():
    """diff_snapshots on two snapshots with identical fields returns an empty dict."""
    mgr = SnapshotManager()
    ts = datetime.now(timezone.utc).isoformat()
    fields = {'agentCount': 2, 'channelCount': 1, 'modelCount': 3}
    snap1 = Minion(
        id='d1', title='Same A',
        minion_type_id='openclaw-snapshot',
        fields=fields,
        created_at=ts, updated_at=ts,
    )
    snap2 = Minion(
        id='d2', title='Same B',
        minion_type_id='openclaw-snapshot',
        fields=fields,
        created_at=ts, updated_at=ts,
    )
    diff = mgr.diff_snapshots(snap1, snap2)
    assert diff == {}
