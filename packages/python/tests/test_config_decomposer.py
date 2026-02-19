from minions_openclaw._minions_stub import generate_id
from minions_openclaw.config_decomposer import ConfigDecomposer


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
