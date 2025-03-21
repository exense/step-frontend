import { Observable } from 'rxjs';

export interface TsTooltipOptions {
  enabled: boolean;
  useExecutionLinks?: boolean;
  fetchExecutionsFn?: (idx: number, seriesId: string) => Observable<string[]>;
  yAxisUnit?: string;
  zAxisUnit?: string;
  zAxisLabel?: string;
}
