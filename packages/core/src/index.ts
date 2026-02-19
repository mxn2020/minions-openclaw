export * from './types.js';
export { InstanceManager } from './InstanceManager.js';
export { ConfigDecomposer } from './ConfigDecomposer.js';
export type { OpenClawConfig, DecomposedConfig } from './ConfigDecomposer.js';
export { SnapshotManager } from './SnapshotManager.js';
export type { GatewaySnapshot } from './SnapshotManager.js';
export { GatewayClient } from './GatewayClient.js';
export type { GatewayPresence } from './GatewayClient.js';

export { generateId, now, SPEC_VERSION, validateField, validateFields, migrateMinion } from 'minions-sdk';
export type {
  Minion,
  MinionType,
  Relation,
  FieldDefinition,
  FieldType,
  RelationType,
  MinionStatus,
  MinionPriority,
  CreateMinionInput,
  UpdateMinionInput,
  ValidationError,
  ValidationResult,
} from 'minions-sdk';
