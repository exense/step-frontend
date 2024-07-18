import { Series } from 'uplot';
import { SeriesStroke } from '../../_common/types/time-series/series-stroke';

export interface TSChartSeries extends Series {
  id: string;
  data: (number | null | undefined)[];
  stroke?: string | never;
  strokeConfig?: SeriesStroke;
  metadata?: Record<string, any>[];
  legendName?: string;
  labelItems: (string | undefined)[]; // can have multiple group dimensions
}
