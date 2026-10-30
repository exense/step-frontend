import { TimeSeriesErrorEntry } from '@exense/step-core';

export interface ErrorSearchAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly isAvailable: () => boolean;
  readonly activate: (error: TimeSeriesErrorEntry) => void;
}
