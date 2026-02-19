"""Example: Config management with ConfigDecomposer."""
from minions_openclaw import ConfigDecomposer
from minions_openclaw._minions_stub import generate_id


def main():
    decomposer = ConfigDecomposer()

    config = {
        'agents': [
            {'name': 'assistant', 'model': 'gpt-4', 'enabled': True},
            {'name': 'coder', 'model': 'gpt-4-turbo', 'enabled': True},
        ],
    }

    instance_id = generate_id()
    minions, relations = decomposer.decompose(config, instance_id)

    print('Decomposed config:')
    print(f'  Minions: {len(minions)}')
    print(f'  Relations: {len(relations)}')

    for m in minions:
        print(f"  - {m.title}")


if __name__ == '__main__':
    main()
