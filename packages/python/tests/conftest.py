"""Shared pytest fixtures for minions_openclaw tests."""
import pytest
from pathlib import Path

DATA_FILE = Path.home() / '.openclaw-manager' / 'data.json'


@pytest.fixture
def clean_storage():
    """Remove storage file before and after the test."""
    DATA_FILE.unlink(missing_ok=True)
    yield
    DATA_FILE.unlink(missing_ok=True)


@pytest.fixture
def instance_manager():
    from minions_openclaw.instance_manager import InstanceManager
    return InstanceManager()


@pytest.fixture
def snapshot_manager():
    from minions_openclaw.snapshot_manager import SnapshotManager
    return SnapshotManager()
