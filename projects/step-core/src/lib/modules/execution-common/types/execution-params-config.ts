import { IncludeTestcases } from './include-testcases.interface';
import { RepositoryObjectReference } from '../../../client/step-client-module';

export interface ExecutionParamsConfig {
  simulate?: boolean;
  includeUserId?: boolean;
  includedTestCases?: IncludeTestcases;
  description?: string;
  repositoryObject?: RepositoryObjectReference;
  customParameters?: Record<string, string>;
  isolatedExecution?: boolean;
}
