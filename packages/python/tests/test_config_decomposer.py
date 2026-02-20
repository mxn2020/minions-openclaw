import json
from minions import generate_id
from minions_openclaw.config_decomposer import ConfigDecomposer
from minions_openclaw.types import openclaw_agent_type


def test_decompose_agents():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    minions, relations = dc.decompose({
        'agents': [{'name': 'MyAgent', 'model': 'gpt-4'}]
    }, parent_id)
    assert len(minions) == 1
    assert minions[0].fields['name'] == 'MyAgent'
    assert relations[0].source_id == parent_id


def test_empty_config():
    dc = ConfigDecomposer()
    minions, relations = dc.decompose({}, generate_id())
    assert minions == []
    assert relations == []


def test_decompose_channels_section():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    config = {
        'channels': [
            {'name': 'web-ui', 'type': 'http', 'enabled': True},
            {'name': 'slack', 'type': 'slack', 'enabled': False},
        ]
    }
    minions, relations = dc.decompose(config, parent_id)
    assert len(minions) == 2
    names = [m.fields['name'] for m in minions]
    assert 'web-ui' in names
    assert 'slack' in names


def test_decompose_multiple_sections_total_count():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    config = {
        'agents': [
            {'name': 'agent-1', 'model': 'gpt-4'},
            {'name': 'agent-2', 'model': 'claude-3'},
        ],
        'channels': [
            {'name': 'web-ui', 'type': 'http'},
        ],
        'modelProviders': [
            {'provider': 'openai', 'model': 'gpt-4'},
        ],
    }
    minions, relations = dc.decompose(config, parent_id)
    assert len(minions) == 4
    assert len(relations) == 4


def test_compose_round_trips_agents():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    config = {
        'agents': [
            {'name': 'my-agent', 'model': 'gpt-4o', 'enabled': True},
        ]
    }
    minions, relations = dc.decompose(config, parent_id)

    # Build the in-memory storage dict that compose() expects (camelCase keys)
    storage = {
        'minions': [m.to_dict() for m in minions],
        'relations': [
            {
                'sourceId': r.source_id,
                'targetId': r.target_id,
                'type': r.type,
            }
            for r in relations
        ],
    }
    composed = dc.compose(parent_id, storage=storage)
    assert 'agents' in composed
    assert len(composed['agents']) == 1
    assert composed['agents'][0]['name'] == 'my-agent'


def test_diff_identical_configs_empty_result():
    dc = ConfigDecomposer()
    config = {
        'agents': [{'name': 'alpha', 'model': 'gpt-4'}],
        'sessionConfig': {'maxSessions': 5, 'sessionTimeout': 3600, 'persistSessions': False},
    }
    result = dc.diff(config, config)
    assert result['added'] == {}
    assert result['removed'] == {}
    assert result['changed'] == {}


def test_diff_with_added_agent():
    dc = ConfigDecomposer()
    config_a = {'agents': [{'name': 'alpha', 'model': 'gpt-4'}]}
    config_b = {
        'agents': [
            {'name': 'alpha', 'model': 'gpt-4'},
            {'name': 'beta', 'model': 'claude-3'},
        ]
    }
    result = dc.diff(config_a, config_b)
    assert 'agents' in result['added']
    added_names = [a['name'] for a in result['added']['agents']]
    assert 'beta' in added_names


def test_diff_with_removed_channel():
    dc = ConfigDecomposer()
    config_a = {
        'channels': [
            {'name': 'web-ui', 'type': 'http'},
            {'name': 'slack', 'type': 'slack'},
        ]
    }
    config_b = {
        'channels': [
            {'name': 'web-ui', 'type': 'http'},
        ]
    }
    result = dc.diff(config_a, config_b)
    assert 'channels' in result['removed']
    removed_names = [c['name'] for c in result['removed']['channels']]
    assert 'slack' in removed_names


def test_diff_with_changed_field():
    dc = ConfigDecomposer()
    config_a = {'sessionConfig': {'maxSessions': 5, 'sessionTimeout': 3600, 'persistSessions': False}}
    config_b = {'sessionConfig': {'maxSessions': 10, 'sessionTimeout': 3600, 'persistSessions': False}}
    result = dc.diff(config_a, config_b)
    assert 'sessionConfig' in result['changed']
    assert 'maxSessions' in result['changed']['sessionConfig']
    assert result['changed']['sessionConfig']['maxSessions']['from'] == 5
    assert result['changed']['sessionConfig']['maxSessions']['to'] == 10


def test_load_from_file_reads_valid_json(tmp_path):
    dc = ConfigDecomposer()
    config_data = {
        'agents': [{'name': 'file-agent', 'model': 'gpt-4'}],
        'channels': [{'name': 'web-ui', 'type': 'http'}],
    }
    config_file = tmp_path / 'openclaw.json'
    config_file.write_text(json.dumps(config_data))
    loaded = dc.load_from_file(str(config_file))
    assert 'agents' in loaded
    assert loaded['agents'][0]['name'] == 'file-agent'
    assert 'channels' in loaded


def test_minion_type_for_agent_minions_is_openclaw_agent_slug():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    minions, _ = dc.decompose(
        {'agents': [{'name': 'test-agent', 'model': 'gpt-4'}]},
        parent_id,
    )
    assert len(minions) == 1
    assert minions[0].minion_type_id == openclaw_agent_type.id


def test_decompose_session_config_creates_at_least_one_minion():
    dc = ConfigDecomposer()
    parent_id = generate_id()
    config = {
        'sessionConfig': {
            'maxSessions': 20,
            'sessionTimeout': 7200,
            'persistSessions': True,
        }
    }
    minions, relations = dc.decompose(config, parent_id)
    assert len(minions) >= 1
    assert len(relations) >= 1
    # The session config minion should carry the maxSessions field
    session_minion = minions[0]
    assert session_minion.fields['maxSessions'] == 20
