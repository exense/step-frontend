import { SeriesStroke } from '../../_common/types/time-series/series-stroke';

export interface TooltipRowEntry {
  value: number;
  name: string;
  stroke: SeriesStroke;
  executions?: string[];
  bold?: boolean;
}
