import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TimeSeriesConfig } from '../../time-series.config';
import { MatMenuTrigger } from '@angular/material/menu';
import { isChildNodeOf } from '@angular-eslint/eslint-plugin-template/dist/eslint-plugin-template/src/utils/is-child-node-of';

const EMPTY_DIMENSIONS_LABEL = 'Empty';

@Component({
  selector: 'step-timeseries-grouping',
  templateUrl: './ts-grouping.component.html',
  styleUrls: ['./ts-grouping.component.scss'],
})
export class TsGroupingComponent implements OnInit, OnChanges {
  @Output() onGroupingChange = new EventEmitter<string[]>();

  @ViewChild('matTrigger') matTrigger!: MatMenuTrigger;

  protected selectedGroupingInternal: { label: string; attributes: string[] } = {
    label: EMPTY_DIMENSIONS_LABEL,
    attributes: [],
  };

  @Input() dimensions: string[] = [];

  label: string = EMPTY_DIMENSIONS_LABEL;

  customGroupingString = '';
  groupingOptions = TimeSeriesConfig.DEFAULT_GROUPING_OPTIONS;

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
    return dimensions?.map((d) => this.attributesLabelMappings[d] || d).join(', ') || EMPTY_DIMENSIONS_LABEL;
  }

  private extractDimensions(customGroupingString: string): string[] {
    return customGroupingString.split(',').map((x) => x.trim());
  }
}
