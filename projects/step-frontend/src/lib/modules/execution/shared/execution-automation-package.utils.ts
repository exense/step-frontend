import { AutomationPackageDescriptor, Execution } from '@exense/step-core';

export function isExecutionFromDifferentAutomationPackage(
  execution: Execution | null | undefined,
  currentPackage: AutomationPackageDescriptor | undefined,
): boolean {
  const packageName = execution?.executionParameters?.repositoryObject?.repositoryParameters?.['apName'];
  return !!packageName && packageName !== currentPackage?.name;
}
