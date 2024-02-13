import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { COMMON_IMPORTS } from '../../types/common-imports.constant';
import { TimeSeriesConfig } from '../../types/time-series/time-series.config';

const EMPTY_DIMENSIONS_LABEL = 'Empty';

@Component({
  selector: 'step-timeseries-grouping',
  templateUrl: './ts-grouping.component.html',
  styleUrls: ['./ts-grouping.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class TsGroupingComponent implements OnInit, OnChanges {
  readonly NO_GROUPING_OPTION = { label: 'Empty', attributes: [] };
  @Output() groupingChange = new EventEmitter<string[]>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;

  protected selectedGroupingInternal: { label: string; attributes: string[] } = {
    label: EMPTY_DIMENSIONS_LABEL,
    attributes: [],
  };

  @Input() dimensions: string[] = [];
  @Input() groupingOptions!: { label: string; attributes: string[] }[];

  label: string = EMPTY_DIMENSIONS_LABEL;

  customGroupingString = '';

  attributesLabelMappings: { [key: string]: string } = {
    name: 'Name',
    rnStatus: 'Status',
  };

  ngOnInit(): void {
    this.label = this.formatDimensions(this.dimensions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dimensions']) {
      this.label = this.formatDimensions(this.dimensions);
    }
    console.log('changes', this.groupingOptions);
  }

  selectGrouping(grouping: { label: string; attributes: string[] }) {
    this.selectedGroupingInternal = grouping;
    this.emitGroupingChange();
  }

  emitGroupingChange() {
    this.groupingChange.emit(this.selectedGroupingInternal.attributes);
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
    return dimensions?.map((d) => this.attributesLabelMappings[d] || d).join(', ') || EMPTY_DIMENSIONS_LABEL;
  }

  private extractDimensions(customGroupingString: string): string[] {
    return customGroupingString.split(',').map((x) => x.trim());
  }
}
