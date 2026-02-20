from typing import Any, Optional
from minions import Minions, MinionPlugin

from ..types import ALL_TYPES
from ..instance_manager import InstanceManager
from ..snapshot_manager import SnapshotManager
from ..config_decomposer import ConfigDecomposer
from ..gateway_client import GatewayClient

class OpenClawPluginAPI:
    def __init__(self, core: Minions):
        self.instances = InstanceManager()
        self.snapshots = SnapshotManager()
        self.config = ConfigDecomposer()
        
    def create_gateway_client(
        self, url: str, token: Optional[str] = None, device_private_key: Optional[str] = None
    ) -> GatewayClient:
        return GatewayClient(url, token, device_private_key)

class OpenClawPlugin(MinionPlugin):
    """
    MinionPlugin implementation that mounts OpenClaw capabilities onto the core Minions client.
    """
    @property
    def namespace(self) -> str:
        return "openclaw"
        
    def init(self, core: Minions) -> Any:
        # Register all OpenClaw minion types
        for t in ALL_TYPES:
            if core.registry.has(t.id):
                continue
            
            existing = core.registry.get_by_slug(t.slug)
            if existing:
                core.registry.remove(existing.id)
                
            core.registry.register(t)
        
        # Return the API instance to be mounted at `minions.openclaw`
        return OpenClawPluginAPI(core)
