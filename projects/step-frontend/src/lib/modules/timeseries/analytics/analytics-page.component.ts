import { AfterViewInit, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';
import { RelativeTimeSelection } from '../time-selection/model/relative-time-selection';
import { TimeSeriesConfig } from '../time-series.config';
import { TimeRangePickerSelection } from '../time-selection/time-range-picker-selection';
import { TimeSeriesDashboardComponent } from '../dashboard/time-series-dashboard.component';
import { RangeSelectionType } from '../time-selection/model/range-selection-type';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { TimeSeriesDashboardSettings } from '../dashboard/model/ts-dashboard-settings';

@Component({
  selector: 'step-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements OnInit {
  @ViewChild('dashboard') dashboard!: TimeSeriesDashboardComponent;
  dashboardSettings: TimeSeriesDashboardSettings | undefined;

  timeRangeOptions: RelativeTimeSelection[] = TimeSeriesConfig.SYNTHETIC_MONITORING_TIME_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = {
    type: RangeSelectionType.RELATIVE,
    relativeSelection: this.timeRangeOptions[0],
  };

  ngOnInit(): void {}

  onTimeRangeChange(selection: TimeRangePickerSelection) {
    this.timeRangeSelection = selection;
    this.dashboard.updateRange(this.calculateRange()); // instant call
  }

  calculateRange(): TSTimeRange {
    let now = new Date().getTime();
    let newFullRange: TSTimeRange;
    switch (this.timeRangeSelection.type) {
      case RangeSelectionType.FULL:
        throw new Error('Full range selection is not supported');
      case RangeSelectionType.ABSOLUTE:
        newFullRange = this.timeRangeSelection.absoluteSelection!;
        break;
      case RangeSelectionType.RELATIVE:
        let end = now;
        newFullRange = { from: end - this.timeRangeSelection.relativeSelection!.timeInMs!, to: end };
        break;
    }
    return newFullRange;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepAnalyticsPage', downgradeComponent({ component: AnalyticsPageComponent }));
