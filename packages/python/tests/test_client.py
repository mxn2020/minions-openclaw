import pytest
from minions import Minions
from minions_openclaw import MinionsOpenClaw, OpenClawPlugin

def test_minions_openclaw_standalone_client():
    client = MinionsOpenClaw()
    assert hasattr(client, "openclaw")
    assert hasattr(client.openclaw, "instances")
    assert hasattr(client.openclaw, "snapshots")
    assert hasattr(client.openclaw, "config")
    assert hasattr(client.openclaw, "create_gateway_client")

def test_openclaw_plugin_mounting_on_core():
    minions = Minions(plugins=[OpenClawPlugin()])
    assert hasattr(minions, "openclaw")
    assert hasattr(minions.openclaw, "instances")
