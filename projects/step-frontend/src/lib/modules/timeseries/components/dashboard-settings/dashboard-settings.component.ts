import { Component, input, Input, OnInit, Signal } from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesConfig,
  TimeSeriesContext,
  TsCompareModeSettings,
  TsFilteringMode,
  TsGroupingComponent,
} from '../../modules/_common';
import { Observable } from 'rxjs';
import { OQLVerifyResponse } from '@exense/step-core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-dashboard-settings',
  templateUrl: './dashboard-settings.component.html',
  styleUrls: ['./dashboard-settings.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, TsGroupingComponent],
})
export class DashboardSettingsComponent {
  context = input.required<TimeSeriesContext>();
  compareModeEnabled!: Signal<TsCompareModeSettings | undefined>;
  activeGrouping: string[] = [];
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
}
