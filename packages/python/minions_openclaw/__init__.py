"""
minions_openclaw - Python SDK for managing OpenClaw Gateway instances.

Note: This package uses internal stub types (_minions_stub) instead of the
PyPI 'minions' package, which is a different AI orchestration tool.
"""
from .types import (
    registry,
    openclaw_instance_type,
    openclaw_snapshot_type,
    openclaw_agent_type,
    openclaw_channel_type,
    openclaw_model_provider_type,
    openclaw_session_config_type,
    openclaw_gateway_config_type,
    openclaw_skill_type,
    openclaw_tool_config_type,
    openclaw_talk_config_type,
    openclaw_browser_config_type,
    openclaw_hook_type,
    openclaw_cron_job_type,
    openclaw_discovery_config_type,
    openclaw_identity_config_type,
    openclaw_canvas_config_type,
    openclaw_logging_config_type,
    openclaw_ui_config_type,
    ALL_TYPES,
)
from .instance_manager import InstanceManager
from .config_decomposer import ConfigDecomposer
from .snapshot_manager import SnapshotManager
from .gateway_client import GatewayClient
from ._minions_stub import (
    Minion,
    MinionType,
    Relation,
    FieldDefinition,
    ValidationError,
    ValidationResult,
    TypeRegistry,
    generate_id,
    now,
    create_minion,
    soft_delete,
)

__version__ = '0.1.0'
__all__ = [
    'registry',
    'openclaw_instance_type',
    'openclaw_snapshot_type',
    'openclaw_agent_type',
    'openclaw_channel_type',
    'openclaw_model_provider_type',
    'openclaw_session_config_type',
    'openclaw_gateway_config_type',
    'openclaw_skill_type',
    'openclaw_tool_config_type',
    'openclaw_talk_config_type',
    'openclaw_browser_config_type',
    'openclaw_hook_type',
    'openclaw_cron_job_type',
    'openclaw_discovery_config_type',
    'openclaw_identity_config_type',
    'openclaw_canvas_config_type',
    'openclaw_logging_config_type',
    'openclaw_ui_config_type',
    'ALL_TYPES',
    'InstanceManager',
    'ConfigDecomposer',
    'SnapshotManager',
    'GatewayClient',
    'Minion',
    'MinionType',
    'Relation',
    'FieldDefinition',
    'ValidationError',
    'ValidationResult',
    'TypeRegistry',
    'generate_id',
    'now',
    'create_minion',
    'soft_delete',
]
