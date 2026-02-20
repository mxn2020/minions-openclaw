from typing import Optional, List
from minions import Minions, MinionPlugin

from .plugin import OpenClawPlugin, OpenClawPluginAPI

class MinionsOpenClaw(Minions):
    """
    Standalone Central Client for the OpenClaw SDK.
    Inherits from `Minions` and automatically includes the `OpenClawPlugin`.
    """
    
    openclaw: OpenClawPluginAPI

    def __init__(self, plugins: Optional[List[MinionPlugin]] = None):
        if plugins is None:
            plugins = []
            
        # Ensure OpenClawPlugin is always included
        if not any(isinstance(p, OpenClawPlugin) for p in plugins):
            plugins.append(OpenClawPlugin())
            
        super().__init__(plugins=plugins)
