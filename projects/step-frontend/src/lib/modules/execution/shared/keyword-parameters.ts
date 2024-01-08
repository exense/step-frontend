import { TableParameters } from '@exense/step-core';

export interface KeywordParameters extends TableParameters {
  readonly type: string;
  readonly executionId?: string;
  readonly testcases?: ReadonlyArray<string>;
}
