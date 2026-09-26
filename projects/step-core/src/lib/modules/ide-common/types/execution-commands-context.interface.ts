import { Execution, RepositoryObjectReference } from '../../../client/generated';
import { CustomFormComponent } from '../../custom-forms/components/custom-form/custom-form.component';
import { IncludeTestcases } from '../../execution-common/types/include-testcases.interface';

export interface ExecutionCommandsContext {
  getCustomForms(): CustomFormComponent | undefined;
  getDescription(): string | undefined;
  getRepositoryObjectRef(): RepositoryObjectReference | undefined;
  getIncludedTestcases(): IncludeTestcases | null | undefined;
  getExecution(): Execution | undefined;
  getExecutionParameters(): Record<string, string> | undefined;
  getIsExecutionIsolated(): boolean;
}
