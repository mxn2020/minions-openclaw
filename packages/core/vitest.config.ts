import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run test files sequentially to avoid data.json conflicts
    // (InstanceManager and SnapshotManager share ~/.openclaw-manager/data.json)
    fileParallelism: false,
  },
});
