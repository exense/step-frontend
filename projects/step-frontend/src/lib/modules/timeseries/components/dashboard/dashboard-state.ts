import { TimeSeriesContext } from '../../modules/_common';
import { QueryList } from '@angular/core';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { DashboardFilterBarComponent, PerformanceViewTimeSelectionComponent } from '../../modules/filter-bar';
import { Subscription } from 'rxjs';

export interface DashboardState {
  context: TimeSeriesContext;
  getDashlets: () => QueryList<ChartDashlet>;
  getFilterBar: () => DashboardFilterBarComponent;
  getRanger: () => PerformanceViewTimeSelectionComponent;
  refreshInProgress: boolean;
  refreshSubscription?: Subscription;
}
