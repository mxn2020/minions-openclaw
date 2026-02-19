"""Example: Register an OpenClaw Gateway instance."""
from minions_openclaw import InstanceManager


def main():
    manager = InstanceManager()

    instance = manager.register(
        'my-gateway',
        'ws://localhost:8080',
        'optional-auth-token'
    )

    print(f'Registered instance: {instance.id}')
    print(f'Title: {instance.title}')
    print(f"URL: {instance.fields['url']}")
    print(f"Status: {instance.fields['status']}")

    instances = manager.list()
    print(f'\nAll instances: {len(instances)}')


if __name__ == '__main__':
    main()
