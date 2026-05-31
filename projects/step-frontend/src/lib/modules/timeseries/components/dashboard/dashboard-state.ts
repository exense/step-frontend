import { TimeSeriesContext } from '../../modules/_common';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { DashboardFilterBarComponent, PerformanceViewTimeSelectionComponent } from '../../modules/filter-bar';
import { Subscription } from 'rxjs';

export interface DashboardState {
  context: TimeSeriesContext;
  getDashlets: () => ChartDashlet[];
  getFilterBar: () => DashboardFilterBarComponent;
  getRanger: () => PerformanceViewTimeSelectionComponent;
  lastChangeType: 'auto' | 'manual';
  refreshInProgress: boolean;
  refreshSubscription?: Subscription;
}
