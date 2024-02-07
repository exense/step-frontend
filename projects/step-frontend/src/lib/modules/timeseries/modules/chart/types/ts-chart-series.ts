import { Series } from 'uplot';

export interface TSChartSeries extends Series {
  id: string;
  data: (number | null | undefined)[];
  metadata?: Record<string, any>[];
  legendName: string;
  labelItems: (string | undefined)[]; // can have multiple group dimensions
}
