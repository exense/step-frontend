import { Execution, Tab } from '@exense/step-core';

export interface ExecutionTab extends Tab {
  title?: string;
  active?: boolean;
  type?: 'list' | 'progress';
  execution?: Execution;
  subTab?: string;
}
