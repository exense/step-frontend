import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { TimeSeriesConfig } from '../../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'step-timeseries-grouping',
  templateUrl: './ts-grouping.component.html',
  styleUrls: ['./ts-grouping.component.scss'],
})
export class TsGroupingComponent {
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;

  customGroupingString = '';
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;
  selectedGrouping = this.groupingOptions[0];

  emitGroupingChange() {
    this.onGroupingChange.emit(this.selectedGrouping.attributes);
  }

  applyCustomGrouping() {
    if (this.customGroupingString) {
      let dimensions = this.customGroupingString.split(',').map((x) => x.trim());
      this.selectedGrouping = { label: dimensions.join(', '), attributes: dimensions };
      this.emitGroupingChange();
      this.matTrigger.closeMenu();
    }
  }
}
