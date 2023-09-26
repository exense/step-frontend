import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TimeSeriesConfig } from '../../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'step-timeseries-grouping',
  templateUrl: './ts-grouping.component.html',
  styleUrls: ['./ts-grouping.component.scss'],
})
export class TsGroupingComponent implements OnInit {
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;

  protected selectedGroupingInternal: { label: string; attributes: string[] } = { label: '', attributes: [] };

  @Input() dimensions: string[] = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS[0].attributes;

  customGroupingString = '';
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;

  attributesLabelMappings: { [key: string]: string } = {
    name: 'Name',
    rnStatus: 'Status',
  };

  ngOnInit(): void {
    if (this.dimensions) {
      this.selectedGroupingInternal = { label: this.formatDimensions(this.dimensions), attributes: this.dimensions };
    } else {
      this.selectedGroupingInternal = this.groupingOptions[0];
    }
  }

  selectGrouping(grouping: { label: string; attributes: string[] }) {
    this.selectedGroupingInternal = grouping;
    this.emitGroupingChange();
  }

  emitGroupingChange() {
    this.onGroupingChange.emit(this.selectedGroupingInternal.attributes);
  }

  applyCustomGrouping() {
    if (this.customGroupingString) {
      let dimensions = this.extractDimensions(this.customGroupingString);
      this.selectedGroupingInternal = { label: this.formatDimensions(dimensions), attributes: dimensions };
      this.emitGroupingChange();
      this.matTrigger.closeMenu();
    }
  }

  private formatDimensions(dimensions: string[]): string {
    return dimensions.map((d) => this.attributesLabelMappings[d] || d).join(', ');
  }

  private extractDimensions(customGroupingString: string): string[] {
    return customGroupingString.split(',').map((x) => x.trim());
  }
}
