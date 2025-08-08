const STATUS_PRIORITY: ReadonlyArray<string> = [
  'VETOED',
  'IMPORT_ERROR',
  'TECHNICAL_ERROR',
  'FAILED',
  'INTERRUPTED',
  'PASSED',
  'SKIPPED',
  'NORUN',
  'RUNNING',
];

export const chooseStatusWithMostPriority = <T extends string>(...statues: T[]): T | undefined => {
  const statusSet = new Set(statues);
  for (const status of STATUS_PRIORITY) {
    if (statusSet.has(status as T)) {
      return status as T;
    }
  }
  return statues[0];
};
