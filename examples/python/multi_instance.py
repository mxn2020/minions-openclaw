"""Example: Managing multiple OpenClaw Gateway instances."""
from minions_openclaw import InstanceManager
from pathlib import Path
import json

DATA_FILE = Path.home() / '.openclaw-manager' / 'data.json'


def main():
    # Clean up before example
    if DATA_FILE.exists():
        DATA_FILE.unlink()

    manager = InstanceManager()

    prod = manager.register('production', 'ws://prod.example.com:8080', 'prod-token')
    staging = manager.register('staging', 'ws://staging.example.com:8080', 'staging-token')
    local = manager.register('local', 'ws://localhost:8080')

    print('Registered instances:')
    print(f'  Production: {prod.id}')
    print(f'  Staging: {staging.id}')
    print(f'  Local: {local.id}')

    instances = manager.list()
    print(f'\nTotal instances: {len(instances)}')

    for inst in instances:
        print(f"  {inst.title}: {inst.fields['url']} [{inst.fields['status']}]")

    manager.remove(prod.id)
    manager.remove(staging.id)
    manager.remove(local.id)
    print('\nCleaned up all instances')


if __name__ == '__main__':
    main()
