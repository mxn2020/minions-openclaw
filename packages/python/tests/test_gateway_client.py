"""Tests for GatewayClient synchronous/property aspects."""
import asyncio
import inspect
from minions_openclaw.gateway_client import GatewayClient


def test_gateway_client_stores_url():
    client = GatewayClient(url='ws://localhost:18789')
    assert client.url == 'ws://localhost:18789'


def test_device_token_returns_none_initially():
    client = GatewayClient(url='ws://localhost:18789')
    assert client.device_token is None


def test_gateway_client_url_attribute_correct():
    url = 'ws://192.168.1.100:18789'
    client = GatewayClient(url=url)
    assert client.url == url


def test_gateway_client_constructed_with_optional_token():
    client = GatewayClient(url='ws://localhost:18789', token='my-secret-token')
    assert client.token == 'my-secret-token'
    assert client.url == 'ws://localhost:18789'


def test_fetch_presence_is_async_callable():
    client = GatewayClient(url='ws://localhost:18789')
    assert callable(client.fetch_presence)
    assert inspect.iscoroutinefunction(client.fetch_presence)
