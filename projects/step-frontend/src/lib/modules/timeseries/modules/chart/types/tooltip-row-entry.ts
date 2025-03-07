import { Execution } from '@exense/step-core';
import { SeriesStroke } from '../../_common/types/time-series/series-stroke';
import { Observable } from 'rxjs';

export interface TooltipRowEntry {
  value: number;
  formattedValue?: string;
  name: string;
  stroke: SeriesStroke;
  executions?: string[];
  executionsFn?: Observable<Execution[]>;
  bold?: boolean;
  markerClassName?: string;
  isSummary?: boolean;
}
