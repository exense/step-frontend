import { TableParameters } from '@exense/step-core';

export interface KeywordParameters extends TableParameters {
  readonly type: string;
  readonly eid?: string;
  readonly ancestorIds?: ReadonlyArray<string>;
  readonly enrichWithContributingErrors?: boolean;
}
