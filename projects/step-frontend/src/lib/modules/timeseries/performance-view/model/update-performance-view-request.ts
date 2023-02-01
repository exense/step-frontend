import { TSTimeRange } from '../../chart/model/ts-time-range';

export interface UpdatePerformanceViewRequest {
  updateRanger: boolean;
  updateCharts: boolean;
  showLoadingBar?: boolean;
}
