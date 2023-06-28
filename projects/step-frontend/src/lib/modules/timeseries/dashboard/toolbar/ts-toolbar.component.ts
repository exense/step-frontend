import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TimeSeriesContext } from '../../time-series-context';
import { switchMap, tap } from 'rxjs';
import { TableApiWrapperService, TimeSeriesService } from '@exense/step-core';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';
import { TimeRangePicker } from '../../time-selection/time-range-picker.component';

@Component({
  selector: 'step-timeseries-toolbar',
  templateUrl: './ts-toolbar.component.html',
  styleUrls: ['./ts-toolbar.component.scss'],
})
export class TsToolbarComponent {
  @Input() context!: TimeSeriesContext;
  @Input() timeRangeOptions!: TimeRangePickerSelection[];
  @Input() activeTimeRange!: TimeRangePickerSelection;

  @Output() onCompareModeEnabled = new EventEmitter<void>();
  @Output() onCompareModeDisabled = new EventEmitter<void>();

  exportInProgress = false;

  constructor(private _timeSeriesService: TimeSeriesService, private _tableApiService: TableApiWrapperService) {}

  handleGroupingChange(dimensions: string[]) {
    this.context.updateGrouping(dimensions);
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    // this.timeRangeSelection = selection;
    // this.dashboard.updateRange(this.calculateFullTimeRange(this.execution!));
  }

  handleCompareModeChange(enabled: boolean) {
    if (enabled) {
      this.onCompareModeEnabled.emit();
    } else {
      this.onCompareModeDisabled.emit();
    }
  }

  exportRawData() {
    if (this.exportInProgress) {
      return;
    }
    const filtersOql = this.context.buildActiveOQL(true, true);
    this.exportInProgress = true;
    this._timeSeriesService
      .getMeasurementsAttributes(filtersOql)
      .pipe(
        switchMap((fields) =>
          this._tableApiService.exportAsCSV('measurements', fields, { filters: [{ oql: filtersOql }] })
        ),
        tap(() => (this.exportInProgress = false))
      )
      .subscribe();
  }

  getValidFilters() {}
}
