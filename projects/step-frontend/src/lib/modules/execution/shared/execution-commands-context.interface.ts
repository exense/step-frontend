import { CustomFormComponent, Execution, IncludeTestcases, RepositoryObjectReference } from '@exense/step-core';

export interface ExecutionCommandsContext {
  getCustomForms(): CustomFormComponent | undefined;
  getDescription(): string | undefined;
  getRepositoryObjectRef(): RepositoryObjectReference | undefined;
  getIncludedTestcases(): IncludeTestcases | null | undefined;
  getExecution(): Execution | undefined;
  getExecutionParameters(): Record<string, string> | undefined;
  getIsExecutionIsolated(): boolean;
}
